import { useEffect, useState } from 'react';
import { UserService } from "../services/userService";
import LeaderboardService from "../services/leaderboardService";
import { LeaderboardEntry } from '../services/types';
import "../styles/LeaderboardModal.css";

interface LeaderboardModalProps {
    onClose: () => void;
}

export const LeaderboardModal = ({ onClose }: LeaderboardModalProps) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const userService = UserService.getInstance();
    const leaderboardService = LeaderboardService.getInstance();
    const currentUser = userService.getUserProfile();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const data = await leaderboardService.getLeaderboard(true);
                setLeaderboard(data);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <div className="leaderboard-overlay">
            <div className="leaderboard-modal">
                <div className="leaderboard-header">
                    <h2>Global Leaderboard</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                {loading ? (
                    <div className="loading">Loading leaderboard...</div>
                ) : (
                    <div className="leaderboard-content">
                        <table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player</th>
                                    <th>Score</th>
                                    <th>Coins</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((entry, index) => (
                                    <tr 
                                        key={entry.playerId + entry.timestamp}
                                        className={currentUser?.id === entry.playerId ? 'current-user' : ''}
                                    >
                                        <td>{index + 1}</td>
                                        <td>{entry.username}</td>
                                        <td>{entry.score}</td>
                                        <td>{entry.coins}</td>
                                        <td>{formatDate(entry.timestamp)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="leaderboard-footer">
                    <button className="back-button" onClick={onClose}>Back to Menu</button>
                </div>
            </div>
        </div>
    );
}; 