import PositionedCharacter from "./PositionedCharacter";
import Bowman from "./characters/Bowman";
import Daemon from "./characters/Daemon";
import Magician from "./characters/Magician";
import Swordsman from "./characters/Swordsman";
import Undead from "./characters/Undead";
import Vampire from "./characters/Vampire";

export default class GameState {
  constructor(
    currentPlayer = 'player',
    level = 1,
    maxScore = 0,
    gameOver = false,
    positions = [],
    selectedCharacter = null,
    themeIndex = 0
  ) {
    this.currentPlayer = currentPlayer;
    this.level = level;
    this.maxScore = maxScore;
    this.gameOver = gameOver;
    this.positions = positions,
    this.selectedCharacter = selectedCharacter;
    this.themeIndex = themeIndex;
  }
  
  static from(object) {
    // TODO: create object
    if (!object) {
      return new GameState();
    }

    // Воссоздаем объекты PositionedCharacter из сохраненных данных
    const positions = object.positions.map(posChar => {
      const characterClass = this.getClassForType(posChar.character.type);
      const character = new characterClass(
        posChar.character.level,
        posChar.character.attack,
        posChar.character.defence,
        posChar.character.health
      );
      return new PositionedCharacter(character, posChar.position);
    });

    // Восстанавливаем выбранного персонажа
    let selectedCharacter = null;
    if (object.selectedCharacter) {
      selectedCharacter = positions.find(posChar => 
        posChar.position === object.selectedCharacter.position &&
        posChar.character.type === object.selectedCharacter.character.type
      );
    }

   
    return new GameState(
      object.currentPlayer,
      object.level,
      object.maxScore,
      object.gameOver,
      positions,
      selectedCharacter,
      object.themeIndex
    );
  }

  // Получаем класс персонажа по его типу
  static getClassForType(type) {
    const typeMap = {
      bowman: Bowman,
      swordsman: Swordsman,
      magician: Magician,
      daemon: Daemon,
      undead: Undead,
      vampire: Vampire
    };
    return typeMap[type];
  }

  // Сериализация состояния для сохранения
  toJSON() {
    return {
      currentPlayer: this.currentPlayer,
      level: this.level,
      maxScore: this.maxScore,
      gameOver: this.gameOver,
      positions: this.positions,
      selectedCharacter: this.selectedCharacter,
      themeIndex: this.themeIndex
    };
  }
}
