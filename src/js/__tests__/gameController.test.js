import Character from "../Character";
//import Swordsman from "../characters/Swordsman";
import Undead from "../characters/Undead";
import Bowman from "../characters/Bowman";
import Vampire from "../characters/Vampire";
//import Magician from "../characters/Magician";
import Daemon from "../characters/Daemon";
import GameController from "../GameController";
import GamePlay from "../GamePlay";
import PositionedCharacter from "../PositionedCharacter";

describe('class Character and children', () => {
    test('should trow error when creating new Character', () => {
        expect(() => new Character(2)).toThrow('Нельзя создать экземпляр Character напрямую!');
    });

    test('shold create Character children', () => {
        const bowman = new Bowman(1);
        expect(bowman).toEqual({"attack": 25, "defence": 25, "health": 50, "level": 1, "type": "bowman",});
    });
});

describe('return character information', () => {
    const gamePlay = new GamePlay();
    gamePlay.boardSize = 8;
    const gameController = new GameController(gamePlay);

    test('should return correct information string', () => {
        const character = { level: 2, attack: 25, defence: 25, health: 50,};
        const positionedCharacter = {position: 10, character,};
        gameController.gameState.positions = [positionedCharacter];
        const result = gameController.createCharacterInfo(10);

        expect(result).toBe("🎖2 ⚔25 🛡25 ❤50");
    });

    test('should return undefined if character is not found', () => {
        const result = gameController.createCharacterInfo(25);

        expect(result).toBeUndefined();
    });
});

describe('attack and move character type', () => {
    const gamePlay = new GamePlay();
    gamePlay.boardSize = 8;
    const gameController = new GameController(gamePlay);

    test.each([
        [{character: {level: 1, attack: 25, defence: 25, health: 50, type: 'swordsman'}, position: 0}, 3, true],
        [{character: {level: 1, attack: 25, defence: 25, health: 50, type: 'undead'}, position: 0}, 40, false],
        [{character: {level: 1, attack: 25, defence: 25, health: 50, type: 'bowman'}, position: 0}, 18, true],
        [{character: {level: 1, attack: 25, defence: 25, health: 50, type: 'vampire'}, position: 0}, 27, false],
        [{character: {level: 1, attack: 25, defence: 25, health: 50, type: 'magician'}, position: 0}, 8, true],
        [{character: {level: 1, attack: 25, defence: 25, health: 50, type: 'daemon'}, position: 0}, 2, false]
    ])('check move range with any types', (character, targetIndex, expected) => {
        
        expect(gameController.checkMoveRange(character, targetIndex)).toBe(expected);
    });

    test('check attack range with type swordsman and undead', () => {
        const character = {character: {level: 1, attack: 25, defence: 25, health: 50, type: 'swordsman'}, position: 0};
        const targetIndex = 1;
        const undead = new PositionedCharacter(new Undead(1), 1);
        gameController.gameState.positions = [undead];

        expect(gameController.checkAttackRange(character, targetIndex)).toBe(true);
    });

    test('check attack range with type swordsman and undead', () => {
        const character = {character: {level: 1, attack: 25, defence: 25, health: 50, type: 'swordsman'}, position: 0};
        const targetIndex = 2;
        const undead = new PositionedCharacter(new Undead(1), 2);
        gameController.gameState.positions = [undead];

        expect(gameController.checkAttackRange(character, targetIndex)).toBe(false);
    });

    test('check attack range with type bowman and vampire', () => {
        const character = {character: {level: 1, attack: 25, defence: 25, health: 50, type: 'bowman'}, position: 0};
        const targetIndex = 18;
        const vampire = new PositionedCharacter(new Vampire(1), 18);
        gameController.gameState.positions = [vampire];

        expect(gameController.checkAttackRange(character, targetIndex)).toBe(true);
    });

    test('check attack range with type bowman and vampire', () => {
        const character = {character: {level: 1, attack: 25, defence: 25, health: 50, type: 'bowman'}, position: 0};
        const targetIndex = 27;
        const vampire = new PositionedCharacter(new Vampire(1), 27);
        gameController.gameState.positions = [vampire];

        expect(gameController.checkAttackRange(character, targetIndex)).toBe(false);
    });

    test('check attack range with type magician and daemon', () => {
        const character = {character: {level: 1, attack: 25, defence: 25, health: 50, type: 'magician'}, position: 0};
        const targetIndex = 32;
        const daemon = new PositionedCharacter(new Daemon(1), 32);
        gameController.gameState.positions = [daemon];

        expect(gameController.checkAttackRange(character, targetIndex)).toBe(true);
    });

    test('check attack range with type magician and daemon', () => {
        const character = {character: {level: 1, attack: 25, defence: 25, health: 50, type: 'magician'}, position: 0};
        const targetIndex = 40;
        const daemon = new PositionedCharacter(new Daemon(1), 40);
        gameController.gameState.positions = [daemon];

        expect(gameController.checkAttackRange(character, targetIndex)).toBe(false);
    });
});



