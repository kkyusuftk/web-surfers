import { useBox } from "@react-three/cannon";
import { useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";

interface CarProps {
	position: [number, number, number];
	color?: string;
}

export const Car = ({ position, color = "#3498db" }: CarProps) => {
	const { endGame } = useGameStore();

	// Car dimensions
	const carWidth = 1.2;
	const carHeight = 0.9;
	const carLength = 2;

	// Create a physics body for the car
	const [ref, api] = useBox(() => ({
		mass: 0,
		type: "Static",
		position,
		args: [carWidth, carHeight, carLength],
		userData: { type: "barrier" },
		onCollide: (e) => {
			// Check if collision is with player
			if (e.body.name === "player") {
				// Game over on collision with car
				endGame();
			}
		},
	}));

	// Store position in ref for use in animations
	const carPosition = useRef(position);

	// Subscribe to physics updates
	useEffect(() => {
		const unsubscribe = api.position.subscribe(
			(p) => (carPosition.current = p),
		);
		return unsubscribe;
	}, [api]);

	// Update physics position when prop position changes
	useEffect(() => {
		api.position.set(position[0], position[1], position[2]);
	}, [position, api]);

	return (
		<group ref={ref as any}>
			{/* Car body */}
			<mesh castShadow position={[0, 0.1, 0]}>
				<boxGeometry args={[carWidth, carHeight * 0.6, carLength]} />
				<meshStandardMaterial color={color} />
			</mesh>

			{/* Car roof */}
			<mesh castShadow position={[0, carHeight * 0.5, -0.2]}>
				<boxGeometry
					args={[carWidth * 0.8, carHeight * 0.4, carLength * 0.6]}
				/>
				<meshStandardMaterial color={color} />
			</mesh>

			{/* Wheels */}
			<mesh
				castShadow
				position={[(carWidth / 2) * 0.8, -carHeight / 2 + 0.2, carLength / 3]}
				rotation={[Math.PI / 2, 0, 0]}
			>
				<cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
				<meshStandardMaterial color="black" />
			</mesh>

			<mesh
				castShadow
				position={[(-carWidth / 2) * 0.8, -carHeight / 2 + 0.2, carLength / 3]}
				rotation={[Math.PI / 2, 0, 0]}
			>
				<cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
				<meshStandardMaterial color="black" />
			</mesh>

			<mesh
				castShadow
				position={[(carWidth / 2) * 0.8, -carHeight / 2 + 0.2, -carLength / 3]}
				rotation={[Math.PI / 2, 0, 0]}
			>
				<cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
				<meshStandardMaterial color="black" />
			</mesh>

			<mesh
				castShadow
				position={[(-carWidth / 2) * 0.8, -carHeight / 2 + 0.2, -carLength / 3]}
				rotation={[Math.PI / 2, 0, 0]}
			>
				<cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
				<meshStandardMaterial color="black" />
			</mesh>

			{/* Windshield */}
			<mesh castShadow position={[0, carHeight * 0.3, 0.2]}>
				<boxGeometry args={[carWidth * 0.7, carHeight * 0.3, 0.1]} />
				<meshStandardMaterial color="#a8e4ff" opacity={0.7} transparent />
			</mesh>

			{/* Headlights */}
			<mesh castShadow position={[(carWidth / 2) * 0.6, 0, carLength / 2]}>
				<boxGeometry args={[0.2, 0.2, 0.1]} />
				<meshStandardMaterial color="yellow" />
			</mesh>

			<mesh castShadow position={[(-carWidth / 2) * 0.6, 0, carLength / 2]}>
				<boxGeometry args={[0.2, 0.2, 0.1]} />
				<meshStandardMaterial color="yellow" />
			</mesh>

			{/* Taillights */}
			<mesh castShadow position={[(carWidth / 2) * 0.6, 0, -carLength / 2]}>
				<boxGeometry args={[0.2, 0.2, 0.1]} />
				<meshStandardMaterial color="red" />
			</mesh>

			<mesh castShadow position={[(-carWidth / 2) * 0.6, 0, -carLength / 2]}>
				<boxGeometry args={[0.2, 0.2, 0.1]} />
				<meshStandardMaterial color="red" />
			</mesh>
		</group>
	);
};
