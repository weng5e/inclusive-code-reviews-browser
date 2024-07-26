/*! (C) Copyright 2020 LanguageTooler GmbH. All rights reserved. */
const config = {
    DICTIONARY_SYNC_INTERVAL: 72e5,
    RENDER_INTERVAL: 300,
    TOOLBAR_DECREASE_SIZE_INTERVAL: 900,
    VALIDATION_REQUEST_TIMEOUT: 5e4,
    INSTALL_URL: "https://languagetool.org/webextension/install",
    MAIN_SERVER_URL: "https://api.languagetool.org/v2",
    LOCAL_SERVER_URL: "http://localhost:8081/v2",
    FEEDBACK_SERVER_URL: "https://languagetool.org/send-feedback/",
    CLIENT_LOGIN_URL: "https://languagetool.org/client-login",
    SWITCH_TO_FALLBACK_SERVER_ERRORS: [502, 503, 504],
    MAIN_SERVER_RECHECK_INTERVAL: 18e5,
    MIN_TEXT_LENGTH: 5,
    MAX_TEXT_LENGTH: 1e4,
    MAX_TEXT_LENGTH_PREMIUM: 6e4,
    MAX_TEXT_LENGTH_CUSTOM_SERVER: Number.MAX_SAFE_INTEGER,
    PARTIAL_VALIDATION_CHUNK_LENGTH: 5e3,
    VALIDATION_DELAY: 1400,
    VALIDATION_MAX_DELAY: 3500,
    STOPPED_TYPING_TIMEOUT: 2250,
    COLORS: {
        GRAMMAR: { UNDERLINE: "#f2b24c", BACKGROUND: "rgba(242,179,77,0.3)", EMPHASIZE: "rgba(241,179,76,0.1)", TITLE: "#D2A013" },
        STYLE: { UNDERLINE: "#D2CBFF", BACKGROUND: "rgba(210,203,255,0.2)", EMPHASIZE: "rgba(210,203,255,0.1)", TITLE: "#5C4CFF" },
        LONG_SENTENCE: { UNDERLINE: "#D2CBFF", BACKGROUND: "rgba(210,203,255,0.2)", EMPHASIZE: "rgba(210,203,255,0.1)", TITLE: "#5C4CFF" },
        SPELLING: { UNDERLINE: "#EB5757", BACKGROUND: "rgba(235,88,88,0.2)", EMPHASIZE: "rgba(239,88,88,0.1)", TITLE: "#F91A47" },
        SYNONYMS: { UNDERLINE: "#0042d7" },
    },
    MAX_FIXES_COUNT: 5,
    MAX_EXCEPTION_COUNT: 10,
    MAX_USAGE_COUNT_ONBOARDING: 5,
    SUPPORTED_SYNONYM_LANGUAGES: ["de", "ru", "sv", "pt", "el", "en", "eo", "it", "fr", "es", "uk", "sk", "sl", "pl", "da", "ro", "nl", "ca"],
    COUPON_INTERVAL: 5184e6,
    PACKAGE: { BASIC: "Basic", PREMIUM: "Premium" },
    //these options is for inclusive reviews extension
    MIN_REVIEW_LENGTH: 9,
};
