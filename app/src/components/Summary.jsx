import { useState, useId } from "react";

export default function Summary(props) {
  const id = useId();
  const videoId = props.summary.videoId;

  console.log(props.summary);

  const summaryElements = props.summary.text.map((text) => {
    return (
      <div key={id + text.subtitle.charAt(0)}>
        <h3>{text.subtitle}</h3>
        <p>{text.content}</p>
      </div>
    );
  });

  function summaryToText() {
    const summaryText = props.summary.text.reduce((text, item) => {
      // Add subtitle and content to the text block
      text += `${item.subtitle}\n${item.content}\n\n`;
      return text;
    }, "");
    return summaryText;
  }

  return (
    <div>
      {props.summary.type === "youtube" && (
        <div className="video-container">
          {/* Video details on the left (or top on smaller screens) */}
          <div className="video-details">
            <p className="video-title">Video: {props.summary.title}</p>
            <p>Creator: {props.summary.creator}</p>
          </div>

          {/* Video iframe on the right (or below on smaller screens) */}
          <div className="video-embed">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={props.summary.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
      {props.summary.type === "document" && (
        <div>
          <div className="video-details">
            <p className="video-title">Title: {props.summary.title}</p>
          </div>
        </div>
      )}
      <div id="info" className="summary-details">
        <div>
          <h2>Summary</h2>
          <div>{summaryElements}</div>
        </div>
        <div className="download-container">
          <button
            id="button"
            className="download-summary"
            onClick={() =>
              props.handleDownload(summaryToText(), props.summary.title)
            }
          >
            Download Summary
          </button>
        </div>
      </div>
    </div>
  );
}
