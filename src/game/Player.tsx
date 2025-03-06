import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";
import { getSounds } from "./useSounds";

const LANE_WIDTH = 2;
const JUMP_HEIGHT = 2.5;
const ROLL_DURATION = 800;
const JUMP_DURATION = 600;


export const Player = () => {
	const {
		lane,
		isJumping,
		isRolling,
		isPlaying,
		isPaused,
		gameOver,
		endGame,
		speed,
		setJumping,
		setRolling,
	} = useGameStore();

	// Animation state
	const [runCycle, setRunCycle] = useState(0);

	// Target lane position for smooth transitions
	const targetLanePosition = useRef(0);

	// Jump state
	const jumpStartTime = useRef(0);
	const isJumpingRef = useRef(false);
	const canJump = useRef(true); // Flag to prevent continuous jumping

	// Roll state
	const rollStartTime = useRef(0);
	const isRollingRef = useRef(false);
	const canRoll = useRef(true); // Flag to prevent continuous rolling
	const rollRotation = useRef(0); // Track roll rotation

	// Create a physics body for the player
	const [ref, api] = useBox(() => ({
		mass: 1,
		type: "Dynamic",
		position: [0, 0.5, 0],
		args: [0.5, 1, 0.5],
		fixedRotation: true,
		allowSleep: false,
		userData: { type: "player" },
		onCollide: (e) => {
			if (
				e.body.userData?.type === "barrier" ||
				e.body.userData?.type === "car"
			) {
				endGame();
			}
		},
	}));

	// Store velocity and position in refs for use in animations
	const velocity = useRef([0, 0, 0]);
	const position = useRef([0, 0, 0]); // Initialize with zeros

	// Player model group ref for animations
	const playerModelRef = useRef<THREE.Group>(null);

	// Subscribe to physics updates
	useEffect(() => {
		const unsubscribeVelocity = api.velocity.subscribe(
			(v) => (velocity.current = v),
		);
		const unsubscribePosition = api.position.subscribe(
			(p) => (position.current = p),
		);

		return () => {
			unsubscribeVelocity();
			unsubscribePosition();
		};
	}, [api]);

	// Reset player position when game starts
	useEffect(() => {
		if (isPlaying) {
			// Reset position to center
			api.position.set(0, 0.5, 0);
			position.current = [0, 0.5, 0];
			targetLanePosition.current = 0;

			// Reset all animation states
			if (playerModelRef.current) {
				playerModelRef.current.rotation.x = 0;
				playerModelRef.current.position.y = 0;
				playerModelRef.current.children.forEach((child) => {
					if (child instanceof THREE.Mesh) {
						child.rotation.x = 0;
						child.position.z = 0;
					}
				});
			}

			// Reset all refs
			isJumpingRef.current = false;
			canJump.current = true;
			isRollingRef.current = false;
			canRoll.current = true;
			rollRotation.current = 0;
			setRunCycle(0);
		}
	}, [isPlaying, api]);

	// Update target lane position when lane changes
	useEffect(() => {
		targetLanePosition.current = lane * LANE_WIDTH;
	}, [lane]);

	// Handle jumping
	useEffect(() => {
		// Only start a jump if we're not already jumping, not rolling, and can jump
		if (
			isJumping &&
			!isJumpingRef.current &&
			!isRollingRef.current &&
			canJump.current
		) {
			isJumpingRef.current = true;
			canJump.current = false; // Prevent new jumps until this one completes
			jumpStartTime.current = Date.now();

			// Play jump sound
			getSounds().playJumpSound();

			// End jump after duration
			const jumpTimer = setTimeout(() => {
				isJumpingRef.current = false;
				setJumping(false); // Reset the jump state in the store
				canJump.current = true; // Immediately allow new jumps
			}, JUMP_DURATION);

			return () => clearTimeout(jumpTimer);
		}
	}, [isJumping, setJumping]);

	// Handle rolling
	useEffect(() => {
		// Only start a roll if we're not already rolling, not jumping, and can roll
		if (
			isRolling &&
			!isRollingRef.current &&
			!isJumpingRef.current &&
			canRoll.current
		) {
			isRollingRef.current = true;
			canRoll.current = false; // Prevent new rolls until this one completes
			rollStartTime.current = Date.now();

			// End roll after duration
			const rollTimer = setTimeout(() => {
				isRollingRef.current = false;
				setRolling(false); // Reset the roll state in the store

				// Allow a new roll after a small delay
				setTimeout(() => {
					canRoll.current = true;
				}, 100);
			}, ROLL_DURATION);

			return () => clearTimeout(rollTimer);
		}
	}, [isRolling, setRolling]);

	// Animation loop
	useFrame((_, delta) => {
		if (!isPlaying || gameOver || isPaused) return;

		// Smooth lane transitions - apply to player position
		// Use a smaller lerp factor for smoother transitions
		const lerpFactor = Math.min(delta * 5, 0.1); // Cap the lerp factor to prevent jitter
		const currentX = position.current[0];
		const newX = THREE.MathUtils.lerp(
			currentX,
			targetLanePosition.current,
			lerpFactor
		);

		// Handle jumping
		if (isJumpingRef.current) {
			const jumpElapsed = Date.now() - jumpStartTime.current;
			const jumpProgress = Math.min(jumpElapsed / JUMP_DURATION, 1.0);

			// Smooth parabolic jump curve using sine for up and down motion
			const jumpCurve = Math.sin(jumpProgress * Math.PI);
			const height = jumpCurve * JUMP_HEIGHT;

			// Set position directly for more reliable jumping
			api.position.set(newX, 0.5 + Math.max(0, height), position.current[2]);

			// Animate the player model for jumping
			if (playerModelRef.current) {
				// More dynamic leg animation based on jump phase
				if (jumpProgress < 0.3) {
					// Initial crouch before jump
					playerModelRef.current.children[1].rotation.x = 0.5;
					playerModelRef.current.children[2].rotation.x = 0.5;
					playerModelRef.current.position.y = -0.1;
				} else if (jumpProgress < 0.5) {
					// Going up - extend legs
					const extendProgress = (jumpProgress - 0.3) / 0.2;
					playerModelRef.current.children[1].rotation.x =
						0.5 - extendProgress * 1.3;
					playerModelRef.current.children[2].rotation.x =
						0.5 - extendProgress * 1.3;
					playerModelRef.current.position.y = -0.1 + extendProgress * 0.1;
				} else if (jumpProgress < 0.8) {
					// At peak - tuck legs slightly
					playerModelRef.current.children[1].rotation.x = -0.4;
					playerModelRef.current.children[2].rotation.x = -0.4;
				} else {
					// Landing - extend legs
					const landProgress = (jumpProgress - 0.8) / 0.2;
					playerModelRef.current.children[1].rotation.x =
						-0.4 + landProgress * 0.4;
					playerModelRef.current.children[2].rotation.x =
						-0.4 + landProgress * 0.4;
				}

				// Add slight forward tilt during jump
				playerModelRef.current.rotation.x = -0.2 * jumpCurve;
			}

			// End jump if we've reached the end of the duration
			if (jumpProgress >= 1.0) {
				if (playerModelRef.current) {
					// Reset all rotations smoothly
					playerModelRef.current.rotation.x = 0;
					playerModelRef.current.children[1].rotation.x = 0;
					playerModelRef.current.children[2].rotation.x = 0;
					playerModelRef.current.position.y = 0;
				}

				isJumpingRef.current = false;
				setJumping(false);
				canJump.current = true; // Immediately allow new jumps
			}
		} else if (isRollingRef.current) {
			// Rolling animation
			const rollElapsed = Date.now() - rollStartTime.current;
			const rollProgress = Math.min(rollElapsed / ROLL_DURATION, 1.0);

			// Calculate rotation for a full 360-degree roll (negative for forward roll)
			rollRotation.current = -rollProgress * Math.PI * 2;

			// Apply position - slightly lower during roll
			api.position.set(newX, 0.3, position.current[2]);

			if (playerModelRef.current) {
				// Apply rotation to the entire player model
				playerModelRef.current.rotation.x = rollRotation.current;

				// Tuck in limbs during roll
				playerModelRef.current.children[1].rotation.x = 1.2;
				playerModelRef.current.children[2].rotation.x = 1.2;

				// Make the player into a ball shape during roll (adjust sine for forward roll)
				playerModelRef.current.children[0].position.z =
					-0.2 * Math.sin(rollRotation.current);
				playerModelRef.current.children[3].position.z =
					-0.2 * Math.sin(rollRotation.current);
			}

			// End roll if we've reached the end of the duration
			if (rollProgress >= 1.0) {
				// Reset player model rotation and positions
				if (playerModelRef.current) {
					playerModelRef.current.rotation.x = 0;
					playerModelRef.current.children[0].position.z = 0; // Reset body position
					playerModelRef.current.children[3].position.z = 0; // Reset head position
				}

				// Reset player height
				api.position.set(newX, 0.5, position.current[2]);

				isRollingRef.current = false;
				setRolling(false);

				// Allow a new roll after a small delay
				setTimeout(() => {
					canRoll.current = true;
				}, 100);
			}
		} else {
			// Normal ground movement
			api.position.set(newX, 0.5, position.current[2]);

			// Running animation
			if (playerModelRef.current) {
				// Update run cycle
				setRunCycle((prev) => (prev + delta * speed) % (Math.PI * 2));

				// Animate legs
				const legMovement = Math.sin(runCycle) * 0.4;
				playerModelRef.current.children[1].rotation.x = legMovement; // Left leg
				playerModelRef.current.children[2].rotation.x = -legMovement; // Right leg

				// Slight body bounce
				playerModelRef.current.position.y = Math.abs(Math.sin(runCycle)) * 0.05;

				// Reset any roll rotation
				playerModelRef.current.rotation.x = 0;
			}
		}
	});

	return (
		<mesh ref={ref as any} castShadow name="player" rotation={[0, Math.PI, 0]}>
			{/* Player model - rotated to face forward */}
			<group ref={playerModelRef}>
				{/* Body */}
				<mesh position={[0, 0.25, 0]} castShadow>
					<boxGeometry args={[0.5, 0.5, 0.3]} />
					<meshStandardMaterial color="hotpink" />
				</mesh>

				{/* Left leg */}
				<mesh position={[-0.15, -0.25, 0]} castShadow>
					<boxGeometry args={[0.15, 0.5, 0.15]} />
					<meshStandardMaterial color="hotpink" />
				</mesh>

				{/* Right leg */}
				<mesh position={[0.15, -0.25, 0]} castShadow>
					<boxGeometry args={[0.15, 0.5, 0.15]} />
					<meshStandardMaterial color="hotpink" />
				</mesh>

				{/* Head */}
				<mesh position={[0, 0.65, 0]} castShadow>
					<sphereGeometry args={[0.2, 16, 16]} />
					<meshStandardMaterial color="hotpink" />
				</mesh>

				{/* Eyes - moved to the front of the face */}
				<mesh position={[0.07, 0.7, -0.15]} castShadow>
					<sphereGeometry args={[0.05, 16, 16]} />
					<meshStandardMaterial color="white" />
				</mesh>

				<mesh position={[-0.07, 0.7, -0.15]} castShadow>
					<sphereGeometry args={[0.05, 16, 16]} />
					<meshStandardMaterial color="white" />
				</mesh>

				{/* Pupils - moved to the front of the face */}
				<mesh position={[0.07, 0.7, -0.19]} castShadow>
					<sphereGeometry args={[0.02, 16, 16]} />
					<meshStandardMaterial color="black" />
				</mesh>

				<mesh position={[-0.07, 0.7, -0.19]} castShadow>
					<sphereGeometry args={[0.02, 16, 16]} />
					<meshStandardMaterial color="black" />
				</mesh>
			</group>
		</mesh>
	);
};
