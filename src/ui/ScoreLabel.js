import Phaser from "phaser";

const formatScore = (score) => `score: ${score}`;

export default class ScoreLabel extends Phaser.GameObjects.Text {
  constructor(scene, x, y, score, style) {
    //we pass these props from constructor to Text class to initalize the Text Class. this class creates a unique canvas text object in the game.
    super(scene, x, y, score, style);
    this.score = score;
  }
  setScore(score) {
    this.score = score;
    this.updateScoreText();
  }
  add(points) {
    this.setScore(this.score + points);
  }
  updateScoreText() {
    //setText is the Text class'es method which lets us update the text of the text object in the game
    this.setText(formatScore(this.score));
  }
}
