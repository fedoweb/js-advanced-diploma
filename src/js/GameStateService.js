import GamePlay from "./GamePlay";

export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
  }

  save(state) {
    this.storage.setItem('state', JSON.stringify(state));
  }

  load() {
    try {
      return JSON.parse(this.storage.getItem('state'));
    } catch (e) {
      GamePlay.showError('Invalid state');
      throw new Error(e);
    }
  }
}
