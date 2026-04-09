import React, { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';

const App = () => {
    // Moved state initialization to the top
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);

    const loadLeaderboard = async () => {
        // Function to load leaderboard data
        // ... Your loading logic (fetching data and setting state)
    };

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const handleViewLeaderboard = () => {
        setShowLeaderboard(true);
    };

    return (
        <div>
            <h1>My App</h1>
            <button onClick={handleViewLeaderboard}>View Leaderboard</button>
            {showLeaderboard && <Leaderboard data={leaderboardData} />}
        </div>
    );
};

export default App;