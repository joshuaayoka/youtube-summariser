export default function Sidebar(props) {
  
    // Check if props.summaries is not empty
    const hasSummaries = props.summaries && props.summaries.length > 0
  
    // If not empty, create buttons
    const buttons = hasSummaries
        ? props.summaries.map((summary) => {
            const id = summary.id
            return (
                <button 
                    key={`btn${id}`}
                    onClick={() => props.setCurrentSummaryId(id)}
                    >
                        {summary.title}
                </button>
            )
            })
        : null
  
    return (
        <aside
            ref={props.sidebarRef}
            className={`sidebar ${props.sidebarToggled ? "visible" : ""}`}
        >
            {buttons}
        </aside>
    );
  }
  