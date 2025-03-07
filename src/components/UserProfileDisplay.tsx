import { UserService } from "../services/userService";
import LeaderboardService from "../services/leaderboardService";
import "../styles/UserProfileDisplay.css";

export const UserProfileDisplay = () => {
    const userService = UserService.getInstance();
    const leaderboardService = LeaderboardService.getInstance();
    const userProfile = userService.getUserProfile();

    if (!userProfile) return null;

    const highScore = leaderboardService.getHighScore(userProfile.id);

    return (
        <div className="user-profile-display">
            <div className="user-info">
                <span className="username">{userProfile.username}</span>
                <span className="high-score">High Score: {highScore}</span>
            </div>
        </div>
    );
}; 