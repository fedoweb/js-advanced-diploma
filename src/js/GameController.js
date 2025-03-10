import PositionedCharacter from "./PositionedCharacter";
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

    this.positions = this.getPositions();
  }

  

  init() {
    // TODO: add event listeners to gamePlay events
    this.gamePlay.addCellClickListener((index) => this.onCellClick(index));
    this.gamePlay.addCellEnterListener((index) => this.onCellEnter(index));
    this.gamePlay.addCellLeaveListener((index) => this.onCellLeave(index));
    // TODO: load saved stated from stateService
    //this.loadSavedState();


    this.gamePlay.drawUi('prairie');
    this.gamePlay.redrawPositions(this.positions);
  }

  onCellClick(index) {
    console.log(index);
    // TODO: react to click
  }

  onCellEnter(index) {
    for (const character of this.positions) {
      if(character.position === index) {
        this.gamePlay.showCellTooltip(this.createCharacterInfo(index), index); 
      }
    }
  }
  
  showCharacterInfo() {
    this.gamePlay.addCellEnterListener(this.onCellEnter);
  }

  createCharacterInfo(index) {
    for (const character of this.positions) {
      if(character.position === index) {
        return `🎖${character.character.level} ⚔${character.character.attack} 🛡${character.character.defence} ❤${character.character.health}`;
      }
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    // TODO: react to mouse leave
  }

  getPositions() {
    const playerTeam = this.generatePlayerTeam(this.playerTypes());
    const enemyTeam = this.generateEnemyTeam(this.enemyTypes());
    return [...playerTeam, ...enemyTeam];
  }

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

  playerTypes() {
    return [Bowman, Magician, Swordsman];
  }

  enemyTypes() {
    return [Daemon, Undead, Vampire];
  }

  getPlayerPosition(boardSize) {
    const cellIndexArr = [];

    for(let i = 0; i < boardSize ** 2; i += boardSize) {
      cellIndexArr.push(i, i + 1);
    }

    return cellIndexArr[Math.floor(Math.random() * cellIndexArr.length)];
  }

  getEnemyPosition(boardSize) {
    const cellIndexArr = [];

    for(let i = 0; i < boardSize ** 2; i += boardSize) {
      cellIndexArr.push(i + boardSize - 2, i + boardSize - 1);
    }

    return cellIndexArr[Math.floor(Math.random() * cellIndexArr.length)];
  }  

  validatePlayerPosition(arr, position) {
    while (arr.some((item) => item.position === position)) {
      position = this.getPlayerPosition(this.gamePlay.boardSize);
    }

    return position;
  }

  validateEnemyPosition(arr, position) {
    while (arr.some((item) => item.position === position)) {
      position = this.getEnemyPosition(this.gamePlay.boardSize);
    }

    return position;
  }
}

