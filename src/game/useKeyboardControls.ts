import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";

export const useKeyboardControls = () => {
	const {
		isPlaying,
		isPaused,
		gameOver,
		startGame,
		pauseGame,
		resumeGame,
		moveLeft,
		moveRight,
		setJumping,
		setRolling,
		isRolling,
		isJumping,
	} = useGameStore();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (gameOver) {
				// Space to restart
				if (e.code === "Space") {
					startGame();
				}
				return;
			}

			// Handle pause state
			if (isPaused) {
				// P or Space to resume
				if (e.code === "KeyP" || e.code === "Space") {
					resumeGame();
				}
				return;
			}

			if (!isPlaying) {
				// Space to start/resume
				if (e.code === "Space") {
					if (gameOver) {
						startGame();
					} else {
						resumeGame();
					}
				}
				return;
			}

			// Game controls when playing
			switch (e.code) {
				case "ArrowLeft":
				case "KeyA":
					moveLeft();
					break;
				case "ArrowRight":
				case "KeyD":
					moveRight();
					break;
				case "ArrowUp":
				case "KeyW":
				case "Space":
					// Only allow jumping if not currently rolling
					if (!isRolling) {
						setJumping(true);
					}
					break;
				case "ArrowDown":
				case "KeyS":
					// Only allow rolling if not currently jumping
					if (!isJumping) {
						setRolling(true);
					}
					break;
				case "KeyP":
				case "Escape":
					pauseGame();
					break;
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			// Reset actions on key up
			switch (e.code) {
				case "ArrowUp":
				case "KeyW":
				case "Space":
					setJumping(false);
					break;
				case "ArrowDown":
				case "KeyS":
					setRolling(false);
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [
		isPlaying,
		isPaused,
		gameOver,
		startGame,
		pauseGame,
		resumeGame,
		moveLeft,
		moveRight,
		setJumping,
		setRolling,
		isRolling,
		isJumping,
	]);
};
