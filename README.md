# YT Summariser
YT Summariser is a web application made with React and Express that generates summaries of YouTube videos and documents.
The application allows users to input a YouTube video URL or upload a document, and then provides an AI-created summary.
The project is designed to help users quickly extract key information from videos or text documents without needing to watch a full video or read through a full document.

## Features
- Summarise a YouTube video by pasting its URL, or summarise a document by uploading a `.pdf`, `.docx`, or `.txt` file
- AI-generated summaries, structured into numbered sections
- Video summaries show the title, creator, and an embedded player alongside the summary
- Summary history saved in the browser, viewable and deletable from the sidebar
- Download any summary as a `.txt` file

## Tech stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **AI summarisation:** OpenAI API
- **YouTube data:** youtube-transcript-plus, youtubei.js
- **Document parsing:** pdf-parse (PDF), mammoth (DOCX)

## Prerequisites
- [Node.js](https://nodejs.org/) and npm installed
- An [OpenAI API key](https://platform.openai.com/api-keys)

## Setup
Install dependencies for both the server and the app:
```
cd server
npm install
```
```
cd app
npm install
```

Then create a `server/.env.local` file with your OpenAI API key:
```
OPENAI_API_KEY=your_key_here
```

## To run the app
In a terminal, in the `/server` directory, run:
```
node index.js
```
This starts the backend at `http://localhost:4000`.

In another terminal, in the `/app` directory, run:
```
npm run dev
```
This starts the frontend at `http://localhost:5173`.

## Usage
1. Open `http://localhost:5173` in your browser.
2. Choose **YouTube** or **Document** mode.
3. Paste a YouTube video URL, or upload a `.pdf`, `.docx`, or `.txt` file.
4. View the generated summary, download it as a `.txt` file, or revisit past summaries from the sidebar.

## Notes
- Video/document content is truncated to 15,000 characters before being summarised.
- There is no login or server-side database - summaries are stored only in your browser and uploaded files are deleted from the server after processing.
