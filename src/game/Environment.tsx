import { usePlane } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";
import { Car } from "./Car";
import { Obstacle } from "./Obstacle";
import { BuildingGenerator } from "./BuildingGenerator";

// Track segment length
const SEGMENT_LENGTH = 60;
// Number of segments to keep loaded
const SEGMENTS_COUNT = 7;
// Lane width
const LANE_WIDTH = 2;
// Player Z position (fixed)
const PLAYER_Z_POSITION = 0;

// Define curvature for track segments
const CURVATURE = 0.1; // Adjust this value for more or less curvature

// Obstacle types
type ObstacleType = {
	position: [number, number, number];
	size: [number, number, number];
	type: "car" | "coin";
	id: string;
	color?: string;
};

// Track segment type
type TrackSegmentType = {
	position: number;
	curveAngle: number;
	id: string;
};

export const Environment = () => {
	const {
		isPlaying,
		isPaused,
		speed,
		addScore,
		increaseSpeed,
		setDistance,
	} = useGameStore();

	// Create a physics plane for the ground
	const [ref] = usePlane(() => ({
		rotation: [-Math.PI / 2, 0, 0], // Rotate to be horizontal
		position: [0, 0, 0],
		type: "Static",
	}));

	// State for obstacles
	const [obstacles, setObstacles] = useState<ObstacleType[]>([]);
	// State for track segments
	const [trackSegments, setTrackSegments] = useState<TrackSegmentType[]>([]);

	// Distance traveled
	const distanceTraveled = useRef(0);
	// Last segment position
	const lastSegmentPosition = useRef(0);
	// Score counter
	const scoreCounter = useRef(0);
	// Speed increase counter
	const speedCounter = useRef(0);

	// Initialize or reset the game environment
	const initializeEnvironment = () => {
		// Reset all counters
		distanceTraveled.current = 0;
		lastSegmentPosition.current = 0;
		scoreCounter.current = 0;
		speedCounter.current = 0;

		// Create initial track segments
		const initialSegments = Array.from({ length: SEGMENTS_COUNT }, (_, i) =>
			generateCurvedTrackSegment(PLAYER_Z_POSITION - i * SEGMENT_LENGTH)
		);

		setTrackSegments(initialSegments);

		// Generate initial obstacles
		let initialObstacles: ObstacleType[] = [];
		initialSegments.forEach((segment) => {
			initialObstacles = [
				...initialObstacles,
				...generateObstaclesForSegment(segment.position),
			];
		});

		setObstacles(initialObstacles);
		setDistance(0);
	};

	// Reset environment when game starts
	useEffect(() => {
		if (isPlaying) {
			initializeEnvironment();
		}
	}, [isPlaying, setDistance]);

	// Generate random obstacles for a segment
	const generateObstaclesForSegment = (segmentZ: number) => {
		const newObstacles: ObstacleType[] = [];

		// Increased number of obstacles per segment
		const obstacleCount = Math.floor(Math.random() * 4) + 3; // 3-6 obstacles per segment

		for (let i = 0; i < obstacleCount; i++) {
			// Random lane: -1 (left), 0 (center), 1 (right)
			const lane = Math.floor(Math.random() * 3) - 1;
			
			// Position within segment
			const z = segmentZ + Math.random() * SEGMENT_LENGTH;
			
			// Random type (60% car, 40% coin) - increased coin probability
			const type = Math.random() > 0.4 ? "car" : "coin";
			
			// Height based on type
			const y = type === "coin" ? 0.8 : 0.5; // Raised coins for easier visibility
			
			// Random car color
			const carColors = ["red", "blue", "green", "yellow", "purple", "orange", "teal"];
			const color = carColors[Math.floor(Math.random() * carColors.length)];

			// Ensure we don't place obstacles too close to the start of the first segment
			if (segmentZ === PLAYER_Z_POSITION && i === 0) {
				// Skip the first obstacle in the first segment to give player time to react
				continue;
			}

			// Add coins in clusters sometimes
			if (type === "coin" && Math.random() > 0.7) {
				// Create a line of coins
				const coinCount = Math.floor(Math.random() * 3) + 2; // 2-4 coins in a row
				for (let j = 0; j < coinCount; j++) {
					newObstacles.push({
						position: [lane * LANE_WIDTH, y, z + j * 1.5] as [number, number, number],
						size: [0.5, 0.5, 0.1],
						type: "coin",
						id: `coin-${segmentZ}-${i}-${j}`,
						color: "gold"
					});
				}
			} else {
				newObstacles.push({
					position: [lane * LANE_WIDTH, y, z] as [number, number, number],
					size: type === "car" ? [1, 1, 2] : [0.5, 0.5, 0.1],
					type,
					color: type === "car" ? color : "gold",
					id: `obstacle-${Date.now()}-${Math.random()}`,
				});
			}
		}

		return newObstacles;
	};

	// Update track segment generation to include curvature
	const generateCurvedTrackSegment = (segmentZ: number) => {
		const curveAngle = Math.sin(segmentZ * CURVATURE) * Math.PI / 8; // Calculate curve angle
		return {
			position: segmentZ,
			curveAngle,
			id: `segment-${Date.now()}-${Math.random()}`,
		};
	};

	// Update object placement to follow curvature
	const updateObjectPositionForCurve = (position: [number, number, number], curveAngle: number) => {
		const [x, y, z] = position;
		const newX = x * Math.cos(curveAngle) - z * Math.sin(curveAngle);
		const newZ = x * Math.sin(curveAngle) + z * Math.cos(curveAngle);
		return [newX, y, newZ] as [number, number, number];
	};

	// Apply curvature to obstacles only when trackSegments change
	useEffect(() => {
		setObstacles((prevObstacles) => {
			return prevObstacles.map((obstacle) => {
				const segment = trackSegments.find((seg) => seg.position === obstacle.position[2]);
				if (segment) {
					const newPosition = updateObjectPositionForCurve(obstacle.position, segment.curveAngle);
					return { ...obstacle, position: newPosition };
				}
				return obstacle;
			});
		});
	}, [trackSegments]); // Add dependency to trackSegments

	// Animation loop
	useFrame((_, delta) => {
		if (!isPlaying || isPaused) return;

		// Calculate movement amount this frame
		const moveAmount = speed * delta;

		// Update distance traveled
		distanceTraveled.current += moveAmount;
		setDistance(distanceTraveled.current);

		// Add score based on distance
		scoreCounter.current += moveAmount;
		if (scoreCounter.current >= 10) {
			addScore(Math.floor(scoreCounter.current));
			scoreCounter.current = 0;
		}

		// Increase speed gradually
		speedCounter.current += delta;
		if (speedCounter.current >= 5) {
			increaseSpeed();
			speedCounter.current = 0;
		}

		// Move track segments toward player
		setTrackSegments((prevSegments) => {
			return prevSegments
				.map((segment) => {
					// Move segment toward player
					return {
						...segment,
						position: segment.position + moveAmount,
					};
				})
				.filter((segment) => {
					// Keep segments that are still visible or just behind the player
					return segment.position < PLAYER_Z_POSITION + SEGMENT_LENGTH;
				});
		});

		// Move obstacles toward player
		setObstacles((prevObstacles) => {
			return prevObstacles
				.map((obstacle) => {
					// Move obstacle toward player (positive Z)
					const newZ = obstacle.position[2] + moveAmount;

					// Return updated obstacle with properly typed position
					return {
						...obstacle,
						position: [obstacle.position[0], obstacle.position[1], newZ] as [
							number,
							number,
							number,
						],
					};
				})
				.filter((obstacle) => {
					// Remove obstacles that are behind the player (increased range to clean up better)
					return obstacle.position[2] < PLAYER_Z_POSITION + 30;
				});
		});

		// Check if we need to add a new segment
		// Get the furthest segment (most negative Z value)
		const segments = [...trackSegments];
		segments.sort((a, b) => a.position - b.position);
		const furthestSegment = segments[0];

		// If the furthest segment is getting too close to the player, add a new one
		if (
			furthestSegment &&
			furthestSegment.position > -SEGMENT_LENGTH * (SEGMENTS_COUNT - 2)
		) {
			// Add new track segment
			setTrackSegments((prevSegments) => {
				// Create new segment further away
				const newSegmentZ = furthestSegment.position - SEGMENT_LENGTH;
				const newSegment = {
					position: newSegmentZ,
					curveAngle: furthestSegment.curveAngle,
					id: `segment-${Date.now()}-${Math.random()}`,
				};

				// Generate obstacles for the new segment
				const newObstacles = generateObstaclesForSegment(newSegmentZ);
				setObstacles((prevObstacles) => [...prevObstacles, ...newObstacles]);

				return [...prevSegments, newSegment];
			});
		}
	});

	return (
		<>
			{/* Ground plane */}
			<mesh ref={ref as any} receiveShadow position={[0, -0.01, 0]}>
				<planeGeometry args={[100, 100]} />
				<meshStandardMaterial color="#444444" />
			</mesh>

			{/* Track segments */}
			{trackSegments.map((segment) => (
				<group key={segment.id} position={[0, 0, segment.position]}>
					{/* Base track - darker asphalt color */}
					<mesh position={[0, 0.01, SEGMENT_LENGTH / 2]} receiveShadow>
						<boxGeometry args={[6, 0.02, SEGMENT_LENGTH]} />
						<meshStandardMaterial color="#333333" />
					</mesh>

					{/* Continuous Lane dividers */}
					{Array.from({ length: Math.floor(SEGMENT_LENGTH / 3) }).map((_, i) => (
					<mesh
						key={`left-dash-${i}`}
						position={[-LANE_WIDTH, 0.02, i * 3 + 1]}
						receiveShadow
					>
						<boxGeometry args={[0.1, 0.03, 1.5]} />
						<meshStandardMaterial color="white" />
					</mesh>
					))}
					{Array.from({ length: Math.floor(SEGMENT_LENGTH / 3) }).map((_, i) => (
					<mesh position={[LANE_WIDTH, 0.02, i * 3 + 1]} receiveShadow>
						<boxGeometry args={[0.1, 0.03, 1.5]} />
						<meshStandardMaterial color="white" />
					</mesh>
					))}

					{/* Center lane dashed markings */}
					{Array.from({ length: Math.floor(SEGMENT_LENGTH / 3) }).map((_, i) => (
						<mesh
							key={`center-dash-${i}`}
							position={[0, 0.02, i * 3 + 1]}
							receiveShadow
						>
							<boxGeometry args={[0.1, 0.03, 1.5]} />
							<meshStandardMaterial color="white" />
						</mesh>
					))}

					{/* Side barriers - gray guard rails */}
					<mesh position={[-3, 0.5, SEGMENT_LENGTH / 2]} receiveShadow>
						<boxGeometry args={[0.2, 1, SEGMENT_LENGTH]} />
						<meshStandardMaterial color="#888888" />
					</mesh>

					<mesh position={[3, 0.5, SEGMENT_LENGTH / 2]} receiveShadow>
						<boxGeometry args={[0.2, 1, SEGMENT_LENGTH]} />
						<meshStandardMaterial color="#888888" />
					</mesh>
				</group>
			))}

			{/* Buildings */}
			<BuildingGenerator />

			{/* Obstacles */}
			{obstacles.map((obstacle) =>
				obstacle.type === "car" ? (
					<Car
						key={obstacle.id}
						position={obstacle.position}
						color={obstacle.color}
					/>
				) : (
					<Obstacle
						key={obstacle.id}
						position={obstacle.position}
						size={obstacle.size}
						type="coin"
						color="gold"
					/>
				),
			)}

			{/* Skybox */}
			<mesh>
				<sphereGeometry args={[50, 32, 32]} />
				<meshStandardMaterial color="#87CEEB" side={THREE.BackSide} />
			</mesh>
		</>
	);
};
