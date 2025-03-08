import Character from "../Character";
import Bowman from "../characters/Bowman";
import Daemon from "../characters/Daemon";
import Magician from "../characters/Magician";
import Swordsman from "../characters/Swordsman";
import Undead from "../characters/Undead";
import Vampire from "../characters/Vampire";
import GameController from "../GameController";

describe('class Character and children', () => {
    test('should trow error when creating new Character', () => {
        expect(() => new Character(2)).toThrow('Нельзя создать экземпляр Character напрямую!');
    });

    test('shold create Character children', () => {
        const bowman = new Bowman(1);
        expect(bowman).toEqual({"attack": 25, "defence": 25, "health": 50, "level": 1, "type": "bowman"});
    });
});



