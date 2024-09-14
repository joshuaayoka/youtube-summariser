// Import useState and useEffect
import { useEffect, useState, useRef } from "react"
import Summary from "./components/Summary"
import Button from "./components/Button"
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
  // const [summary, setSummary] = useState(resetSummary)
  const [sidebarToggled, setSidebarToggled] = useState(false)
  const [summaries, setSummaries] = useState(() => JSON.parse(localStorage.getItem("summaries")) || [])
  const [currentSummaryId, setCurrentSummaryId] = useState(
    (summaries[0] && summaries[0].id) || ""
  )
  const [urlError, setUrlError] = useState("")
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
      // setUrlError("Invalid URL entry")
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

      // If you need to read the file content, you can use FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        console.log("File content:", content);
      };
      reader.readAsArrayBuffer(file); 
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
  

  function handleDocumentSubmit(event) {
    event.preventDefault();

    if (uploadedFile) {
      console.log("Submitting the uploaded file:", uploadedFile);
      // Implement your file submission logic here (e.g., send it to a server)
    } else {
      console.log("No file uploaded");
    }
  }

  return (
    <div className="app-container">
      <nav className="nav">
        <div className="nav-items">
          <Button
            className="sidebar-toggle"
            text="Prev"
            handleClick={handleSidebarClick}
          />
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
          <div>
            <Button 
              className="youtube"
              text="Youtube"
              handleClick={() => setMode(Mode.YOUTUBE)}
            />
            <Button 
              className="document"
              text="Document"
              handleClick={() => setMode(Mode.DOCUMENT)}
            />
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
                <button className="submit-url" type="submit">Search</button>
              </form>
            </div>
          )}
          {mode === Mode.DOCUMENT && (
              <div className="document-upload">
                <form 
                  onSubmit={handleDocumentSubmit} 
                  className="document-form"
                >
                </form>
                <div className="upload-button">
                  <label className="upload-label">
                    Upload Document
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
