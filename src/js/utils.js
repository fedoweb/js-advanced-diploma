/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  // TODO: ваш код будет тут
  
  // Left
  if(index === 0) {
    return 'top-left';
  } else if(index === boardSize * (boardSize - 1)) {
    return 'bottom-left';
  } else if(index % boardSize === 0) {
    return 'left';
  }

  //right
  if(index === boardSize - 1) {
    return 'top-right';
  } else if(index === boardSize ** 2 - 1) {
    return 'bottom-right';
  } else if((index + 1) % boardSize === 0) {
    return 'right';
  }

  // top and bottom
  if(index < boardSize) {
    return 'top';
  } else if(index > boardSize * (boardSize - 1)) {
    return 'bottom';
  }

  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
