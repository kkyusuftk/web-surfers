import { create } from "zustand";

interface GameState {
	// Game state
	isPlaying: boolean;
	isPaused: boolean;
	score: number;
	distance: number;
	coins: number;
	speed: number;
	lane: number; // -1: left, 0: center, 1: right
	isJumping: boolean;
	isRolling: boolean;
	gameOver: boolean;

	// Actions
	startGame: () => void;
	pauseGame: () => void;
	resumeGame: () => void;
	endGame: () => void;
	resetGame: () => void;
	moveLeft: () => void;
	moveRight: () => void;
	jump: () => void;
	roll: () => void;
	addScore: (points: number) => void;
	addCoin: () => void;
	increaseSpeed: () => void;
	setLane: (lane: number) => void;
	setJumping: (isJumping: boolean) => void;
	setRolling: (isRolling: boolean) => void;
	setDistance: (distance: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
	// Initial state
	isPlaying: false,
	isPaused: false,
	score: 0,
	distance: 0,
	coins: 0,
	speed: 10,
	lane: 0,
	isJumping: false,
	isRolling: false,
	gameOver: false,

	// Actions
	startGame: () =>
		set({
			isPlaying: true,
			isPaused: false,
			gameOver: false,
			score: 0,
			distance: 0,
			coins: 0,
			speed: 10,
			lane: 0,
			isJumping: false,
			isRolling: false,
		}),

	pauseGame: () => set({ isPaused: true }),

	resumeGame: () => set({ isPaused: false }),

	endGame: () => set({ isPlaying: false, gameOver: true }),

	resetGame: () =>
		set({
			isPlaying: false,
			isPaused: false,
			gameOver: false,
			score: 0,
			distance: 0,
			coins: 0,
			speed: 10,
			lane: 0,
			isJumping: false,
			isRolling: false,
		}),

	moveLeft: () =>
		set((state) => ({
			lane: Math.max(state.lane - 1, -1),
		})),

	moveRight: () =>
		set((state) => ({
			lane: Math.min(state.lane + 1, 1),
		})),

	jump: () => set({ isJumping: true }),

	roll: () => set({ isRolling: true }),

	addScore: (points) =>
		set((state) => ({
			score: state.score + points,
		})),

	addCoin: () =>
		set((state) => ({
			coins: state.coins + 1,
		})),

	increaseSpeed: () =>
		set((state) => ({
			speed: state.speed + 0.1,
		})),

	setLane: (lane) => set({ lane }),

	setJumping: (isJumping) => set({ isJumping }),

	setRolling: (isRolling) => set({ isRolling }),

	setDistance: (distance) => set({ distance }),
}));
