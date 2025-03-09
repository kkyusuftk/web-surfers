import { Physics } from "@react-three/cannon";
import { PerspectiveCamera, Sky } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";
import { Environment } from "./Environment";
import { Player } from "./Player";
import { useKeyboardControls } from "./useKeyboardControls";
import { useTouchControls } from "./useTouchControls";

// Camera component that follows the player
const FollowCamera = () => {
	const cameraRef = useRef<THREE.PerspectiveCamera>(null);
	const { lane } = useGameStore();

	// Store the target position for smooth transitions
	const targetX = useRef(0);
	// Store the current interpolation value
	const currentX = useRef(0);
	// Store the previous lane for smoother transitions
	const prevLane = useRef(0);

	// Update target position when lane changes
	useEffect(() => {
		// Calculate target position based on lane
		targetX.current = lane * 2 * 0.3; // Lane width * dampening factor
		
		// Store previous lane for reference
		prevLane.current = lane;
	}, [lane]);

	useFrame((_, delta) => {
		if (!cameraRef.current) return;

		// Use a very small lerp factor for ultra-smooth camera movement
		const lerpFactor = delta * 1.5; // Reduced from 3 to 1.5 for smoother transitions
		
		// Smoothly interpolate the current position
		currentX.current = THREE.MathUtils.lerp(
			currentX.current,
			targetX.current,
			lerpFactor
		);
		
		// Apply the smoothed position to the camera
		cameraRef.current.position.x = currentX.current;
		
		// Make camera look at a point slightly ahead of the player
		// Use the smoothed X position for the lookAt target as well
		cameraRef.current.lookAt(new THREE.Vector3(currentX.current, 0.5, -10));
	});

	return (
		<PerspectiveCamera
			ref={cameraRef}
			makeDefault
			position={[0, 2.5, 6]} // Higher (y) and further behind (z) for a better view
			fov={65} // Adjusted FOV for better perspective
		/>
	);
};

export const GameScene = () => {
	// Initialize keyboard and touch controls
	useKeyboardControls();
	useTouchControls();

	return (
		<Canvas shadows>
			<Suspense fallback={null}>
				<Sky 
					sunPosition={[0, 10, 0]} 
					inclination={0} 
					azimuth={0.25} 
					distance={1000} 
					rayleigh={0.25} 
					turbidity={10}
				/>

				{/* Brighter ambient light for a sunny day */}
				<ambientLight intensity={0.8} color="#ffffff" />
				
				{/* Main directional light positioned directly above */}
				<directionalLight
					castShadow
					position={[0, 20, 0]} 
					intensity={2.0}
					color="#fff6e7" 
					shadow-mapSize-width={2048}
					shadow-mapSize-height={2048}
					shadow-camera-far={50}
					shadow-camera-left={-15}
					shadow-camera-right={15}
					shadow-camera-top={15}
					shadow-camera-bottom={-15}
				/>
				
				{/* Additional fill light for better illumination */}
				<directionalLight
					position={[10, 10, 10]}
					intensity={0.4}
					color="#ffe0bd"
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
