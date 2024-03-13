export default function Sidebar(props) {
    console.log(props.titles);
  
    // Check if props.summaries is not empty
    const hasSummaries = props.summaries && props.summaries.length > 0;
  
    // If not empty, create buttons
    const buttons = hasSummaries
        ? props.summaries.map((summary) => (
            <button 
                key={`btn${summary.id}`}
                >
                    {summary.title}
            </button>
        ))
        : null;
  
    return (
        <aside
            ref={props.sidebarRef}
            className={`sidebar ${props.sidebarToggled ? "visible" : ""}`}
        >
            {buttons}
        </aside>
    );
  }
  