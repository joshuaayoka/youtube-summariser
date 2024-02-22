// Import useState and useEffect
import { useState } from "react";
import { Summary } from "./components/Summary";

export default function App() {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [videoDetails, setVideoDetails] = useState({ title: "", creator: "" });
  const [summary, setSummary] = useState("")

  function handleChange(event) {
    const { value } = event.target;
    setUrl(value);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    console.log(url);
    await sendURL();
  }

  async function sendURL() {
    try {
      const response = await fetch(`http://localhost:4000/transcript?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      const data = await response.json();
      setTranscript(data.regularText);
      setVideoDetails({ title: data.title, creator: data.creator });
      setSummary(data.promptOutput)
    } catch (error) {
      console.error("Error sending URL:", error);
      // Handle error, e.g., display an error message to the user
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          className="input-url"
          placeholder="url"
          onChange={handleChange}
        />
        <button className="submit-url" type="submit">Submit</button>
      </form>

      {videoDetails.title && (
        <div>
          <h2>Video Details:</h2>
          <p>Title: {videoDetails.title}</p>
          <p>Creator: {videoDetails.creator}</p>
        </div>
      )}

      {transcript && (
        <div>
          <h2>Transcript:</h2>
          <p>{transcript}</p>
        </div>
      )}

      {summary && 
        <Summary 
          summary={summary}
        />
      }

      {/* {summary && (
        <div>
          <h2>Summary:</h2>
          <p>{summary}</p>
        </div>
      )} */}
    </div>
  );
}
