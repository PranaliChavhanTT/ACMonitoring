function Save_Dash() {
    return (
        <div style={box.modal}>
            <div style={box.content}>
                <h2 style={box.title}>Save Dashboard</h2>
                <p style={box.hint}>
                    Save the current dashboard configuration for future use. This will store your selected filters and layout preferences.
                </p>
                <button style={box.button}>Save</button>
            </div>
        </div>
    );
}