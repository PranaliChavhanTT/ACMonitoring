function Header() {
    return (
        <header className="header">

            <div>
                <h1>AC Energy Monitoring Dashboard</h1>
                <p>Real-Time Air Conditioner Monitoring</p>
            </div>

            <div className="live-status">
                <span className="live-dot"></span>
                LIVE
            </div>

        </header>
    );
}

export default Header;