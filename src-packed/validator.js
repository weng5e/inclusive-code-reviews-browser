// packed/validator.js returns a data structure that background/validator.js expects

// NOTE: These values were from the original extension, we can repurpose to display different colors
const ISSUE_TYPE_PURPLE = "style";
const NEGATIVE_SENTIMENT_THRESHOLD = 0.6;
const suggestions = require('./suggestions');
const textAnalytics = require('./textAnalytics');
const endpoint = "https://app-rel.wus3.sample-dev.azgrafana-test.io/api/CommentRewrite";
var _appinsights = null;
var pastErrorCount = 0; // Number of problems found in the past text

// Load appinsights lazily, so we aren't tracking until this method is called
function getAppInsights() {
    if (!_appinsights) _appinsights = require('./appinsights');
    return _appinsights;
}

export async function getOpenAISuggestions(sentence) {
    var appinsights = getAppInsights();
    appinsights.trackEvent('askAI');

    let request = {
        "comment": sentence.text,
        // 0 accurate, 1 creative
        "temperature": 0.5,
        // prevent the model from repeating itself without sacrificing quality of response
        "frequencyPenalty": 1.0,
        "maxTokens": 800,
        "enableJsonMode": true
    };

    if (globalThis.OpenAISeed) {
        request["seed"] = globalThis.OpenAISeed;
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-AppInsights-UserId': appinsights.getUserId()
        },
        body: JSON.stringify(request),
    }).then(response => response.json());

    let json = response.choices[0].message.content;
    console.log('OpenAI response: ' + json);
    let result = JSON.parse(json);
    if (result.suggestions) {
        result = result.suggestions;
    }
    var replacements = [];
    result.forEach(r => replacements.push({
        // There may be numbered lists, ChatGPT loves them
        value: r.trim().replace(/^\d\.\s*/, '')
    }));
    return {
        "message": "This phrase could be considered negative. Would you like to rephrase?",
        "shortMessage": "Negative sentiment",
        "offset": sentence.offset,
        "length": sentence.length,
        "rule": { "id": "NON_STANDARD_WORD", "subId": "1", "description": "Negative word", "issueType": ISSUE_TYPE_PURPLE, "category": { "id": "TYPOS", "name": "Negative word" } },
        "replacements": replacements,
        "type": { "typeName": "Other" },
        "ignoreForIncompleteSentence": false,
        "contextForSureMatch": 7
    };
}

export async function getMatches(ort, text, matches) {
    ort.env.wasm.numThreads = 1;

    // Suggestions, based on a dictionary
    suggestions.getSuggestions(text).forEach(suggestion => {
        getAppInsights().trackEvent('negativeWord');

        matches.push({
            "message": "This word has a negative connotation. Did you want to use a different word?",
            "shortMessage": "Negative word",
            "offset": suggestion.index,
            "length": suggestion.length,
            "rule": { "id": "NON_STANDARD_WORD", "subId": "1", "description": "Negative word", "issueType": ISSUE_TYPE_PURPLE, "category": { "id": "TYPOS", "name": "Negative word" } },
            "replacements": suggestion.replacements,
            "type": { "typeName": "Other" },
            "ignoreForIncompleteSentence": false,
            "contextForSureMatch": 7
        });
    });

    // Calls our ML model
    const result = await textAnalytics.analyzeSentiment(ort, text);
    if (result.error !== undefined) {
        console.log(result.error);
        return;
    }
    for (const sentence of result.sentences) {
        if (sentence.sentiment !== "negative")
            continue;
        console.log(`Index: ${sentence.offset}, Negative sentiment: ${sentence.confidenceScores.negative}`)
        if (sentence.confidenceScores.negative <= NEGATIVE_SENTIMENT_THRESHOLD)
            continue;

        getAppInsights().trackEvent('negativeSentence', sentence.confidenceScores);

        matches.push({
            "message": "This phrase could be considered negative. Would you like to rephrase?",
            "shortMessage": "Negative sentiment",
            "offset": sentence.offset,
            "length": sentence.length,
            "rule": { "id": "NON_STANDARD_WORD", "subId": "1", "description": "Negative word", "issueType": ISSUE_TYPE_PURPLE, "category": { "id": "TYPOS", "name": "Negative word" } },
            // Stuff that has to be filled out
            "replacements": [],
            "type": { "typeName": "Other" },
            "ignoreForIncompleteSentence": false,
            "askAnAI": true,
            "contextForSureMatch": 7
        });
    };

    // Check if the comment is too short
    var minLength = typeof config != "undefined" ? config.MIN_REVIEW_LENGTH : 9;
    if (text.length < minLength)
    {
        if (ignorableBriefPhraseRegex.test(text))
            return matches; // return an empty list early

        getAppInsights().trackEvent('tooShort');
        matches.push({
            "message": "This comment is too brief. Could you elaborate?",
            "shortMessage": "Comment is brief",
            "offset": 0,
            "length": text.length,
            "rule": { "id": "NON_STANDARD_WORD", "subId": "1", "description": "Negative word", "issueType": ISSUE_TYPE_PURPLE, "category": { "id": "TYPOS", "name": "Small text" } },
            "replacements": [],
            "type": { "typeName": "Other" },
            "ignoreForIncompleteSentence": false,
            "contextForSureMatch": 7
        });

        return matches;
    }

    // 'manualFix' event
    if (shouldReportManualFix(matches)) {
        getAppInsights().trackEvent('manualFix');
    }
}

/*
    Contains a list of brief phrases that can be ignored.
    Be conscientious when adding new items, as we don't want to filter out generic words/phrases that could be improved with further explanation.
*/
var ignorableBriefPhraseRegex = new RegExp('^\/|fixes #|implements #', 'i');

// clears the state of 'pastErrorCount'
export function clearState() {
    pastErrorCount = 0;
}

// Sends the 'appliedSuggestion' event and clears the state of 'pastErrorCount'
export function appliedSuggestion(appliedSuggestions) {
    clearState();
    getAppInsights().trackEvent('appliedSuggestion', { total: appliedSuggestions });
}

// Returns true if the 'manualFix' event should be sent
export function shouldReportManualFix(matches) {
    if (matches) {
        if (pastErrorCount > matches.length) {
            pastErrorCount = matches.length;
            return true;
        } else {
            pastErrorCount = matches.length;
        }
    } else {
        pastErrorCount = 0;
    }
    return false;
}

// For use inside the extension (which isn't using webpack)
// The best I came up with for now is to add this function to globalThis.
// https://developer.mozilla.org/en-US/docs/Glossary/Global_object
globalThis.getMatches = getMatches;
globalThis.getOpenAISuggestions = getOpenAISuggestions;
globalThis.appliedSuggestion = appliedSuggestion;
globalThis.getAppInsights = getAppInsights;
