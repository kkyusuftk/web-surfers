# Web Surfers

A web-based endless runner game inspired by Subway Surfers, built with React, Three.js, and TypeScript.

## Features

- 3D endless runner gameplay
- WASD controls (W: Jump, A: Left, S: Roll, D: Right)
- Physics-based gameplay with collision detection
- Score and coin collection system
- Progressive difficulty (speed increases over time)
- Responsive UI with game state management

## Technologies Used

- React 19
- TypeScript
- Three.js for 3D rendering
- React Three Fiber (React bindings for Three.js)
- React Three Drei (useful helpers for React Three Fiber)
- React Three Cannon (physics engine)
- Zustand (state management)
- Vite (build tool)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (v7 or higher)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/web-surfers.git
cd web-surfers
```

2. Install dependencies
```bash
pnpm install
```

3. Start the development server
```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Game Controls

- **W** or **↑**: Jump
- **A** or **←**: Move Left
- **S** or **↓**: Roll/Slide
- **D** or **→**: Move Right
- **ESC**: Pause Game
- **SPACE** or **ENTER**: Start/Resume Game

## Project Structure

- `src/game/`: Game components and logic
- `src/components/`: UI components
- `src/store/`: State management
- `src/styles/`: CSS styles
- `src/models/`: 3D models and assets

## Future Enhancements

- Character customization
- Power-ups and special abilities
- Multiple environments/themes
- Mobile touch controls
- Leaderboard system
- Sound effects and music

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Subway Surfers
- Built with React and Three.js
- Special thanks to the React Three Fiber community
