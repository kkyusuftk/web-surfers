import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Building } from './Building';
import { useGameStore } from '../store/gameStore';

// Building types for variety
const BUILDING_TYPES = [
    { width: 2, height: 3, depth: 2, color: '#555555' }, // Small gray building
    { width: 2.5, height: 4, depth: 2.5, color: '#775544' }, // Small brown building
    { width: 2, height: 3.5, depth: 2, color: '#445566' }, // Small blue-gray building
    { width: 3, height: 4, depth: 2, color: '#665544' }, // Medium brown building
    { width: 2.5, height: 3, depth: 2.5, color: '#554455' }, // Small purple-gray building
];

// Distance from road center
const ROAD_OFFSET = 7;
// Building spacing
const BUILDING_SPACING = 15;
// Total number of buildings per side
const BUILDINGS_PER_SIDE = 10;
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
        
        // Generate buildings on left side
        for (let i = 0; i < BUILDINGS_PER_SIDE; i++) {
            const z = -i * BUILDING_SPACING;
            const typeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
            const type = BUILDING_TYPES[typeIndex];
            
            initialBuildings.push({
                id: `left-${i}`,
                position: [-ROAD_OFFSET, type.height / 2, z] as [number, number, number],
                width: type.width,
                height: type.height,
                depth: type.depth,
                color: type.color
            });
        }
        
        // Generate buildings on right side
        for (let i = 0; i < BUILDINGS_PER_SIDE; i++) {
            const z = -i * BUILDING_SPACING;
            const typeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
            const type = BUILDING_TYPES[typeIndex];
            
            initialBuildings.push({
                id: `right-${i}`,
                position: [ROAD_OFFSET, type.height / 2, z] as [number, number, number],
                width: type.width,
                height: type.height,
                depth: type.depth,
                color: type.color
            });
        }
        
        return initialBuildings;
    }
    
    // Function to create a new building
    function createNewBuilding(side: 'left' | 'right', z: number): BuildingData {
        const typeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
        const type = BUILDING_TYPES[typeIndex];
        const x = side === 'left' ? -ROAD_OFFSET : ROAD_OFFSET;
        
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
                    const side = building.position[0] < 0 ? 'left' : 'right';
                    // Find the furthest building on this side
                    const furthestBuilding = movedBuildings
                        .filter(b => (b.position[0] < 0) === (side === 'left'))
                        .reduce((prev, curr) => 
                            prev.position[2] < curr.position[2] ? prev : curr
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