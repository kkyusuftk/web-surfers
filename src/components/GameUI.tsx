import { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { ScoreQueue } from "../services/scoreQueue";
import { UserService } from "../services/userService";
import LeaderboardService from "../services/leaderboardService";
import { NameSubmissionDialog } from "./NameSubmissionDialog";
import { FirstTimeUserDialog } from "./FirstTimeUserDialog";
import { UserProfileDisplay } from "./UserProfileDisplay";
import { LeaderboardModal } from "./LeaderboardModal";
import "../styles/GameUI.css";

export const GameUI = () => {
	const {
		score,
		coins,
		isPlaying,
		isPaused,
		gameOver,
		startGame,
		pauseGame,
		resumeGame,
		resetGame,
	} = useGameStore();

	const [showNameDialog, setShowNameDialog] = useState(false);
	const [showFirstTimeDialog, setShowFirstTimeDialog] = useState(false);
	const [showLeaderboard, setShowLeaderboard] = useState(false);
	const scoreQueue = ScoreQueue.getInstance();
	const userService = UserService.getInstance();
	const leaderboardService = LeaderboardService.getInstance();

	// Add keyboard event listener for space key
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.code === 'Space') {
				// Only start game if we're on the home screen
				if (!isPlaying && !gameOver && !showLeaderboard && !showNameDialog && !showFirstTimeDialog) {
					e.preventDefault(); // Prevent page scroll
					startGame();
				}
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [isPlaying, gameOver, showLeaderboard, showNameDialog, showFirstTimeDialog, startGame]);

	const handleGameOver = () => {
		if (userService.isFirstTimeUser()) {
			setShowFirstTimeDialog(true);
		} else if (userService.hasUserProfile()) {
			const userProfile = userService.getUserProfile();
			if (userProfile && leaderboardService.isNewHighScore(userProfile.id, score)) {
				setShowNameDialog(true);
			} else {
				handlePlayAgain();
			}
		} else {
			// User has chosen to play as guest before
			handlePlayAgain();
		}
	};

	const handleGuestContinue = () => {
		setShowFirstTimeDialog(false);
		handlePlayAgain();
	};

	const handleScoreSubmit = () => {
		setShowNameDialog(false);
		setShowFirstTimeDialog(false);
	};

	const handlePlayAgain = () => {
		const userProfile = userService.getUserProfile();
		console.log("userProfile", userProfile);
		if (!userProfile) {
			resetGame();
			return;
		}

		scoreQueue.addScore({
			playerId: userProfile.id,
			username: userProfile.username,
			score,
			coins,
		});

		resetGame();
	};

	const getHighScoreDisplay = () => {
		const userProfile = userService.getUserProfile();
		if (!userProfile) return null;

		const highScore = leaderboardService.getHighScore(userProfile.id);
		const isNewHighScore = score > highScore;

		return (
			<div className="high-score-display">
				{isNewHighScore ? (
					<p className="new-high-score">New High Score!</p>
				) : (
					<p>High Score: {highScore}</p>
				)}
			</div>
		);
	};

	return (
		<div className="game-ui">
			{/* User Profile - always visible except during gameplay */}
			{!isPlaying && <UserProfileDisplay />}

			{/* HUD - always visible during gameplay */}
			{isPlaying && !gameOver && (
				<div className="hud">
					<div className="score">Score: {score}</div>
					<div className="coins">Coins: {coins}</div>
					<button
						className="pause-button"
						onClick={() => (isPaused ? resumeGame() : pauseGame())}
					>
						{isPaused ? "Resume" : "Pause"}
					</button>
				</div>
			)}

			{/* Start Screen */}
			{!isPlaying && !gameOver && (
				<div className="start-screen">
					<h1>Web Surfers</h1>
					<p>Press SPACE to start</p>
					<div className="controls">
						<p>Controls:</p>
						<div className="controls-container">
							<div className="keyboard-controls">
								<h3>Keyboard:</h3>
								<ul>
									<li>W or ↑: Jump</li>
									<li>A or ←: Move Left</li>
									<li>S or ↓: Roll</li>
									<li>D or →: Move Right</li>
									<li>ESC: Pause</li>
								</ul>
							</div>
							<div className="touch-controls">
								<h3>Touch:</h3>
								<ul>
									<li>Swipe Up: Jump</li>
									<li>Swipe Left: Move Left</li>
									<li>Swipe Down: Roll</li>
									<li>Swipe Right: Move Right</li>
									<li>Tap: Pause</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="start-buttons">
						<button className="start-button" onClick={startGame}>
							Start Game
						</button>
						<button 
							className="leaderboard-button" 
							onClick={() => setShowLeaderboard(true)}
						>
							Leaderboard
						</button>
					</div>
				</div>
			)}

			{/* Pause Screen */}
			{isPlaying && isPaused && (
				<div className="pause-screen">
					<h2>Game Paused</h2>
					<p>Press SPACE to resume</p>
					<div className="pause-buttons">
						<button onClick={resumeGame}>Resume</button>
						<button onClick={resetGame}>Quit</button>
					</div>
				</div>
			)}

			{/* Game Over Screen */}
			{gameOver && !showNameDialog && !showFirstTimeDialog && (
				<div className="game-over-screen">
					<h2>Game Over</h2>
					<div className="final-score">
						<p>Score: {score}</p>
						<p>Coins: {coins}</p>
						{getHighScoreDisplay()}
					</div>
					{!userService.hasUserProfile() && (
						<button onClick={handleGameOver}>Submit Score</button>
					)}
					<button onClick={handlePlayAgain}>Play Again</button>
				</div>
			)}

			{/* First Time User Dialog */}
			{showFirstTimeDialog && (
				<FirstTimeUserDialog
					onSubmit={handleScoreSubmit}
					onContinueAsGuest={handleGuestContinue}
					finalScore={score}
					coins={coins}
				/>
			)}

			{/* Regular Name Submission Dialog */}
			{showNameDialog && (
				<NameSubmissionDialog
					onSubmit={handleScoreSubmit}
					finalScore={score}
					coins={coins}
				/>
			)}

			{/* Leaderboard Modal */}
			{showLeaderboard && (
				<LeaderboardModal onClose={() => setShowLeaderboard(false)} />
			)}
		</div>
	);
};
