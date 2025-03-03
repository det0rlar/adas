import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import multer from "multer";
import { AssemblyAI } from "assemblyai";
import ytdl from "ytdl-core";
import PDFDocument from "pdfkit";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Hard-coded API key for AssemblyAI (replace with your actual key)
const ASSEMBLYAI_API_KEY = "a01bc91e8a9f4e92b1560a460f33d982";
const assemblyaiClient = new AssemblyAI({ apiKey: ASSEMBLYAI_API_KEY });

const processYouTubeVideo = async (url) => {
  const audioPath = `uploads/${Date.now()}-youtube.mp3`;
  await new Promise((resolve, reject) => {
    ytdl(url, { filter: "audioonly" })
      .pipe(fs.createWriteStream(audioPath))
      .on("finish", resolve)
      .on("error", reject);
  });
  return audioPath;
};

const languagePDFTitleMap = {
  English: "Event Transcript",
  Yoruba: "Itumọ́ Ayẹyẹ",
  Arabic: "نص الحدث",
  Spanish: "Transcripción del Evento",
  French: "Transcription de l'Événement",
};

app.post("/api/summarize", upload.single("file"), async (req, res) => {
  try {
    let audioPath;
    if (req.file) {
      // Accept only audio files
      if (!req.file.mimetype.startsWith("audio/")) {
        return res
          .status(400)
          .json({ error: "Only audio files are accepted." });
      }
      audioPath = req.file.path;
    } else if (req.body.url && ytdl.validateURL(req.body.url)) {
      audioPath = await processYouTubeVideo(req.body.url);
    } else {
      return res.status(400).json({ error: "No file or valid URL provided." });
    }

    const language = req.body.language || "English";

    // Use AssemblyAI to transcribe the audio file
    const transcript = await assemblyaiClient.transcripts.transcribe({
      audio: audioPath,
    });
    if (!transcript.text) throw new Error("Transcription failed");

    // Use the transcript text directly (removing OpenAI summarization)
    const transcriptText = transcript.text;

    // Create a PDF with the transcript text
    const doc = new PDFDocument();
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=transcript.pdf",
      });
      res.send(pdfData);
    });
    const pdfTitle = languagePDFTitleMap[language] || "Event Transcript";
    doc.fontSize(20).text(pdfTitle, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(transcriptText);
    doc.end();

    // Clean up the uploaded file
    [audioPath, req.file?.path].forEach((p) => p && fs.unlinkSync(p));
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message || "Processing failed" });
  }
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
