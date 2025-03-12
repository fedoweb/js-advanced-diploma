export default class GameState {
  constructor(currentPlayer = 'player') {
    this.currentPlayer = currentPlayer;
  }
  
  static from(object) {
    // TODO: create object
    if (object && object.currentPlayer) {
      return new GameState(object.currentPlayer);
    }
    return new GameState();
    //return null;
  }
}
