import {characterGenerator} from "../generators";
import {generateTeam} from "../generators";
import Bowman from "../characters/Bowman";
import Swordsman from "../characters/Swordsman";
import Magician from "../characters/Magician";

describe('characterGenerator', () => {
    test('should endlessly create new character', () => {
        const allowedTypes = [Bowman, Swordsman, Magician];
        const maxLevel = 3;
        const generator = characterGenerator(allowedTypes, maxLevel);


        for (let i = 0; i < 5; i++) {
            const character = generator.next().value;

            expect(allowedTypes).toContain(character.constructor);
            expect([1, 2, 3]).toContain(character.level);
        }
    });
});

describe('generateTeam', () => {
    const allowedTypes = [Bowman, Swordsman, Magician];
    const maxLevel = 3;
    const characterCount = 3;
    const team = generateTeam(allowedTypes, maxLevel, characterCount);

    test('should create new Team with equal number of characters', () => {
        expect(team.characters.length).toEqual(3);
    });

    test('should create new Team with equal characters level', () => {
        for (const character of team.characters) {
            expect([1, 2, 3]).toContain(character.level);
        }
    });

});