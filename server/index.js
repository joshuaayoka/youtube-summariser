// server.js

const express = require('express');
const cors = require('cors');
const { fetchTranscript } = require('youtube-transcript-plus');
const { Innertube } = require('youtubei.js');
const openAI = require("openai");
const fs = require("fs");
const multer = require('multer'); // For handling file uploads
const mammoth = require('mammoth'); // For extracting text from .docx files
const pdfParse = require('pdf-parse'); // For extracting text from PDFs
const path = require('path');
const dotenv = require('dotenv').config({ path: path.join(__dirname, '.env.local') });


const app = express();
const port = 4000; // or any port of your choice

const openai = new openAI.OpenAI();

app.use(cors());

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Files are temporarily stored in the "uploads" folder

// Function to convert transcript into regular text
function convertToRegularText(transcript) {
  return transcript.map((item) => item.text).join(' ');
}

// Lazily-initialized, cached Innertube client (used for video metadata only)
let innertubePromise;
function getInnertube() {
  if (!innertubePromise) {
    innertubePromise = Innertube.create({ lang: 'en', location: 'US', retrieve_player: false });
  }
  return innertubePromise;
}

// Extract the 11-character YouTube video ID from a URL, or pass through a bare ID
function extractVideoId(input) {
  const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/);
  if (match) return match[1];
  if (/^[\w-]{11}$/.test(input)) return input;
  return null;
}

function extractMessageContent(output) {
  if (output && Array.isArray(output) && output.length > 0) {
    const firstMessage = output[0].message;
    if (firstMessage && firstMessage.content) {
      return firstMessage.content;
    }
  }
  return null; // Return null if the structure doesn't match expectations
}

function extractSubtitlesAndContent(output) {
  if (output && Array.isArray(output) && output.length > 0) {
    const firstMessage = output[0].message;
    if (firstMessage && firstMessage.content) {
      const paragraphs = firstMessage.content.split('\n\n');
      return paragraphs.map(paragraph => {
        const [subtitle, ...contentLines] = paragraph.split('\n');
        const content = contentLines.join(' ');
        return { subtitle, content };
      });
    }
  }
  return null; // Return null if the structure doesn't match expectations
}

async function runPrompt(task, transcriptContent) {
  const MAX_LENGTH = 15000;
  const truncatedContent = transcriptContent.substring(0, MAX_LENGTH);
  const prompt = task.concat(truncatedContent);

  const completion = await openai.chat.completions.create({
      messages: [{
        role: "system",
        content: prompt
      }],
      model: "gpt-4.1-nano",
    });

  const arr = extractSubtitlesAndContent(completion.choices);

  return arr;
}

// Define a route to handle transcript retrieval
app.get('/transcript', async (req, res) => {
  try {
    const videoUrl = req.query.url; // Assuming the URL is passed as a query parameter

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ error: 'Could not parse a YouTube video ID from that URL' });
    }

    // Fetch the transcript
    const transcript = await fetchTranscript(videoId);

    // Fetch video details
    const yt = await getInnertube();
    const info = await yt.getBasicInfo(videoId);
    const title = info.basic_info.title;
    const creator = info.basic_info.author;

    // Convert the transcript into regular text
    const regularText = convertToRegularText(transcript);

    const task = fs.readFileSync("task.txt", "utf8", (err, data) => {
      console.log(data);
    })

    const promptOutput = await runPrompt(task, regularText);

    // Send the response with video details and transcript
    res.json({ title, creator, regularText, promptOutput });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


async function extractTextFromPDF(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(fileBuffer);
  return data.text; // Returns the extracted text
}

// Function to extract text from .docx files
async function extractTextFromDocx(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer: fileBuffer });
  return result.value;
}

// Function to extract text from .txt files
const extractTextFromTxt = (filePath) => {
  return fs.readFileSync(filePath, 'utf8');
};

// Route to handle document uploads and text extraction
app.post('/upload-document', upload.single('file'), async (req, res) => {
  try {
      const file = req.file;

      if (!file) {
          return res.status(400).json({ error: 'No file uploaded' });
      }

      let extractedText = '';
      const fileExtension = file.originalname.split('.').pop().toLowerCase();

      // Extract text based on file type
      if (fileExtension === 'pdf') {
          extractedText = await extractTextFromPDF(file.path);
      } else if (fileExtension === 'docx') {
          extractedText = await extractTextFromDocx(file.path);
      } else if (fileExtension === 'txt') {
          extractedText = await extractTextFromTxt(file.path);
      } else {
          fs.unlinkSync(file.path);
          return res.status(400).json({ error: 'Unsupported file format' });
      }

      // Run OpenAI prompt on the extracted text
      const task = fs.readFileSync("task.txt", "utf8");
      const promptOutput = await runPrompt(task, extractedText);

      // Remove the uploaded file from the server after processing
      fs.unlinkSync(file.path);

      res.json({ extractedText, promptOutput });
  } catch (error) {
      console.error('Error processing document:', error);
      // Clean up the temp file if it's still on disk (e.g. extraction failed)
      if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});