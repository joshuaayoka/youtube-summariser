// server.js

const express = require('express');
const cors = require('cors');
const ytt = require('youtube-transcript');
const ytdl = require('ytdl-core');
const openAI = require("openai");
const fs = require("fs");
const multer = require('multer'); // For handling file uploads
const { PDFDocument } = require('pdf-lib'); // For extracting text from PDFs
const mammoth = require('mammoth'); // For extracting text from .docx files
const pdfParse = require('pdf-parse'); // For extracting text from PDFs

const app = express();
const port = 4000; // or any port of your choice

const openai = new openAI.OpenAI({apiKey: process.env.OPENAI_API_KEY})

app.use(cors());

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Files are temporarily stored in the "uploads" folder

// Function to convert transcript into regular text
function convertToRegularText(transcript) {
  return transcript.map((item) => item.text).join(' ');
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
  const prompt = task.concat(transcriptContent)

  const completion = await openai.chat.completions.create({
      messages: [{
        role: "system",
        content: prompt
      }],
      model: "gpt-3.5-turbo",
    });

  //const message = extractMessageContent(completion.choices)
  const arr = extractSubtitlesAndContent(completion.choices)

  return arr
}

// Define a route to handle transcript retrieval
app.get('/transcript', async (req, res) => {
  try {
    const videoUrl = req.query.url; // Assuming the URL is passed as a query parameter

    // Fetch the transcript
    const transcript = await ytt.YoutubeTranscript.fetchTranscript(videoUrl);

    // Fetch video details using ytdl-core
    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title;
    const creator = info.videoDetails.author.name;

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
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
