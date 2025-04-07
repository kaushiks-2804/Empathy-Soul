import { ChatInterface } from './components/ChatInterface';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Avatar } from './components/Avatar';

export function Experience() {
    return (
        <>
            <Canvas shadows camera={{ position: [0, 2, 5], fov: 30 }}>
                <color attach="background" args={["#ffe5e5"]} />
                <Environment preset="sunset" />
                <Avatar />
            </Canvas>
            <ChatInterface />
        </>
    );
} 