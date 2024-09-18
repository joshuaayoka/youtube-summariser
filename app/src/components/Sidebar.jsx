export default function Sidebar(props) {
  // Check if props.summaries is not empty
  const hasSummaries = props.summaries && props.summaries.length > 0;

  // If not empty, create buttons
  const buttons = hasSummaries
    ? props.summaries.map((summary) => {
        const id = summary.id;
        return (
          <div
            key={`btn${id}`}
            onClick={() => props.setCurrentSummaryId(id)}
            id="select-summary"
          >
            <strong>{summary.title}</strong>
            <br />
            <br />
            <span id="datetime">
              <strong>Date:</strong> {summary.date}
            </span>
            <br />
            <span id="datetime">
              <strong>Time:</strong> {summary.time}
            </span>

            <button
              id="delete-button"
              className="delete-summary"
              onClick={(event) => props.deleteSummary(event, id)}
              type="button" // Use type="button" to prevent accidental form submissions
            >
              Del
            </button>
          </div>
        );
      })
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
