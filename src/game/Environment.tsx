import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePlane } from '@react-three/cannon';
import { useGameStore } from '../store/gameStore';
import * as THREE from 'three';
import { Obstacle } from './Obstacle';
import { Car } from './Car';

// Track segment length
const SEGMENT_LENGTH = 60;
// Number of segments to keep loaded
const SEGMENTS_COUNT = 7;
// Lane width
const LANE_WIDTH = 2;
// Player Z position (fixed)
const PLAYER_Z_POSITION = 0;

// Obstacle types
type ObstacleType = {
  position: [number, number, number];
  size: [number, number, number];
  type: 'car' | 'coin';
  id: string;
  color?: string;
};

// Track segment type
type TrackSegmentType = {
  position: number;
  id: string;
};

export const Environment = () => {
  const { isPlaying, speed, addScore, addCoin, increaseSpeed, distance, setDistance } = useGameStore();
  
  // Create a physics plane for the ground
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0], // Rotate to be horizontal
    position: [0, 0, 0],
    type: 'Static',
  }));

  // Track segments
  const trackRef = useRef<THREE.Group>(null);
  // Distance traveled
  const distanceTraveled = useRef(0);
  // Last segment position
  const lastSegmentPosition = useRef(0);
  // Score counter
  const scoreCounter = useRef(0);
  // Speed increase counter
  const speedCounter = useRef(0);
  
  // State for obstacles
  const [obstacles, setObstacles] = useState<ObstacleType[]>([]);
  // State for track segments
  const [trackSegments, setTrackSegments] = useState<TrackSegmentType[]>([]);

  // Initialize or reset the game environment
  const initializeEnvironment = () => {
    // Reset all counters
    distanceTraveled.current = 0;
    lastSegmentPosition.current = 0;
    scoreCounter.current = 0;
    speedCounter.current = 0;
    
    // Create initial track segments
    const initialSegments = Array.from({ length: SEGMENTS_COUNT }, (_, i) => ({
      position: PLAYER_Z_POSITION - i * SEGMENT_LENGTH,
      id: `segment-initial-${i}-${Date.now()}`
    }));
    
    setTrackSegments(initialSegments);
    
    // Generate initial obstacles
    let initialObstacles: ObstacleType[] = [];
    initialSegments.forEach(segment => {
      initialObstacles = [...initialObstacles, ...generateObstaclesForSegment(segment.position)];
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
    
    // Increased minimum number of obstacles per segment
    const obstacleCount = Math.floor(Math.random() * 4) + 5; // 5-8 obstacles per segment
    
    // Divide the segment into sections to ensure more even distribution
    const sectionLength = SEGMENT_LENGTH / obstacleCount;
    
    // Track which lanes were used in the previous section to avoid too many obstacles in the same lane
    let previousLane = 0;
    
    for (let i = 0; i < obstacleCount; i++) {
      // Random lane: -1 (left), 0 (center), 1 (right)
      // Avoid placing too many obstacles in the same lane consecutively
      let lane;
      if (Math.random() < 0.7) {
        // 70% chance to avoid the previous lane
        do {
          lane = Math.floor(Math.random() * 3) - 1;
        } while (lane === previousLane);
      } else {
        lane = Math.floor(Math.random() * 3) - 1;
      }
      previousLane = lane;
      
      // Position within this section (add some randomness but keep in section)
      const sectionStart = segmentZ + (i * sectionLength);
      const z = sectionStart + (Math.random() * 0.6 + 0.2) * sectionLength; // 20-80% into section
      
      // Random type (70% car, 30% coin)
      const type = Math.random() > 0.3 ? 'car' : 'coin';
      
      // Height based on type - coins at player mid-height for easier collection
      const y = type === 'coin' ? 0.8 : 0.5;
      
      // Random car color
      const carColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];
      const color = carColors[Math.floor(Math.random() * carColors.length)];
      
      // Ensure we don't place obstacles too close to the start of the first segment
      if (segmentZ === PLAYER_Z_POSITION && i === 0) {
        // Skip the first obstacle in the first segment to give player time to react
        continue;
      }
      
      newObstacles.push({
        position: [lane * LANE_WIDTH, y, z],
        size: type === 'car' ? [1.2, 0.9, 2] : [0.8, 0.05, 0.8],
        type,
        color: type === 'car' ? color : 'gold',
        id: `obstacle-${Date.now()}-${Math.random()}`
      });
    }
    
    return newObstacles;
  };

  // Animation loop
  useFrame((_, delta) => {
    if (!isPlaying) return;
    
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
    setTrackSegments(prevSegments => {
      return prevSegments.map(segment => {
        // Move segment toward player
        return {
          ...segment,
          position: segment.position + moveAmount
        };
      }).filter(segment => {
        // Keep segments that are still visible or just behind the player
        return segment.position < PLAYER_Z_POSITION + SEGMENT_LENGTH;
      });
    });
    
    // Move obstacles toward player
    setObstacles(prevObstacles => {
      return prevObstacles.map(obstacle => {
        // Move obstacle toward player (positive Z)
        const newZ = obstacle.position[2] + moveAmount;
        
        // Return updated obstacle with properly typed position
        return {
          ...obstacle,
          position: [obstacle.position[0], obstacle.position[1], newZ] as [number, number, number]
        };
      }).filter(obstacle => {
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
    if (furthestSegment && furthestSegment.position > -SEGMENT_LENGTH * (SEGMENTS_COUNT - 2)) {
      // Add new track segment
      setTrackSegments(prevSegments => {
        // Create new segment further away
        const newSegmentZ = furthestSegment.position - SEGMENT_LENGTH;
        const newSegment = {
          position: newSegmentZ,
          id: `segment-${Date.now()}-${Math.random()}`
        };
        
        // Generate obstacles for the new segment
        const newObstacles = generateObstaclesForSegment(newSegmentZ);
        setObstacles(prevObstacles => [...prevObstacles, ...newObstacles]);
        
        return [...prevSegments, newSegment];
      });
    }
  });

  return (
    <>
      {/* Ground plane - extended to be much larger */}
      <mesh ref={ref as any} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Track segments */}
      {trackSegments.map((segment) => (
        <group key={segment.id} position={[0, 0, segment.position]}>
          {/* Base track */}
          <mesh position={[0, 0.01, SEGMENT_LENGTH / 2]} receiveShadow>
            <boxGeometry args={[6, 0.02, SEGMENT_LENGTH]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
          
          {/* Lane dividers */}
          <mesh position={[-LANE_WIDTH, 0.02, SEGMENT_LENGTH / 2]} receiveShadow>
            <boxGeometry args={[0.1, 0.03, SEGMENT_LENGTH]} />
            <meshStandardMaterial color="white" />
          </mesh>
          
          <mesh position={[LANE_WIDTH, 0.02, SEGMENT_LENGTH / 2]} receiveShadow>
            <boxGeometry args={[0.1, 0.03, SEGMENT_LENGTH]} />
            <meshStandardMaterial color="white" />
          </mesh>
          
          {/* Side barriers */}
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
      
      {/* Obstacles */}
      {obstacles.map(obstacle => (
        obstacle.type === 'car' ? (
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
        )
      ))}
      
      {/* Skybox - made larger */}
      <mesh>
        <sphereGeometry args={[200, 32, 32]} />
        <meshStandardMaterial color="#87CEEB" side={THREE.BackSide} />
      </mesh>
    </>
  );
}; 