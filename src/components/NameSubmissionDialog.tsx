import { useState } from 'react';
import { UserService } from '../services/userService';
import '../styles/NameSubmissionDialog.css';

interface NameSubmissionDialogProps {
    onSubmit: () => void;
    finalScore: number;
    coins: number;
}

export const NameSubmissionDialog = ({ onSubmit, finalScore, coins }: NameSubmissionDialogProps) => {
    const userService = UserService.getInstance();
    const [username, setUsername] = useState(userService.getUserProfile()?.username || '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username.trim()) {
            setError('Please enter a name');
            return;
        }

        if (username.length > 20) {
            setError('Name must be 20 characters or less');
            return;
        }

        // Update or create user profile
        userService.updateUsername(username.trim());
        onSubmit();
    };

    const userProfile = userService.getUserProfile();

    return (
        <div className="name-submission-overlay">
            <div className="name-submission-dialog">
                <h2>Submit Your Score</h2>
                <div className="score-display">
                    <p>Score: {finalScore}</p>
                    <p>Coins: {coins}</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Enter your name:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            placeholder="Your name"
                            maxLength={20}
                            autoFocus
                        />
                        {error && <span className="error">{error}</span>}
                    </div>

                    {userProfile && (
                        <p className="profile-info">
                            Your ID: {userProfile.id}
                            <br />
                            <small>Save this ID to track your scores across devices!</small>
                        </p>
                    )}

                    <button type="submit" className="submit-button">
                        Submit Score
                    </button>
                </form>
            </div>
        </div>
    );
}; 