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
    this.themes = ['prairie', 'desert', 'arctic', 'mountain'];

    this.gameState = new GameState();
  } 
  
  
  init() {
    // TODO: add event listeners to gamePlay events
    this.gamePlay.addCellClickListener((index) => this.onCellClick(index));
    this.gamePlay.addCellEnterListener((index) => this.onCellEnter(index));
    this.gamePlay.addCellLeaveListener((index) => this.onCellLeave(index));
    this.gamePlay.addSaveGameListener(() => this.onSaveGameClick());
    this.gamePlay.addLoadGameListener(() => this.onLoadGameClick());
    this.gamePlay.addNewGameListener(() => this.onNewGameClick());

    // TODO: load saved stated from stateService 

    //нужна ли загрузка последнего сохранения при запуске игры? мне показалось это не удобным
    /* 
    const loadedState = this.stateService.load();
      if (loadedState) {
        this.gameState = GameState.from(loadedState);
        this.gamePlay.drawUi(this.themes[this.gameState.themeIndex]);
        this.gamePlay.redrawPositions(this.gameState.positions);
        
        if (this.gameState.selectedCharacter) {
          this.gamePlay.selectCell(this.gameState.selectedCharacter.position);
        }
      } else {
        this.gameState.positions = this.getPositions();
        this.gamePlay.drawUi('prairie');
        this.gamePlay.redrawPositions(this.gameState.positions);
      }
    */

      this.gameState.positions = this.getPositions();
      this.gamePlay.drawUi('prairie');
      this.gamePlay.redrawPositions(this.gameState.positions);  
  }

  onCellClick(index) {
    if(this.gameState.gameOver) {
      return;
    }

    if(this.gameState.currentPlayer === 'player') {

      //если персонаж уже выбран
      if(this.gameState.selectedCharacter) {
        this.gamePlay.deselectCell(this.gameState.selectedCharacter.position);

        //перейти на другую клетку
        if(this.isEmpty(index) && this.checkMoveRange(this.gameState.selectedCharacter, index)) {
          
          this.move(index);
          this.changePlayer();

          setTimeout(() => this.enemyCurrent(), 1000);
          return;
        }

        //атаковать противника
        if (this.checkAttackRange(this.gameState.selectedCharacter, index)) {
          this.attack(index);
          this.changePlayer();

          setTimeout(() => this.enemyCurrent(), 3000);
          return;
        }
      } 

      //выбор персонажа
      const clickedCharacter = this.gameState.positions.find(char => char.position === index);
      
      if(clickedCharacter && this.isPlayer(clickedCharacter)) {
        this.gameState.selectedCharacter = clickedCharacter;
        this.gamePlay.selectCell(index);
        return;
      }  
    }

    // ошибка
    GamePlay.showError('Недопустимое действие!');
    this.gamePlay.deselectCell(index);
    this.gameState.selectedCharacter = null;
  }

  onCellEnter(index) {
    if(this.gameState.gameOver) {
      this.gamePlay.setCursor('not-allowed');
      return;
    }

    const targetCharacter = this.gameState.positions.find((char) => char.position === index);

    //показать информацию
    if(targetCharacter) {
      this.gamePlay.showCellTooltip(this.createCharacterInfo(index), index);
    }

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
      this.checkMoveRange(this.gameState.selectedCharacter, index)) { 
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

  onNewGameClick() {
    const maxScore = this.gameState.maxScore;
    // Полный сброс игры
    this.gameState = new GameState('player', 1, maxScore);
    
    // Новая генерация команд
    this.gameState.positions = this.getPositions();
    
    // Отрисовка с первой темой
    this.gamePlay.drawUi('prairie');
    this.gamePlay.redrawPositions(this.gameState.positions);
    
    // Сброс выделения
    this.gameState.selectedCharacter = null;
    
    GamePlay.showMessage('Начата новая игра!');
  }

  onSaveGameClick() {
    const state = {
      ...this.gameState.toJSON(),
      maxScore: Math.max(this.gameState.maxScore, this.calculateScore())
    };
    this.stateService.save(state);

    GamePlay.showMessage('Игра сохранена!');
  }

  onLoadGameClick() {
    try {
      const loadedState = this.stateService.load();
      if (loadedState) {
        this.gameState = GameState.from(loadedState);
        this.gamePlay.drawUi(this.themes[this.gameState.themeIndex]);
        this.gamePlay.redrawPositions(this.gameState.positions);
        
        if (this.gameState.selectedCharacter) {
          this.gamePlay.selectCell(this.gameState.selectedCharacter.position);
        }
      }
      GamePlay.showMessage('Игра загружена!');
    } catch (e) {
      GamePlay.showError(e);
    }
  }

  levelUp(characters) {
    //если уровень 4 завершить игру
    if(this.gameState.level === 4) {
      this.gameOver();
      GamePlay.showMessage('Победа!');
      return;
    }

    //повысить уровень
    this.gameState.level += 1;

    //сменить тему
    const themeIndex = (this.gameState.level - 1) % this.themes.length;
    this.gamePlay.drawUi(this.themes[themeIndex]);

    //повысиь уровень персонажей игрока
    for (const character of characters) {
      this.characterUp(character.character);
    }

    // Начинаем новый уровень
    GamePlay.showMessage('Уровень пройден!');
    this.newLevel();
  }

  //новый уровень
  newLevel() {
    // Сохраняем персонажей игрока
  const playerCharacters = this.gameState.positions.filter(char => this.isPlayer(char));
  
  // Генерируем новую команду противников
  const enemyTeam = this.generateEnemyTeam(this.enemyTypes(), this.gameState.level);
  
  // Обновляем позиции (игроки + новые враги)
  this.gameState.positions = [...playerCharacters, ...enemyTeam];
  
  // Перерисовываем поле
  this.gamePlay.redrawPositions(this.gameState.positions);
  
  // Сбрасываем выбранного персонажа
  this.gameState.selectedCharacter = null;
  this.gameState.currentPlayer = 'player';
  }

  //игра окончена
  gameOver() {
    this.gameState.gameOver = true;
    
  }

  //передвижение
  move(index) {
    this.gameState.selectedCharacter.position = index;
    this.gamePlay.redrawPositions(this.gameState.positions);

    this.gamePlay.deselectCell(index);
    this.gameState.selectedCharacter = null;
  }

  //атака
  async attack(index) {
    const attackCharacter = this.gameState.selectedCharacter;
    const targetCharacter = this.gameState.positions.find((char) => char.position === index);

    const damage = Math.max(
      attackCharacter.character.attack - targetCharacter.character.defence,
      attackCharacter.character.attack * 0.1
    );

    await this.gamePlay.showDamage(index, Math.round(damage));

    targetCharacter.character.health -= damage;

    if (targetCharacter.character.health <= 0) {
      this.dead(targetCharacter);
    }

    this.gamePlay.redrawPositions(this.gameState.positions);
    this.gamePlay.deselectCell(index);
    this.gameState.selectedCharacter = null;
  }

  //убирает погибших персонажей
  dead(targetCharacter) {
    this.gameState.positions = this.gameState.positions.filter((char) => char !== targetCharacter);
  }


  //ход противника
  enemyCurrent() {
    //получаем всех персонажей игрока
    const playerCharacters = this.gameState.positions.filter(char => 
      this.isPlayer(char) && char.character.health > 0
    );

    //получаем всех персонажей противника
    const enemyCharacters = this.gameState.positions.filter(char => 
      this.isEnemy(char) && char.character.health > 0
    );

    // Проверяем, остались ли персонажи противника
    if (enemyCharacters.length === 0) {
      this.levelUp(playerCharacters);
      
      return;
    }

    // Проверяем, есть ли персонажи игрока для атаки
    if (playerCharacters.length === 0) {
      this.changePlayer();
      return;
    }

    //выбираем случайного персонажа противника
    const enemyCharacter = enemyCharacters[Math.floor(Math.random() * enemyCharacters.length)];

    
    let targetCharacter = null;
    let minDistance = Infinity;
    let canAttack = false;

    //выбираем ближайшего доступного персонажа игрока
    for (const char of playerCharacters) {
      const distance = this.calcDistance(enemyCharacter.position, char.position);

      if (distance < minDistance) {
        minDistance = distance;
        targetCharacter = char;
      }
    }

     // Проверяем возможность атаки
    canAttack = minDistance <= this.getAttackRange(enemyCharacter);

    //атакуем если это возможно и проверяем не завершилась ли игра
    if(canAttack) {
      this.gameState.selectedCharacter = enemyCharacter;
      this.attack(targetCharacter.position)
        .then(() => {
          // После атаки снова проверяем живых персонажей игрока
          const alivePlayers = this.gameState.positions.filter(char => 
            this.isPlayer(char) && char.character.health > 0
          );
          
          if (alivePlayers.length === 0) {
            this.gameOver(); 
            GamePlay.showMessage('Вы проиграли!');
          } else {
            this.changePlayer();
          }
        });
      return;
    }

    //перемещаемся ближе к цели если не можем атаковать
    if(!canAttack) {
      const moves = [];
      const moveRange = this.getMoveRange(enemyCharacter);

      //находим все возможные варианты перемещения
      for (let i = 0; i < this.gamePlay.boardSize ** 2; i++) {
        const distance = this.calcDistance(enemyCharacter.position, i);

        if (distance <= moveRange && this.isEmpty(i)) {
          moves.push(i);
        }
      }

      //выбираем лучшую клеткуу для перемещения
      let bestMove = null;
      let minDistance = Infinity;

      for (const move of moves) {
        const distance = this.calcDistance(move, targetCharacter.position);
        if (distance < minDistance) {
          minDistance = distance;
          bestMove = move;
        }
      }

      //перемещаемся
      if(bestMove) {
        this.gameState.selectedCharacter = enemyCharacter;
        this.move(bestMove);
      }
    }

    //передаем ход
    this.changePlayer();
  }

  //повышает показатели персонажа
  characterUp(character) {
    const health = character.health;
    const attack = character.attack;
    const defence = character.defence;

    character.health = this.healthUp(health);    
    character.attack = this.attackUp(health, attack);
    character.defence = this.defenceUp(health, defence);
   }

   //повыщение показателя здоровья
   healthUp(health) {
    const maxHealth = 100;
    health += 80;

    if (health > maxHealth) {
      health = maxHealth;
    }

    return health;
  }

  //повышение показателя атаки/защиты
  attackUp(health, attack) {
    return Math.max(attack, attack * (80 + health) / 100);
  }

  defenceUp(health, defence) {
    return Math.max(defence, defence * (80 + health) / 100);
  }

  //смена игрока
  changePlayer() {
    this.gameState.currentPlayer = this.gameState.currentPlayer === 'player' ? 'enemy' : 'player';
  } 

  //Возвращает массив позиций персонажей игрока и противника
  getPositions() {
    const playerTeam = this.generatePlayerTeam(this.playerTypes());
    const enemyTeam = this.generateEnemyTeam(this.enemyTypes());
    return [...playerTeam, ...enemyTeam];
  }

  //Генерирует команду игрока
  generatePlayerTeam(allowedTypes, level = 1) {
    const team = generateTeam(allowedTypes, 2, 2); 
    const teamArr = [];
  
    for (const character of team.characters) {
      // Повышаем уровень персонажа
      for (let i = 1; i < level; i++) {
        this.characterUp(character);
      }
  
      // Получаем и проверяем позицию
      let position = this.validatePlayerPosition(teamArr, this.getPlayerPosition(this.gamePlay.boardSize));
  
      // Создаём PositionedCharacter
      const positionedChar = new PositionedCharacter(character, position);
      teamArr.push(positionedChar);
    }
  
    return teamArr;
  }

  //Генерирует команду противника
  generateEnemyTeam(allowedTypes, level = 1) {
    const team = generateTeam(allowedTypes, 2, 2); 
    const teamArr = [];
  
    for (const character of team.characters) {
      // Повышаем уровень персонажа
      for (let i = 1; i < level; i++) {
        this.characterUp(character);
      }
  
      // Получаем и проверяем позицию
      let position = this.getEnemyPosition(this.gamePlay.boardSize);
      position = this.validateEnemyPosition(teamArr, position);
  
      // Создаём PositionedCharacter
      const positionedChar = new PositionedCharacter(character, position);
      teamArr.push(positionedChar);
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
    const cellEmpty = this.isEmpty(targetIndex);
    return distance && cellEmpty;
  }

  //проверка доступности атаки
  checkAttackRange(selectedCharacter, targetIndex) {
    const distance = this.calcDistance(selectedCharacter.position, targetIndex) <= this.getAttackRange(selectedCharacter);
    const targetCharacter = this.gameState.positions.find((char) => char.position === targetIndex);
    const isEnemy = this.isEnemy(targetCharacter);

    return distance && isEnemy;
  }

  //Возвращает массив классов персонажей, доступных для команды игрока
  playerTypes() {
    return [Bowman, Magician, Swordsman];
  }

  //Возвращает массив классов персонажей, доступных для команды противника
  enemyTypes() {
    return [Daemon, Undead, Vampire];
  }

  //является ли клетка пустой
  isEmpty(targetIndex) {
    return !this.gameState.positions.some((char) => char.position === targetIndex);
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

  //вычисление расстояния до новой позиции
  calcDistance(position, newPosition) {
    const row1 = Math.floor(position / this.gamePlay.boardSize);
    const col1 = position % this.gamePlay.boardSize;

    const row2 = Math.floor(newPosition / this.gamePlay.boardSize);
    const col2 = newPosition % this.gamePlay.boardSize;

    return Math.max(Math.abs(row1 - row2), Math.abs(col1 - col2));
  }

  // Расчет очков
  calculateScore() {
    const aliveCharacters = this.gameState.positions.filter(char => 
      this.isPlayer(char) && char.character.health > 0
    ).length;
    return this.gameState.level * 100 + aliveCharacters * 10;
  }

  //Создает строку с информацией о персонаже
  createCharacterInfo(index) {
    for (const character of this.gameState.positions) {
      if(character.position === index) {
        return `🎖${character.character.level} ⚔${character.character.attack} 🛡${character.character.defence} ❤${character.character.health}`;
      }
    }
  }
}

