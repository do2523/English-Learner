const speech = require("@google-cloud/speech");
const client = new speech.SpeechClient();
async function transcribeFile(gcsUri) {
  const audio = { uri: gcsUri };
  const config = {
    encoding: "MP3",
    sampleRateHertz: 16000,
    languageCode: "en-US",
  };
  const request = { audio, config };

  try {
    const [response] = await client.recognize(request);
    const results = response.results;

    const lastTranscript =
      results.length > 0
        ? results[results.length - 1].alternatives[0].transcript
        : "";

    console.log(`API Call: Last transcription for ${gcsUri}:`);
    console.log(lastTranscript);
    return lastTranscript;
  } catch (err) {
    console.error(`Error transcribing ${gcsUri}:`, err.message);
  }
}

module.exports = { transcribeFile };
