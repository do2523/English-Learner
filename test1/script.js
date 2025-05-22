const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const fs = require("fs");
const { transcribeFile } = require("./transcribe");

const app = express();
app.use(cors()); // allow frontend requests

const upload = multer({ storage: multer.memoryStorage() });

const storage = new Storage({ keyFilename: "credentials.json" });
const bucket = storage.bucket("voicebucket-311");
const folderPrefix = "audio/"; // GCS "folder" prefix

// app.use(express.static(__dirname));

// Endpoint triggered by button

app.post("/transcribe", async (req, res) => {
  try {
    // List files from GCS "audio/" folder
    const [files] = await storage.bucket("voicebucket-311").getFiles({
      prefix: folderPrefix,
    });

    // Filter .webm files
    const mp3files = files.filter((file) => file.name.endsWith(".mp3"));

    // Transcribe each one
    arr = [];
    for (const file of mp3files) {
      const gcsUri = `gs://${"voicebucket-311"}/${file.name}`;
      transcription = await transcribeFile(gcsUri);
      arr.push(transcription);
    }
    console.log(arr);
    res.json(arr);
  } catch (err) {
    console.error("Error during transcription:", err);
    res.status(500).send("Failed to process files.");
  }
});

app.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    const blob = bucket.file(`audio/${Date.now()}_${req.file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: req.file.mimetype,
    });

    blobStream.on("error", (err) => {
      console.error("BlobStream error:", err);
      res.status(500).send("Error uploading to GCS");
    });

    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).send({ url: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send("Server error");
  }
});

app.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
