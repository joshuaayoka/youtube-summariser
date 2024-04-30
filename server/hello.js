const ytt = require('youtube-transcript')
const transcript = ytt.YoutubeTranscript.fetchTranscript("https://www.youtube.com/watch?v=QaNcP-WARt8").then(console.log)

// const ytt = require('./yt-transcript')
// const transcript = ytt.YoutubeTranscript.fetchTranscript("https://www.youtube.com/watch?v=QaNcP-WARt8").then(console.log)
