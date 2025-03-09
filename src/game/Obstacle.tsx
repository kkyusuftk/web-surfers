import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
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
				if (glowRef.current) {
					glowRef.current.visible = false;
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
		if (!isPlaying || isPaused) return;

		if (coinRef.current) {
			// Rotate coins (around Y axis only)
			rotationRef.current += delta * 3;
			coinRef.current.rotation.y = rotationRef.current;

			// Add hover animation
			hoverRef.current += delta * 2.5;
			const hoverOffset = Math.sin(hoverRef.current) * 0.1;
			
			// Update coin position
			coinRef.current.position.set(
				obstaclePosition.current[0],
				obstaclePosition.current[1] + hoverOffset,
				obstaclePosition.current[2]
			);
			
			// Update physics body position
			api.position.set(
				obstaclePosition.current[0],
				obstaclePosition.current[1] + hoverOffset,
				obstaclePosition.current[2]
			);
		}

		// Pulse the glow effect
		if (glowRef.current) {
			pulseRef.current += delta * 2;
			const pulseScale = 1 + Math.sin(pulseRef.current) * 0.2;
			
			// Update glow position to match coin
			glowRef.current.position.set(
				obstaclePosition.current[0],
				obstaclePosition.current[1] + (Math.sin(hoverRef.current) * 0.1), // Match hover
				obstaclePosition.current[2]
			);
			
			// Scale the glow for pulsing effect
			glowRef.current.scale.set(pulseScale, pulseScale, pulseScale);
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

			{/* Glow sphere around coin */}
			<mesh 
				ref={glowRef} 
				position={[position[0], position[1], position[2]]}
			>
				<sphereGeometry args={[0.6, 16, 16]} />
				<meshBasicMaterial 
					color="#ffcc00" 
					transparent={true} 
					opacity={0.3}
					side={THREE.DoubleSide}
				/>
			</mesh>

			{/* Visible coin */}
			<mesh 
				ref={coinRef} 
				castShadow 
				position={[position[0], position[1], position[2]]}
			>
				<cylinderGeometry args={[0.35, 0.35, 0.1, 32]} />
				<meshStandardMaterial
					color={color}
					metalness={1.0}
					roughness={0.2}
					emissive={color}
					emissiveIntensity={0.8}
				/>
			</mesh>
		</group>
	);
};
