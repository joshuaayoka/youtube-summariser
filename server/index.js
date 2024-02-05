// server.js

const express = require('express');
const cors = require('cors');
const ytt = require('youtube-transcript');
const ytdl = require('ytdl-core');

const app = express();
const port = 4000; // or any port of your choice

app.use(cors());

// Function to convert transcript into regular text
function convertToRegularText(transcript) {
  return transcript.map((item) => item.text).join(' ');
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

    // Send the response with video details and transcript
    res.json({ title, creator, regularText });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
