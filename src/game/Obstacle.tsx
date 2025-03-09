import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type * as THREE from "three";
import { useGameStore } from "../store/gameStore";

interface ObstacleProps {
	position: [number, number, number];
	size: [number, number, number];
	color?: string;
	type: "coin";
}

export const Obstacle = ({
	position,
	size,
	color = "gold",
	type,
}: ObstacleProps) => {
	const { isPlaying, isPaused, addCoin } = useGameStore();

	// Create a physics body for the coin
	const [ref, api] = useBox(() => ({
		mass: 0,
		type: "Static",
		position,
		args: size,
		userData: { type },
		onCollide: (e) => {
			// Check if collision is with player
			if (e.body.name === "player") {
				addCoin();
				// Hide the coin after collection
				if (coinRef.current) {
					coinRef.current.visible = false;
				}
			}
		},
	}));

	// Separate ref for the visual coin mesh
	const coinRef = useRef<THREE.Mesh>(null);
	// Ref for the glow effect
	const glowRef = useRef<THREE.Mesh>(null);

	// Store position in ref for use in animations
	const obstaclePosition = useRef(position);

	// Subscribe to physics updates
	useEffect(() => {
		const unsubscribe = api.position.subscribe(
			(p) => (obstaclePosition.current = p),
		);
		return unsubscribe;
	}, [api]);

	// Animation for coins
	const rotationRef = useRef(0);
	const hoverRef = useRef(0);
	const pulseRef = useRef(0);

	useFrame((_, delta) => {
		if (!isPlaying || isPaused || !coinRef.current) return;

		// Rotate coins like a globe (around Y axis)
		rotationRef.current += delta * 4; // Faster rotation
		coinRef.current.rotation.y = rotationRef.current;

		// Add more pronounced hover animation
		hoverRef.current += delta * 3;
		const hoverOffset = Math.sin(hoverRef.current) * 0.1; // Increased amplitude
		api.position.set(
			obstaclePosition.current[0],
			obstaclePosition.current[1] + hoverOffset,
			obstaclePosition.current[2],
		);

		// Update visual coin position to match physics body
		coinRef.current.position.set(
			obstaclePosition.current[0],
			obstaclePosition.current[1],
			obstaclePosition.current[2],
		);

		// Pulse the glow effect
		if (glowRef.current) {
			pulseRef.current += delta * 2;
			const pulseScale = 1 + Math.sin(pulseRef.current) * 0.1;
			glowRef.current.scale.set(pulseScale, pulseScale, 1);
			glowRef.current.position.set(
				obstaclePosition.current[0],
				obstaclePosition.current[1],
				obstaclePosition.current[2],
			);
		}
	});

	// Update physics position when prop position changes
	useEffect(() => {
		api.position.set(position[0], position[1], position[2]);
	}, [position, api]);

	return (
		<group>
			{/* Invisible physics body */}
			<mesh ref={ref as any} visible={false} />

			{/* Glow effect behind coin */}
			<mesh 
				ref={glowRef} 
				rotation={[0, 0, Math.PI / 2]}
				position={[position[0], position[1], position[2]]}
			>
				<cylinderGeometry args={[0.6, 0.6, 0.01, 32]} />
				<meshBasicMaterial 
					color="#ffcc00" 
					transparent={true} 
					opacity={0.6}
				/>
			</mesh>

			{/* Visible coin that rotates */}
			<mesh ref={coinRef} castShadow rotation={[0, 0, Math.PI / 2]}>
				<cylinderGeometry args={[0.4, 0.4, 0.1, 32]} /> {/* Thicker coin */}
				<meshStandardMaterial
					color={color}
					metalness={0.9}
					roughness={0.2}
					emissive={color}
					emissiveIntensity={0.6} // Increased glow
				/>
			</mesh>
		</group>
	);
};
