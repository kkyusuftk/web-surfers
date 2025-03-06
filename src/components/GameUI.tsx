import { useGameStore } from "../store/gameStore";
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

	return (
		<div className="game-ui">
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
					<button className="start-button" onClick={startGame}>
						Start Game
					</button>
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
			{gameOver && (
				<div className="game-over-screen">
					<h2>Game Over</h2>
					<div className="final-score">
						<p>Score: {score}</p>
						<p>Coins: {coins}</p>
					</div>
					<button onClick={resetGame}>Play Again</button>
				</div>
			)}
		</div>
	);
};
