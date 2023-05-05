const { openai_key } = require("../src-packed/secrets");
const { Configuration, OpenAIApi } = require("openai");

// A lot of this came from:
// https://github.com/openai/openai-node/issues/53#issuecomment-1517604780
const openai = new OpenAIApi(new Configuration({
  apiKey: openai_key,
  basePath: 'https://icropenaiservice.openai.azure.com/openai/deployments/icrgpt-35-turbo',
  baseOptions: {
    headers: {'api-key': openai_key },
    params: {
      // https://learn.microsoft.com/azure/cognitive-services/openai/reference#chat-completions
      'api-version': '2023-03-15-preview'
    }
  }
}));

describe('openai', () => {
    it('simple prompt', async () => {
        const response = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt: 'What is the meaning of life?',
          // 0 accurate, 1 creative
          temperature: 0.5
        });
        const result = response.data.choices[0].text;
        expect(result.length).to.not.be.equal(0);
    });
});