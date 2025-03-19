import PositionedCharacter from "./PositionedCharacter";
import GameState from "./GameState";
import GamePlay from "./GamePlay";
import {generateTeam} from "./generators";
import Bowman from "./characters/Bowman";
import Daemon from "./characters/Daemon";
import Magician from "./characters/Magician";
import Swordsman from "./characters/Swordsman";
import Undead from "./characters/Undead";
import Vampire from "./characters/Vampire";


export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;

    // Инициализация позиций персонажей
    this.positions = this.getPositions();
    this.gameState;
  } 

  init() {
    // TODO: add event listeners to gamePlay events
    this.gamePlay.addCellClickListener((index) => this.onCellClick(index));
    this.gamePlay.addCellEnterListener((index) => this.onCellEnter(index));
    this.gamePlay.addCellLeaveListener((index) => this.onCellLeave(index));
    // TODO: load saved stated from stateService
    //this.loadSavedState();
    this.gameState = new GameState();
    console.log(this.gameState);

    this.gamePlay.drawUi('prairie');
    this.gamePlay.redrawPositions(this.positions);
  }
  
  onCellClick(index) {
    //если персонаж уже выбран
    if(this.gameState.selectedCharacter) {
      this.gamePlay.deselectCell(this.gameState.selectedCharacter.position);

      //перейти на другую клетку

      //атаковать противника
    } 

    //выбор персонажа
    const clickedCharacter = this.positions.find(char => char.position === index);
    console.log('click', this.gameState);

    if(clickedCharacter && this.isPlayer(clickedCharacter)) {

      this.gameState.selectedCharacter = clickedCharacter;
      this.gamePlay.selectCell(index);
      return;
    }

    // ошибка
    GamePlay.showError('Недопустимое действие!');
    this.gamePlay.deselectCell(index);
    this.gameState.selectedCharacter = null;
  }

  onCellEnter(index) {
    const targetCharacter = this.positions.find((char) => char.position === index);
    console.log(targetCharacter);

    //если хотим выбрать другого персонажа
    if (targetCharacter && this.gameState.selectedCharacter &&
      this.isPlayer(targetCharacter)) {
      this.gamePlay.setCursor('pointer');
      return;
    }

    //если хотим атаковать
    if (this.gameState.selectedCharacter &&
      this.isEnemy(targetCharacter) &&
      this.checkAttackRange(this.gameState.selectedCharacter, index)) {

      this.gamePlay.setCursor('crosshair');
      this.gamePlay.selectCell(index, 'red');
      return;
    }

    //если хотим переместиться в рамках допустимого
    if (this.gameState.selectedCharacter &&
      this.checkMoveRange(this.gameState.selectedCharacter, index)) { //правильно реализовать проверку на перемещение
      this.gamePlay.selectCell(index, 'green');
      return;
    }

    // Недопустимое действие
    if(this.gameState.selectedCharacter &&
      !this.checkMoveRange(this.gameState.selectedCharacter, index)) {
      this.gamePlay.setCursor('not-allowed');
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor('auto');

    if(this.gameState.selectedCharacter && this.gameState.selectedCharacter.position !== index) {
      this.gamePlay.deselectCell(index);
    }
  }

  //Возвращает массив позиций персонажей игрока и противника
  getPositions() {
    const playerTeam = this.generatePlayerTeam(this.playerTypes());
    const enemyTeam = this.generateEnemyTeam(this.enemyTypes());
    return [...playerTeam, ...enemyTeam];
  }

  //смена игрока
  changePlayer() {
    this.gameState.currentPlayer === 'player' ? 'enemy' : 'player';
  } 

  //Генерирует команду игрока
  generatePlayerTeam(allowedTypes) {
    const team = generateTeam(allowedTypes, 2, 2); 
    const teamArr = [];

    for (const character of team.characters) {
      let randomPosition = this.getPlayerPosition(this.gamePlay.boardSize);
      let validatePosition = this.validatePlayerPosition(teamArr, randomPosition);

      const person = new PositionedCharacter(character, validatePosition);
      teamArr.push(person);
    }

    return teamArr;
  }

  //Генерирует команду противника
  generateEnemyTeam(allowedTypes) {
    const team = generateTeam(allowedTypes, 2, 2); 
    const teamArr = [];

    for (const character of team.characters) {
      let randomPosition = this.getEnemyPosition(this.gamePlay.boardSize);
      let validatePosition = this.validateEnemyPosition(teamArr, randomPosition);

      const person = new PositionedCharacter(character, validatePosition);
      teamArr.push(person);
    }

    return teamArr;
  }

  //Проверяет, что позиция уникальна для команды игрока
  validatePlayerPosition(arr, position) {
    while (arr.some((item) => item.position === position)) {
      position = this.getPlayerPosition(this.gamePlay.boardSize);
    }

    return position;
  }

  //Проверяет, что позиция уникальна для команды противника
  validateEnemyPosition(arr, position) {
    while (arr.some((item) => item.position === position)) {
      position = this.getEnemyPosition(this.gamePlay.boardSize);
    }

    return position;
  }

  //проверка доступности перемещения
  checkMoveRange(selectedCharacter, targetIndex) {
    const distance = this.calcDistance(selectedCharacter.position, targetIndex) <= this.getMoveRange(selectedCharacter);
    const cellEmpty = this.checkCellEmpty(targetIndex);
    return distance && cellEmpty;
  }

  //проверка доступности атаки
  checkAttackRange(selectedCharacter, targetIndex) {
    const distance = this.calcDistance(selectedCharacter.position, targetIndex) <= this.getAttackRange(selectedCharacter);
    const targetCharacter = this.positions.find((char) => char.position === targetIndex);
    const isEnemy = this.isEnemy(targetCharacter);

    return distance && isEnemy;
  }

  //проверяем что клетка пустая
  checkCellEmpty(targetIndex) {
    return !this.positions.some((char) => char.position === targetIndex);
  }

  //Возвращает массив классов персонажей, доступных для команды игрока
  playerTypes() {
    return [Bowman, Magician, Swordsman];
  }

  //Возвращает массив классов персонажей, доступных для команды противника
  enemyTypes() {
    return [Daemon, Undead, Vampire];
  }

  //является ли персонаж игроком
  isPlayer(character) {
    if (!character) {
      return false;
    }
    return this.playerTypes().some((type) => character.character instanceof type);
  }

  //является ли персонаж противником
  isEnemy(character) {
    if (!character) {
      return false;
    }
    return this.enemyTypes().some((type) => character.character instanceof type);
  }
  
  //Возвращает случайную позицию для команды игрока
  getPlayerPosition(boardSize) {
    const cellIndexArr = [];

    for(let i = 0; i < boardSize ** 2; i += boardSize) {
      cellIndexArr.push(i, i + 1);
    }

    return cellIndexArr[Math.floor(Math.random() * cellIndexArr.length)];
  }

  //Возвращает случайную позицию для команды противника
  getEnemyPosition(boardSize) {
    const cellIndexArr = [];

    for(let i = 0; i < boardSize ** 2; i += boardSize) {
      cellIndexArr.push(i + boardSize - 2, i + boardSize - 1);
    }

    return cellIndexArr[Math.floor(Math.random() * cellIndexArr.length)];
  }  

  //вычисление расстояния до новой позиции
  calcDistance(position, newPosition) {
    const row1 = Math.floor(position / this.gamePlay.boardSize);
    const col1 = position % this.gamePlay.boardSize;

    const row2 = Math.floor(newPosition / this.gamePlay.boardSize);
    const col2 = newPosition % this.gamePlay.boardSize;

    return Math.max(Math.abs(row1 - row2), Math.abs(col1 - col2));
  }

  //возвращает дальность перемещения в зависимости от типа персонажа
  getMoveRange(selectedCharacter) {
    switch (selectedCharacter.character.type) {
      case 'swordsman':
      case 'undead':
        return 4; // Мечники и скелеты 4 клетки
      case 'bowman':
      case 'vampire':
        return 2; // Лучники и вампиры 2 клетки
      case 'magician':
      case 'daemon':
        return 1; // Маги и демоны 1 клетку
    }
  }

  //возвращает дальность атаки в зависимости от типа персонажа
  getAttackRange(selectedCharacter) {
    switch (selectedCharacter.character.type) {
      case 'swordsman':
      case 'undead':
        return 1; // Мечники и скелеты 1 клеткa
      case 'bowman':
      case 'vampire':
        return 2; // Лучники и вампиры 2 клетки
      case 'magician':
      case 'daemon':
        return 4; // Маги и демоны 4 клетки
    }
  }

  //Создает строку с информацией о персонаже
  createCharacterInfo(index) {
    for (const character of this.positions) {
      if(character.position === index) {
        return `🎖${character.character.level} ⚔${character.character.attack} 🛡${character.character.defence} ❤${character.character.health}`;
      }
    }
  }
}

