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
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");
    console.log(`API Call: Transcription for ${gcsUri}:`);
    return transcription;
  } catch (err) {
    console.error(`Error transcribing ${gcsUri}:`, err.message);
  }
}

module.exports = { transcribeFile };
