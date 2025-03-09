import { useState, useRef } from 'react';
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
];

// Distance from road center
const ROAD_OFFSET = 7;
// Building spacing - reduced to make buildings closer together
const BUILDING_SPACING = 10;
// Total number of buildings per side - increased
const BUILDINGS_PER_SIDE = 15;
// Second row offset
const SECOND_ROW_OFFSET = 12;
// Total distance covered by buildings
const TOTAL_DISTANCE = BUILDING_SPACING * BUILDINGS_PER_SIDE;

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
        for (let i = 0; i < BUILDINGS_PER_SIDE; i++) {
            const z = -i * BUILDING_SPACING;
            const typeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
            const type = BUILDING_TYPES[typeIndex];
            
            initialBuildings.push({
                id: `left-1-${i}`,
                position: [-ROAD_OFFSET, type.height / 2, z] as [number, number, number],
                width: type.width,
                height: type.height,
                depth: type.depth,
                color: type.color
            });
        }
        
        // Generate buildings on left side - second row
        for (let i = 0; i < BUILDINGS_PER_SIDE; i++) {
            const z = -i * BUILDING_SPACING - 5; // Offset to stagger buildings
            const typeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
            const type = BUILDING_TYPES[typeIndex];
            
            initialBuildings.push({
                id: `left-2-${i}`,
                position: [-ROAD_OFFSET - SECOND_ROW_OFFSET, type.height / 2, z] as [number, number, number],
                width: type.width,
                height: type.height,
                depth: type.depth,
                color: type.color
            });
        }
        
        // Generate buildings on right side - first row
        for (let i = 0; i < BUILDINGS_PER_SIDE; i++) {
            const z = -i * BUILDING_SPACING;
            const typeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
            const type = BUILDING_TYPES[typeIndex];
            
            initialBuildings.push({
                id: `right-1-${i}`,
                position: [ROAD_OFFSET, type.height / 2, z] as [number, number, number],
                width: type.width,
                height: type.height,
                depth: type.depth,
                color: type.color
            });
        }
        
        // Generate buildings on right side - second row
        for (let i = 0; i < BUILDINGS_PER_SIDE; i++) {
            const z = -i * BUILDING_SPACING - 5; // Offset to stagger buildings
            const typeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
            const type = BUILDING_TYPES[typeIndex];
            
            initialBuildings.push({
                id: `right-2-${i}`,
                position: [ROAD_OFFSET + SECOND_ROW_OFFSET, type.height / 2, z] as [number, number, number],
                width: type.width,
                height: type.height,
                depth: type.depth,
                color: type.color
            });
        }
        
        return initialBuildings;
    }
    
    // Function to create a new building
    function createNewBuilding(side: 'left-1' | 'left-2' | 'right-1' | 'right-2', z: number): BuildingData {
        const typeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
        const type = BUILDING_TYPES[typeIndex];
        
        let x: number;
        if (side === 'left-1') {
            x = -ROAD_OFFSET;
        } else if (side === 'left-2') {
            x = -ROAD_OFFSET - SECOND_ROW_OFFSET;
        } else if (side === 'right-1') {
            x = ROAD_OFFSET;
        } else {
            x = ROAD_OFFSET + SECOND_ROW_OFFSET;
        }
        
        return {
            id: `${side}-${Date.now()}-${Math.random()}`,
            position: [x, type.height / 2, z] as [number, number, number],
            width: type.width,
            height: type.height,
            depth: type.depth,
            color: type.color
        };
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
                    let side: 'left-1' | 'left-2' | 'right-1' | 'right-2';
                    if (building.position[0] < -ROAD_OFFSET - 2) {
                        side = 'left-2';
                    } else if (building.position[0] < 0) {
                        side = 'left-1';
                    } else if (building.position[0] < ROAD_OFFSET + 2) {
                        side = 'right-1';
                    } else {
                        side = 'right-2';
                    }
                    
                    // Find the furthest building on this side
                    const sideBuildings = movedBuildings.filter(b => {
                        if (side === 'left-1') {
                            return b.position[0] > -ROAD_OFFSET - 2 && b.position[0] < 0;
                        } else if (side === 'left-2') {
                            return b.position[0] < -ROAD_OFFSET - 2;
                        } else if (side === 'right-1') {
                            return b.position[0] > 0 && b.position[0] < ROAD_OFFSET + 2;
                        } else {
                            return b.position[0] > ROAD_OFFSET + 2;
                        }
                    });
                    
                    const furthestBuilding = sideBuildings.reduce((prev, curr) => 
                        prev.position[2] < curr.position[2] ? prev : curr, 
                        sideBuildings[0] || building
                    );
                    
                    // Position this building behind the furthest one
                    const newZ = furthestBuilding.position[2] - BUILDING_SPACING;
                    
                    // Create a new building with updated properties
                    const newTypeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
                    const newType = BUILDING_TYPES[newTypeIndex];
                    
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