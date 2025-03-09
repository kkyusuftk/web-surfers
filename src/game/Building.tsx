import * as THREE from 'three';

interface BuildingProps {
    position: [number, number, number];
    width: number;
    height: number;
    depth: number;
    color: string;
}

export const Building = ({ position, width, height, depth, color }: BuildingProps) => {
    return (
        <mesh position={position} castShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}; 