import { calcTileType } from '../utils';

test.each([
        [0, 8, 'top-left'],
        [1, 8, 'top'],
        [7, 8, 'top-right'],
        [7, 7, 'left'],
        [13, 7, 'right'],
        [63, 8, 'bottom-right'],
        [56, 8, 'bottom-left'],
        [61, 8, 'bottom'],
        [49, 8, 'center']
    ])('testing function calcTileTime', (index, boardSize, result) => {
    expect(calcTileType(index, boardSize)).toEqual(result);
});