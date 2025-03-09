import { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Building } from './Building';
import { useGameStore } from '../store/gameStore';

// Building types for variety - added more types
const BUILDING_TYPES = [
    { width: 2, height: 3, depth: 2, color: '#555555' }, // Small gray building
    { width: 2.5, height: 4, depth: 2.5, color: '#775544' }, // Small brown building
    { width: 2, height: 3.5, depth: 2, color: '#445566' }, // Small blue-gray building
    { width: 3, height: 4, depth: 2, color: '#665544' }, // Medium brown building
    { width: 2.5, height: 3, depth: 2.5, color: '#554455' }, // Small purple-gray building
    { width: 2.2, height: 3.2, depth: 2.2, color: '#665566' }, // Blue-gray building
    { width: 2.8, height: 3.8, depth: 2.8, color: '#556677' }, // Blue building
    { width: 2.3, height: 3.5, depth: 2.3, color: '#665555' }, // Red-brown building
    { width: 2.7, height: 4.2, depth: 2.7, color: '#777777' }, // Gray building
    { width: 2.4, height: 3.7, depth: 2.4, color: '#444444' }, // Dark building
    { width: 1.8, height: 2.8, depth: 1.8, color: '#998877' }, // Tan building
    { width: 3.2, height: 5, depth: 3.2, color: '#334455' }, // Tall blue building
    { width: 2.1, height: 3.1, depth: 2.1, color: '#553322' }, // Dark brown building
    { width: 2.6, height: 4.5, depth: 2.6, color: '#666699' }, // Purple building
    { width: 1.9, height: 2.5, depth: 1.9, color: '#889988' }, // Green-gray building
];

// Find the widest building to calculate safe distance
const MAX_BUILDING_WIDTH = Math.max(...BUILDING_TYPES.map(type => type.width));
// Barrier is at ±3, ensure buildings don't overlap by positioning them at barrier + half of widest building
const BARRIER_POSITION = 3;
// Distance from road center - calculated to prevent overlap with barriers
const ROAD_OFFSET = BARRIER_POSITION + (MAX_BUILDING_WIDTH / 2) + 0.1; // Extra 0.1 for safety margin
// Total number of buildings per side - increased for maximum density
const BUILDINGS_PER_SIDE = 50;
// Row offsets for multiple rows of buildings - adjusted to maintain proper spacing
const SECOND_ROW_OFFSET = MAX_BUILDING_WIDTH + 0.2;
const THIRD_ROW_OFFSET = (MAX_BUILDING_WIDTH * 2) + 0.4;
// Total distance covered by buildings

interface BuildingData {
    id: string;
    position: [number, number, number];
    width: number;
    height: number;
    depth: number;
    color: string;
}

