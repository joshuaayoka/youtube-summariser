import { useState, useId } from "react"
import Button from "./Button"

export default function Summary(props) {
    const id = useId()
    console.log(props.summary)
    
    const summaryElements = props.summary.text.map(text => {
        return (
            <div key={id + text.subtitle.charAt(0)}>
                <h3>{text.subtitle}</h3>
                <p>{text.content}</p>
            </div>
        )
    })

    function summaryToText() {
        const summaryText = props.summary.text.reduce((text, item) => {
            // Add subtitle and content to the text block
            text += `${item.subtitle}\n${item.content}\n\n`;
            return text;
        }, '')        
        return summaryText
    }

    return (
        <div>
            <div id="info" className="video-details">
                <p className="video-title">Video: {props.summary.title}</p>
                <p>Creator: {props.summary.creator}</p>
            </div>
            <div id="info" className="summary-details">
                <div>
                    <h2>Summary</h2>
                    <div>
                        {summaryElements}
                    </div>
                </div>
                <div className="download-container">         
                    <Button
                        className="download-summary"
                        text="Download Summary"
                        handleClick={() => props.handleDownload(
                            summaryToText(),
                            props.summary.title
                        )}
                    />
                </div>
            </div>
        </div>
    )
}