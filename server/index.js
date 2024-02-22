// server.js

const express = require('express');
const cors = require('cors');
const ytt = require('youtube-transcript');
const ytdl = require('ytdl-core');
const openAI = require("openai");
const fs = require("fs")

const app = express();
const port = 4000; // or any port of your choice

const openai = new openAI.OpenAI({apiKey: process.env.OPENAI_API_KEY})

app.use(cors());


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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
