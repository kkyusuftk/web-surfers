import { useState } from 'react';
import { UserService } from '../services/userService';
import '../styles/NameSubmissionDialog.css'; // We can reuse the same styles

interface FirstTimeUserDialogProps {
    onSubmit: () => void;
    onContinueAsGuest: () => void;
    finalScore: number;
    coins: number;
}

export const FirstTimeUserDialog = ({ 
    onSubmit, 
    onContinueAsGuest, 
    finalScore, 
    coins 
}: FirstTimeUserDialogProps) => {
    const userService = UserService.getInstance();
    const [username, setUsername] = useState('');
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

        // Create new user profile
        userService.createUserProfile(username.trim());
        onSubmit();
    };

    const handleGuestContinue = () => {
        userService.setPlayAsGuest();
        onContinueAsGuest();
    };

    return (
        <div className="name-submission-overlay">
            <div className="name-submission-dialog">
                <h2>Great First Game!</h2>
                <div className="score-display">
                    <p>Score: {finalScore}</p>
                    <p>Coins: {coins}</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <p className="first-time-message">
                        Would you like to save your progress and compete on the leaderboard?
                    </p>
                    
                    <div className="input-group">
                        <label htmlFor="username">Choose a username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter your username"
                            maxLength={20}
                            autoFocus
                        />
                        {error && <span className="error">{error}</span>}
                    </div>

                    <div className="dialog-buttons">
                        <button type="submit" className="submit-button">
                            Save & Continue
                        </button>
                        <button 
                            type="button" 
                            className="guest-button"
                            onClick={handleGuestContinue}
                        >
                            Continue as Guest
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 