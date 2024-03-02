// Import useState and useEffect
import { useState } from "react";
import { Summary } from "./components/Summary";
import { ListButton } from "./components/ListButton";
import { Button } from "./components/Button";
import "./App.css"

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
    <div className="app-container">
      <navbar className="nav">
        <div className="nav-items">
          <Button
            text="Hello"
          />
          <ListButton />
        </div>
      </navbar>
      <header className="header">
        <h1 className="app-heading">
          <span className="heading1">YT </span>
          <span className="heading2">Summariser</span>
        </h1>
      </header>
      <main>
        <div className="app">
          <div className="url-entry">
            <form 
              onSubmit={handleSubmit} 
              className="url-form"
            >
              <input
                className="input-url"
                placeholder="Enter URL"
                onChange={handleChange}
              />
              <button className="submit-url" type="submit">Search</button>
            </form>
          </div>
          <div className="info">
            {videoDetails.title && (
              <div id="info">
                {/* <h2>Video Details:</h2> */}
                <p className="video-title">Title: {videoDetails.title}</p>
                <p>Creator: {videoDetails.creator}</p>
              </div>
            )}

            {/* {transcript && (
              <div id="info">>
                <h2>Transcript:</h2>
                <p>{transcript}</p>
              </div>
            )} */}
            {summary && <div id="info">
              {summary && 
                <Summary 
                  summary={summary}
                />
              }
            </div>
            }
          </div>
        </div>
      </main>
    </div>
  );
}
