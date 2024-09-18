// Import useState and useEffect
import { useEffect, useState, useRef } from "react"
import Summary from "./components/Summary"
import Sidebar from "./components/Sidebar"
import "./App.css"
import { nanoid } from "nanoid"

// Enum
const Mode = Object.freeze({
  YOUTUBE: "youtube",
  DOCUMENT: "document",
})

export default function App() {
  const [url, setUrl] = useState("")
  const [transcript, setTranscript] = useState("")
  const [sidebarToggled, setSidebarToggled] = useState(false)
  const [summaries, setSummaries] = useState(() => JSON.parse(localStorage.getItem("summaries")) || [])
  const [currentSummaryId, setCurrentSummaryId] = useState(
    (summaries[0] && summaries[0].id) || ""
  )
  const [mode, setMode] = useState(Mode.YOUTUBE)

  const [uploadedFile, setUploadedFile] = useState(null)

  // for clicking off sidebar
  const sidebarRef = useRef(null)

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

    document.addEventListener("click", handler)

    return () => {
      document.removeEventListener("click", handler)
    }
  })

  // for saving to local storage

  useEffect(() => {
    localStorage.setItem("summaries", JSON.stringify(summaries))
  }, [summaries])


  function createSummary(videoDetails, summaryText) {
    const id = nanoid()
    const datetime = getCurrentDateTime()
    const videoId = getYouTubeVideoId(url)

    const newSummary = {
      type: Mode.YOUTUBE,
      id: id,
      title: videoDetails.title,
      creator: videoDetails.creator,
      text: summaryText,
      date: datetime.date,
      time: datetime.time,
      videoId: videoId,
    }
    setSummaries([newSummary, ...summaries])
    setCurrentSummaryId(id)
  }

  function createDocumentSummary(summaryText) {
    const id = nanoid()
    const datetime = getCurrentDateTime()

    const newSummary = {
      type: Mode.DOCUMENT,
      id: id,
      text: summaryText,
      date: datetime.date,
      time: datetime.time,
    }
    setSummaries([newSummary, ...summaries])
    setCurrentSummaryId(id)
  }
  
  // gets the current date and time and returns as object literal
  function getCurrentDateTime() {
    const currentDate = new Date()
    
    const formattedDate = currentDate.toLocaleDateString()
    const formattedTime = currentDate.toLocaleTimeString()
  
    return {
      date: formattedDate,
      time: formattedTime
    }
  }  

  function handleChange(event) {
    const { value } = event.target
    setUrl(value)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await sendURL()
  }

  /*
   * Sends the url that the user inputted to the server to obtain data and return back to client side 
   */
  async function sendURL() {
    try {
      const response = await fetch(`http://localhost:4000/transcript?url=${encodeURIComponent(url)}`)
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`)
      }

      const data = await response.json()
      setTranscript(data.regularText)
      createSummary({ title: data.title, creator: data.creator }, data.promptOutput)
    } catch (error) {
      console.log("Error sending URL:", error)
    }
  }

  function handleSidebarClick() {
    sidebarToggled ? 
    setSidebarToggled(false) :
    setSidebarToggled(true)
  }

  function findCurrentSummary() {
    return summaries.find(summary => {
        return summary.id === currentSummaryId
    }) || summaries[0]
  }

  function deleteSummary(event, id) {
    event.stopPropagation()
    setSummaries(oldSummaries => oldSummaries.filter(summaryToDelete => summaryToDelete.id !== id))

    if (currentSummaryId == id) {
      summaries.length > 0 ? setCurrentSummaryId(summaries[0].id) : setCurrentSummaryId("") 
    }
  }

  function handleDownload(summaryData, summaryName) {
    const blob = new Blob([summaryData], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', summaryName)

    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  function switchMode(newMode) {
    if (Object.values(Mode).includes(newMode)) {
      setMode(newMode);
    } else {
      console.error("Invalid mode:", newMode);
    }
  }

  function handleDocumentUpload(event) {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  }

  function getYouTubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
  
    if (match && match[2].length === 11) {
      return match[2];
    } else {
      return null; // Invalid or no YouTube video ID found
    }
  }

  async function handleDocumentSubmit(event) {
    event.preventDefault();
  
    if (uploadedFile) {
      const formData = new FormData();
      formData.append("file", uploadedFile);
  
      try {
        const response = await fetch("http://localhost:4000/upload-document", {
          method: "POST",
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error(`Error uploading file: ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log("Extracted text:", data.extractedText);
        createDocumentSummary(data.promptOutput);
      } catch (error) {
        console.error("Error submitting document:", error);
      }
    } else {
      console.log("No file uploaded");
    }
  }
  

  return (
    <div className="app-container">
      <nav className="nav">
        <div className="nav-items">
          <button 
            id="button"
            className="sidebar-toggle"
            onClick={handleSidebarClick}
          >
            Prev
          </button>
          <header className="header">
            <h1 className="app-heading">
              <span className="heading1">YT </span>
              <span className="heading2">Summariser</span>
            </h1>
          </header>
        </div>
      </nav>
      <Sidebar
        sidebarRef={sidebarRef}
        sidebarToggled={sidebarToggled}
        summaries={summaries}
        setCurrentSummaryId={setCurrentSummaryId}
        deleteSummary={deleteSummary}
      />
      <main>
        <div className="app">
          <div className="mode-selection">
            <button 
              id="button"
              className="youtube"
              onClick={() => setMode(Mode.YOUTUBE)}
            >
              Youtube
            </button>
            <button 
              id="button"
              className="document"
              onClick={() => setMode(Mode.DOCUMENT)}
            >
              Document
            </button>
          </div>
          {mode === Mode.YOUTUBE && (
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
                <button id="button" className="submit-url" type="submit">
                  Search
                </button>
              </form>
            </div>
          )}
          {mode === Mode.DOCUMENT && (
              <div className="document-upload">
                <div className="upload-button">
                  <label className="upload-label">
                    <input
                      type="file" 
                      accept=".pdf,.doc,.docx,.txt" 
                      onChange={handleDocumentUpload} 
                      className="file-input"
                    />
                  </label>
                  {uploadedFile && (
                    <p className="file-name">Selected file: {uploadedFile.name}</p>
                  )}
                </div>
                <form 
                  onSubmit={handleDocumentSubmit} 
                  className="document-form"
                >
                  <button id="button" className="document-submit" type="submit">
                    Generate summary
                  </button>
                </form>
              </div>
            )}
          <div>
            <div>
              {summaries.length > 0 && 
                <Summary 
                  summary={findCurrentSummary()}
                  handleDownload={handleDownload}
                />
              }
            </div>            
          </div>
        </div>
      </main>
    </div>
  )
}
