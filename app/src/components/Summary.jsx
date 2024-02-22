import { useState, useId } from "react"

export function Summary(props) {

    const [summaryArray, setSummaryArray] = useState(props.summary)

    const id = useId()
    
    const summaryElements = summaryArray.map(text => {
        return (
            <div key={id + text.subtitle.charAt(0)}>
                <h3>{text.subtitle}</h3>
                <p>{text.content}</p>
            </div>
        )
    })

    return (
        <div>
            <h2>Summary</h2>
            {summaryElements}
        </div>
    )
}