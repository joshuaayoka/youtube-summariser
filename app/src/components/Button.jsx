import "./Button.css"

export default function Button(props) {
    return (
        <button 
            id={`${props.type==="delete" ? "delete-" : ""}button`}
            className={`${props.className}`}
            onClick={props.handleClick}
            >
            {props.text}
        </button>
    )
}