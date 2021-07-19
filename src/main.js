import Phaser from "phaser";

import GameScene from "./scenes/GameScene";
//this config object describes the main info about the game:height, width, using canvas or webgl, which physics engine its gonna use. Our game scene is inserted in this config too.
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
    },
  },
  scene: [GameScene],
};
//phaser game is initiated with our config file
export default new Phaser.Game(config);
