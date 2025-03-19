/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
import Team from './Team';

export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here

  while (true) {
    const randomIndex = Math.floor(Math.random() * allowedTypes.length);
    const CharacterClass = allowedTypes[randomIndex];
    const level = Math.ceil(Math.random() * maxLevel);
    yield new CharacterClass(level);
  }
  /*
    let index = 0;

    while(true) {
      const CharacterClass = allowedTypes[index];
      const level = Math.ceil(Math.random() * maxLevel);
      yield new CharacterClass(level);

      index = (index + 1) % allowedTypes.length;
    }
      */
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const generator = characterGenerator(allowedTypes, maxLevel);
  let characters = [];
  const usedTypes = new Set();

  while (characters.length < characterCount) {
    const character = generator.next().value;

    if (!usedTypes.has(character.type)) {
      characters.push(character);
      usedTypes.add(character.type);
    }
  }
  
  return new Team(characters);
}
