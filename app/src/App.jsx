// Import useState and useEffect
import { useEffect, useState, useRef } from "react";
import Summary from "./components/Summary";
import Button from "./components/Button";
import Sidebar from "./components/Sidebar";
import "./App.css";
import { nanoid } from "nanoid";

export default function App() {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState({
     id: "",
     title: "", 
     text: "",
     date: "",
     time: ""
  });
  const [sidebarToggled, setSidebarToggled] = useState(false);
  const [summaries, setSummaries] = useState(() => JSON.parse(localStorage.getItem("summaries")) || [])
  const [currentSummaryId, setCurrentSummaryId] = useState(
    (summaries[0] && summaries[0].id) || ""
  )
  
  console.log("render")

  // for clicking off sidebar
  const sidebarRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (sidebarRef.current) {
        if (
          !e.target.classList.contains('sidebar') &&
          !e.target.classList.contains('sidebar-toggle')){
          setSidebarToggled(false)
        }
      }
    }

    document.addEventListener("click", handler);

    return () => {
      document.removeEventListener("click", handler)
    }
  })

  // for saving to local storage

  useEffect(() => {
    localStorage.setItem("summaries", JSON.stringify(summaries))
    console.log("saved")
  }, [summaries])

  // for obtaining from local storage

  // useEffect(() => {
  //   setSummaries(() => JSON.parse(localStorage.getItem("summaries")) || [])
  // }, [])

  function createSummary(videoDetails, summaryText) {
    const newSummary = {
      id: nanoid(),
      title: videoDetails.title,
      creator: videoDetails.title,
      text: summaryText,
      date: "",
      time: ""
    }
    setSummary(newSummary)
    setSummaries([newSummary, ...summaries])
  }

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
      createSummary({ title: data.title, creator: data.creator }, data.promptOutput)
    } catch (error) {
      console.error("Error sending URL:", error);
      // Handle error, e.g., display an error message to the user
    }
  }

  function handleSidebarClick() {
    sidebarToggled ? 
    setSidebarToggled(false) :
    setSidebarToggled(true)
  }

  // function getSummaryTitles() {
  //   console.log(summaries)
  //   const titles = summaries.map( summary => summary.title)
  //   return titles
  //   //console.log(titles)
  // }

  return (
    <div className="app-container">
      <nav className="nav">
        <div className="nav-items">
          <Button
            className="sidebar-toggle"
            text="Prev"
            handleClick={handleSidebarClick}
          />
        </div>
      </nav>
      <header className="header">
        <h1 className="app-heading">
          <span className="heading1">YT </span>
          <span className="heading2">Summariser</span>
        </h1>
      </header>
      <Sidebar
        sidebarRef={sidebarRef}
        sidebarToggled={sidebarToggled}
        // titles={getSummaryTitles()}
        summaries={summaries}
      />
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
            {/* {summary.title && (
              <div id="info">
                
              </div>
            )} */}

            
              {summary.text && 
                <Summary 
                  summary={summary}
                />
            
            }
          </div>
        </div>
      </main>
    </div>
  );
}
