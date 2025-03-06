import { Physics } from "@react-three/cannon";
import { PerspectiveCamera, Sky } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";
import { Environment } from "./Environment";
import { Player } from "./Player";
import { useKeyboardControls } from "./useKeyboardControls";

// Camera component that follows the player
const FollowCamera = () => {
	const cameraRef = useRef<THREE.PerspectiveCamera>(null);
	const { lane } = useGameStore();

	// Store the target position for smooth transitions
	const targetX = useRef(0);

	// Update target position when lane changes
	useEffect(() => {
		targetX.current = lane * 2 * 0.3; // Lane width * dampening factor
	}, [lane]);

	useFrame((_, delta) => {
		if (!cameraRef.current) return;

		// Very smooth camera movement - reduced follow speed
		cameraRef.current.position.x = THREE.MathUtils.lerp(
			cameraRef.current.position.x,
			targetX.current,
			delta * 3, // Slower transition for more stability
		);
	});

	return (
		<PerspectiveCamera
			ref={cameraRef}
			makeDefault
			position={[0, 1.5, 3]} // Increased height (y) and decreased distance behind player (z)
			fov={75} // Decreased FOV for better perspective
		/>
	);
};

export const GameScene = () => {
	// Initialize keyboard controls
	useKeyboardControls();

	return (
		<Canvas shadows>
			<Suspense fallback={null}>
				<Sky sunPosition={[100, 20, 100]} />

				<ambientLight intensity={0.3} />
				<directionalLight
					castShadow
					position={[10, 10, 5]}
					intensity={1.5}
					shadow-mapSize-width={1024}
					shadow-mapSize-height={1024}
					shadow-camera-far={50}
					shadow-camera-left={-10}
					shadow-camera-right={10}
					shadow-camera-top={10}
					shadow-camera-bottom={-10}
				/>

				{/* Follow camera */}
				<FollowCamera />

				{/* Physics world */}
				<Physics
					gravity={[0, -9.8, 0]}
					defaultContactMaterial={{
						friction: 0.1,
						restitution: 0.7,
					}}
				>
					{/* Game environment */}
					<Environment />

					{/* Player character */}
					<Player />
				</Physics>
			</Suspense>
		</Canvas>
	);
};
