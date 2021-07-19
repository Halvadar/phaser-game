import Phaser from "phaser";
import ScoreLabel from "../ui/ScoreLabel";
import BombSpawner from "./BombSpawner";
const GROUND_KEY = "ground";
const DUDE_KEY = "dude";
const STAR_KEY = "star";
const BOMB_KEY = "bomb";
const SKY_KEY = "sky";
//we are creating a phaser scene here. it extends the phaser scene, so it inherits all the necessary methods that a scene needs
export default class GameScene extends Phaser.Scene {
  constructor() {
    //we call Scene class constructor with super here, to describe the specific config setting for our GameScene
    super("game-scene");
    //Class props are initialized here
    this.player = undefined;
    this.cursor = undefined;
    this.scoreLabel = undefined;
    this.bombSpawner = undefined;
    this.stars = undefined;
    this.gameOver = false;
  }
  //preload is a special method that initializes the images necessary for our scene. this.load method is accessible here from the Scene class.
  preload() {
    //images are assigned a special key, so they are accessible later on.
    this.load.image(SKY_KEY, "assets/sky.png");
    this.load.image(GROUND_KEY, "assets/platform.png");
    this.load.image(STAR_KEY, "assets/star.png");
    this.load.image(BOMB_KEY, "assets/bomb.png");
    //spritesheet divides the png into frames based on framwWidth and frameHeight props. it makes animating an object in motion easy.
    this.load.spritesheet(DUDE_KEY, "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }
  //method for creating stuff in game. it's executed after preload method.
  create() {
    //images base point in phaser is not the top left corner of an object like in js, its the center of the image. we give the sky image x:400 y:300 coordinates, because the main game frame's size is 800/600, so the sky is centered perfectly. we access the sky image by it's assigned key
    this.add.image(400, 300, SKY_KEY);
    //these 3 methods create physical objects in the game and their representation in the application, which we can interact with using their methods.
    const platforms = this.createPlatforms();
    this.player = this.createPlayer();
    this.stars = this.createStars();

    this.scoreLabel = this.createScoreLabel(16, 16, 0);
    //BombSpawner class creates a group of bombs on initialization. we pass GameScene by "this" prop and BOMB_KEY which refers to the bomb image. using those props BombSpawner class initializes the group of bombs in this scene.
    this.bombSpawner = new BombSpawner(this, BOMB_KEY);
    const bombsGroup = this.bombSpawner.group;
    //we create collider objects between different objects in the game, which probably are listeners to the objects' coordinates. they collide when the coordinates meet.
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.stars, platforms);
    this.physics.add.collider(bombsGroup, platforms);
    //when player and bombsGroup collide hitBomb method is called with these 2 objects.
    this.physics.add.collider(
      this.player,
      bombsGroup,
      this.hitBomb,
      null,
      this
    );
    //overlap object which calls this.collectStar method with the first two arguments when their object representation coordinates meet in the game.
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );
    //returns object representation of arrow keys' states. it probably adds listeners to arrowkeys and sets the isDown property of each one to true when the arrow key is pressed. we use isDown prop in updateFunction in update() method to determine which direction the player goes.
    this.cursors = this.input.keyboard.createCursorKeys();
  }
  hitBomb(player, bomb) {
    //pause is called to stop the simulation
    this.physics.pause();
    //player is turned red
    player.setTint(0xff0000);
    //player gets into turn frame
    player.anims.play("turn");
    //gameOver is set to true, so update function doesnt check those if statements below
    this.gameOver = true;
  }
  createScoreLabel(x, y, score) {
    const style = { fontSize: "32px", fill: "#000" };
    //ScoreLabel class lets us display the score using the Text class in the game. Text class needs scene, coordinates, text and style prop to initialize, which we do by calling super method with those props in ScoreLabel class.
    const label = new ScoreLabel(this, x, y, score, style);
    this.add.existing(label);
    return label;
  }
  createPlatforms() {
    //this.physics is accessible through Scene class as well. we create static group of objects based on ground image.
    const platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, GROUND_KEY).setScale(2).refreshBody();

    platforms.create(600, 400, GROUND_KEY);
    platforms.create(50, 250, GROUND_KEY);
    platforms.create(750, 220, GROUND_KEY);

    return platforms;
  }

  createPlayer() {
    // player is a movable object in the game. it has a bounce when it hits the ground and collides with game boundaries. it's a sprite object, so different images are shown during motion.
    const player = this.physics.add.sprite(100, 450, DUDE_KEY);
    player.setBounce(0.2);

    player.setCollideWorldBounds(true);
    //we define the left, turn and right moving animations for the dude image. we define on which stroke each animation starts and which frames of the sprite the animations consist of.
    //in this case we create an animation base on the first 3 frames of the sprite and these 3 frames get repeated all throughout the animation.
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: DUDE_KEY, frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    return player;
  }
  createStars() {
    //we create movable star image group here. first one is 12 pixels away from left and the rest of them have 70 pixel distance between them.
    const stars = this.physics.add.group({
      key: STAR_KEY,
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });
    //we give each star random bounce value like we gave it to player.

    stars.children.iterate((child) => {
      //typescript says setBounceY does not exist here. Propbably because of invalid proptypes
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    return stars;
  }
  collectStar(player, star) {
    //when the player and a star touch, star disappears and score gets incremented by 10.
    star.disableBody(true, true);
    this.scoreLabel.add(10);
    if (this.stars.countActive(true) === 0) {
      //  A new batch of stars to collect
      this.stars.children.iterate((child) => {
        //proptype error here too,  but the code works
        child.enableBody(true, child.x, 0, true, true);
      });
    }
    //bombSpawner's spawn method is called with the player's x coordinate, so the new bomb gets spawned near the player in the bombs group.
    this.bombSpawner.spawn(player.x);
  }
  //update method is run every couple of milliseconds
  update() {
    //if gameOver is true no other if statements need to be checked
    if (this.gameOver) {
      return;
    }
    //we check the cursor props here and play the player anims we defined above respectively.
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);

      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);

      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);

      this.player.anims.play("turn");
    }
    //player only jumps up only when it is touching ground and the up key is pressed
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
}
