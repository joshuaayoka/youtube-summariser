import "./Button.css"

export default function Button(props) {
    return (
        <button 
            id="button"
            className={`${props.className}`}
            onClick={props.handleClick}
            >
            {props.text}
        </button>
    )
}