export const BuildingGenerator = () => {
    const { speed, isPlaying, isPaused } = useGameStore();
    const [buildings, setBuildings] = useState<BuildingData[]>(() => generateInitialBuildings());
    
    // Function to generate initial buildings
    function generateInitialBuildings(): BuildingData[] {
        const initialBuildings: BuildingData[] = [];
        
        // Generate buildings on left side - first row
        let currentZ = 0;
        for (let i = 0; i < BUILDINGS_PER_SIDE; i++) {
            const typeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
            const type = BUILDING_TYPES[typeIndex];
            
            // Position based on building depth (half depth for the first building)
            if (i === 0) {
                currentZ = -type.depth / 2;
            }
            
            initialBuildings.push({
                id: `left-1-${i}`,
                position: [-ROAD_OFFSET, type.height / 2, currentZ] as [number, number, number],
                width: type.width,
                height: type.height,
                depth: type.depth,
                color: type.color
            });
            
            // Move pointer by exactly the depth of the building (making them adjacent)
            currentZ -= type.depth;
        }
        
        // Generate buildings on left side - second row
        currentZ = 0;
        for (let i = 0; i < BUILDINGS_PER_SIDE; i++) {
            const typeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
            const type = BUILDING_TYPES[typeIndex];
            
            // Position based on building depth (half depth for the first building)
            if (i === 0) {
                currentZ = -type.depth / 2;
            }
            
            initialBuildings.push({
                id: `left-2-${i}`,
                position: [-ROAD_OFFSET - SECOND_ROW_OFFSET, type.height / 2, currentZ] as [number, number, number],
                width: type.width,
                height: type.height,
                depth: type.depth,
                color: type.color
            });
            
            // Move pointer by exactly the depth of the building
            currentZ -= type.depth;
        }
        
        // Generate buildings on left side - third row
        currentZ = 0;
        for (let i = 0; i < BUILDINGS_PER_SIDE; i++) {
            const typeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
            const type = BUILDING_TYPES[typeIndex];
            
            // Position based on building depth (half depth for the first building)
            if (i === 0) {
                currentZ = -type.depth / 2;
            }
            
            initialBuildings.push({
                id: `left-3-${i}`,
                position: [-ROAD_OFFSET - THIRD_ROW_OFFSET, type.height / 2, currentZ] as [number, number, number],
                width: type.width,
                height: type.height,
                depth: type.depth,
                color: type.color
            });
            
            // Move pointer by exactly the depth of the building
            currentZ -= type.depth;
        }
        
        // Generate buildings on right side - first row
        currentZ = 0;
        for (let i = 0; i < BUILDINGS_PER_SIDE; i++) {
            const typeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
            const type = BUILDING_TYPES[typeIndex];
            
            // Position based on building depth (half depth for the first building)
            if (i === 0) {
                currentZ = -type.depth / 2;
            }
            
            initialBuildings.push({
                id: `right-1-${i}`,
                position: [ROAD_OFFSET, type.height / 2, currentZ] as [number, number, number],
                width: type.width,
                height: type.height,
                depth: type.depth,
                color: type.color
            });
            
            // Move pointer by exactly the depth of the building
            currentZ -= type.depth;
        }
        
        // Generate buildings on right side - second row
        currentZ = 0;
        for (let i = 0; i < BUILDINGS_PER_SIDE; i++) {
            const typeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
            const type = BUILDING_TYPES[typeIndex];
            
            // Position based on building depth (half depth for the first building)
            if (i === 0) {
                currentZ = -type.depth / 2;
            }
            
            initialBuildings.push({
                id: `right-2-${i}`,
                position: [ROAD_OFFSET + SECOND_ROW_OFFSET, type.height / 2, currentZ] as [number, number, number],
                width: type.width,
                height: type.height,
                depth: type.depth,
                color: type.color
            });
            
            // Move pointer by exactly the depth of the building
            currentZ -= type.depth;
        }
        
        // Generate buildings on right side - third row
        currentZ = 0;
        for (let i = 0; i < BUILDINGS_PER_SIDE; i++) {
            const typeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
            const type = BUILDING_TYPES[typeIndex];
            
            // Position based on building depth (half depth for the first building)
            if (i === 0) {
                currentZ = -type.depth / 2;
            }
            
            initialBuildings.push({
                id: `right-3-${i}`,
                position: [ROAD_OFFSET + THIRD_ROW_OFFSET, type.height / 2, currentZ] as [number, number, number],
                width: type.width,
                height: type.height,
                depth: type.depth,
                color: type.color
            });
            
            // Move pointer by exactly the depth of the building
            currentZ -= type.depth;
        }
        
        return initialBuildings;
    }
    
    // Update buildings on each frame
    useFrame((_, delta) => {
        if (!isPlaying || isPaused) return;
        
        // Calculate movement amount
        const moveAmount = speed * delta;
        
        setBuildings(prevBuildings => {
            // Move all buildings forward
            const movedBuildings = prevBuildings.map(building => ({
                ...building,
                position: [
                    building.position[0],
                    building.position[1],
                    building.position[2] + moveAmount
                ] as [number, number, number]
            }));
            
            // Check if we need to reposition any buildings that have gone too far
            const updatedBuildings = movedBuildings.map(building => {
                // If building has moved past the player by a certain amount, move it to the back
                if (building.position[2] > 20) {
                    // Determine which side and row the building is on
                    let side: 'left-1' | 'left-2' | 'left-3' | 'right-1' | 'right-2' | 'right-3';
                    if (building.position[0] < -ROAD_OFFSET - SECOND_ROW_OFFSET - 2) {
                        side = 'left-3';
                    } else if (building.position[0] < -ROAD_OFFSET - 2) {
                        side = 'left-2';
                    } else if (building.position[0] < 0) {
                        side = 'left-1';
                    } else if (building.position[0] < ROAD_OFFSET + 2) {
                        side = 'right-1';
                    } else if (building.position[0] < ROAD_OFFSET + SECOND_ROW_OFFSET + 2) {
                        side = 'right-2';
                    } else {
                        side = 'right-3';
                    }
                    
                    // Find the furthest building on this side
                    const sideBuildings = movedBuildings.filter(b => {
                        if (side === 'left-1') {
                            return b.position[0] > -ROAD_OFFSET - 2 && b.position[0] < 0;
                        } else if (side === 'left-2') {
                            return b.position[0] < -ROAD_OFFSET - 2 && b.position[0] > -ROAD_OFFSET - SECOND_ROW_OFFSET - 2;
                        } else if (side === 'left-3') {
                            return b.position[0] <= -ROAD_OFFSET - SECOND_ROW_OFFSET - 2;
                        } else if (side === 'right-1') {
                            return b.position[0] > 0 && b.position[0] < ROAD_OFFSET + 2;
                        } else if (side === 'right-2') {
                            return b.position[0] >= ROAD_OFFSET + 2 && b.position[0] < ROAD_OFFSET + SECOND_ROW_OFFSET + 2;
                        } else {
                            return b.position[0] >= ROAD_OFFSET + SECOND_ROW_OFFSET + 2;
                        }
                    });
                    
                    const furthestBuilding = sideBuildings.reduce((prev, curr) => 
                        prev.position[2] < curr.position[2] ? prev : curr, 
                        sideBuildings[0] || building
                    );
                    
                    // Create a new building with updated properties
                    const newTypeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
                    const newType = BUILDING_TYPES[newTypeIndex];
                    
                    // Position this building directly adjacent to the furthest one
                    // Calculate position so there's no gap (building edge to building edge)
                    const newZ = furthestBuilding.position[2] - (furthestBuilding.depth / 2) - (newType.depth / 2);
                    
                    return {
                        ...building,
                        position: [building.position[0], newType.height / 2, newZ] as [number, number, number],
                        width: newType.width,
                        height: newType.height,
                        depth: newType.depth,
                        color: newType.color,
                        id: `${side}-${Date.now()}-${Math.random()}`
                    };
                }
                return building;
            });
            
            return updatedBuildings;
        });
    });
    
    return (
        <>
            {buildings.map(building => (
                <Building
                    key={building.id}
                    position={building.position}
                    width={building.width}
                    height={building.height}
                    depth={building.depth}
                    color={building.color}
                />
            ))}
        </>
    );
}; 