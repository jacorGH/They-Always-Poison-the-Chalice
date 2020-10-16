import Phaser from "phaser";
import Game from "./scenes/game.js";

const config = {
	type: Phaser.AUTO,
	parent: "phaser-example",
	width: 1280,
	height: 720,
	scene: [
		Game
	]
};

const game = new Phaser.Game(config);