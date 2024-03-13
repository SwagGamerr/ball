exports.player = class Player {
  constructor(x, y, rotation) {
    this.x = x;
    this.y = y;
    this.rotation = rotation;
  }

  // [1, 2] (x, y) -> Change coordinates
  move(moveCoordinates) { 
    this.x += moveCoordinates[0];
    this.y += moveCoordinates[1]
  }
}
