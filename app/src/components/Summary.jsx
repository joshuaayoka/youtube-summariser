import { useState, useId } from "react"

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

    return (
        <div>
            <div id="info">
                <p className="video-title">Video: {props.summary.title}</p>
                <p>Creator: {props.summary.creator}</p>
            </div>
            <div id="info">
                <h2>Summary</h2>
                {summaryElements}
            </div>
            {/* <Button
                className="delete-summary"
                onClick={props.deleteSummary}
            /> */}
        </div>
    )
}