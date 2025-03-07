import { GameUI } from "./components/GameUI";
import { GameScene } from "./game/GameScene";
import "./App.css";

function App() {
	return (
		<div className="app">
			<div className="game-scene">
				<GameScene />
			</div>
			<GameUI />
		</div>
	);
}

export default App;
