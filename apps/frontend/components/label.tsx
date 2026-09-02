const Label = function ({ text, color = 'black', fontSize, textProps = {} }: any) {
    return (
        <div style={{ color, fontSize }}>{text}
        </div>
    )
}

export default Label