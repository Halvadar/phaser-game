import Phaser from "phaser";

export default class BombSpawner {
  constructor(scene, bombKey = "bomb") {
    this.scene = scene;
    this.key = bombKey;
    //group of bombs is created, but we dont have any bombs yet.
    this._group = this.scene.physics.add.group();
  }
  //getter function here, but not sure why we need a getter function, since we are not modifying the data before returning.
  get group() {
    return this._group;
  }

  spawn(playerX = 0) {
    //bomb gets added to the group in the left or the right half of the game frame, based on where the player is at the moment.
    const x =
      playerX < 400
        ? Phaser.Math.Between(0, 400)
        : Phaser.Math.Between(400, 800);
    const bomb = this.group.create(x, 16, this.key);
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    return bomb;
  }
}
