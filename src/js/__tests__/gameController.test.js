import Character from "../Character";
import Bowman from "../characters/Bowman";
import GameController from "../GameController";
import GamePlay from "../GamePlay";

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
        gameController.positions = [positionedCharacter];
        const result = gameController.createCharacterInfo(10);

        expect(result).toBe("🎖2 ⚔25 🛡25 ❤50");
    });

    test('should return undefined if character is not found', () => {
        const result = gameController.createCharacterInfo(25);

        expect(result).toBeUndefined();
    });
});



