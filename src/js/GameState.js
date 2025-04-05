export default class GameState {
  constructor(
    currentPlayer = 'player',
    level = 1,
    maxScore = 0,
    gameOver = false,
    positions = []
  ) {
    this.currentPlayer = currentPlayer;
    this.level = level;
    this.maxScore = maxScore;
    this.gameOver = gameOver;
    this.positions = positions
  }
  
  static from(object) {
    // TODO: create object
    if (object) {
      return new GameState(
        object.currentPlayer,
        object.level,
        object.maxScore,
        object.gameOver,
        object.positions);
    }
    return new GameState();
    //return null;
  }
}
