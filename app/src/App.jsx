// Import useState and useEffect
import { useEffect, useState, useRef } from "react"
import Summary from "./components/Summary"
import Button from "./components/Button"
import Sidebar from "./components/Sidebar"
import "./App.css"
import { nanoid } from "nanoid"

export default function App() {
  const [url, setUrl] = useState("")
  const [transcript, setTranscript] = useState("")
  const [summary, setSummary] = useState({
     id: "",
     title: "", 
     text: "",
     date: "",
     time: ""
  })
  const [sidebarToggled, setSidebarToggled] = useState(false)
  const [summaries, setSummaries] = useState(() => JSON.parse(localStorage.getItem("summaries")) || [])
  const [currentSummaryId, setCurrentSummaryId] = useState(
    (summaries[0] && summaries[0].id) || ""
  )
  
  console.log(summary)

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

  // for changing summary

  useEffect(() => {
    if (currentSummaryId) 
      setSummary(findCurrentSummary())
  }, [currentSummaryId])


  function createSummary(videoDetails, summaryText) {
    const id = nanoid()
    const datetime = getCurrentDateTime()
    const newSummary = {
      id: id,
      title: videoDetails.title,
      creator: videoDetails.creator,
      text: summaryText,
      date: datetime.date,
      time: datetime.time
    }
    setSummary(newSummary)
    setCurrentSummaryId(id)
    setSummaries([newSummary, ...summaries])
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
      console.error("Error sending URL:", error)
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
        summaries={summaries}
        setCurrentSummaryId={setCurrentSummaryId}
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
          <div className="summary-details">
            {summary.text && 
              <Summary 
                summary={summary}
              />
            }
          </div>
        </div>
      </main>
    </div>
  )
}
