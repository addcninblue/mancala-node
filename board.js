const Board = class {

  constructor() {
    this.board = [[4, 4, 4, 4, 4, 4, 0], [4, 4, 4, 4, 4, 4, 0]];
    this.numRows = 2;
    this.numCols = 7;
    this.numStones = 4;
    this.history = [];
    this.continues = [];
  }

  move(initialRow, initialPosition, saveState) {
    let position = initialPosition;
    let row = initialRow;
    let stones = this.board[row][position];
    this.board[row][position] = 0;
    while (stones > 0) {
      position += 1;
      if (row !== initialRow && position === this.numCols - 1) { // if ends up in enemy home
        position += 1;
      }
      row = (row + (position / this.numCols)) % 2;
      position %= this.numCols;
      this.board[row][position] += 1;
      stones -= 1;
    }
    if (row === initialRow) {
      if (position === 6) {  // if ends up in own space
        return false;
      } else if (this.board[row][position] === 0 &&
        this.board[(row + 1) % 2][this.numCols - position - 2] > 0) {
        if (saveState) {
          saveState(false);
          this.continues.unshift(true);
        }
        this.board[row][6] += this.board[row][position] +
          this.board[(row + 1) % 2][this.numCols - position - 2];
        this.board[row][position] = 0;
        this.board[(row + 1) % 2][this.numCols - position - 2] = 0;
        return true;
      }
    }
    return true;
  }

  saveState(parent) {
    if (parent) {
      this.continues.unshift(false);
      const boardCopy = this.board.slice();
      this.history.unshift(boardCopy);
    }
  }

  undoState() {
    let undo = true;
    while (undo) {
      this.board = this.history.shift();
      undo = this.continues.shift();
    }
  }

  checkWin() {
    return (this.board[0][this.numCols - 1] + this.board[1][this.numCols - 1] ===
      this.numStones * (this.numCols - 1) * 2);
  }

  getRow(row) {
    return this.board[row];
  }

  getBoard() {
    return this.board;
  }

  numOfPieces() {
    let sum = 0;
    for (let i = 0; i < this.board.length; i += 1) {
      for (let j = 0; j < this.board[i].length; j += 1) {
        sum += this.board[i][j];
      }
    }
    return sum;
  }

  // printBoard() {
  //   // I apologize for this ugliness
  //   // Built with Vim and a lot of patience
  //   let row0 = this.board[0];
  //   let row1 = this.board[1];
  //   const str = "     5  4  3  2  1  0\n┌──┬──┬──┬──┬──┬──┬──┬──┐\n│  │%2d│%2d│%2d│%2d│%2d│%2d│  │\n│%2d├──┼──┼──┼──┼──┼──┤%2d│\n│  │%2d│%2d│%2d│%2d│%2d│%2d│  │\n└──┴──┴──┴──┴──┴──┴──┴──┘\n     0  1  2  3  4  5\n";
  //   console.log(str);
  //   // System.out.format(str, row0[5], row0[4], row0[3], row0[2], row0[1], row0[0], row0[6],
  //   // row1[6], row1[0], row1[1], row1[2], row1[3], row1[4], row1[5]);
  // }

  getWinner() {
    if (this.checkWin()) {
      return (this.board[0][this.numCols - 1] > this.board[1][this.numCols - 1]) ? 0 : 1;
    }
    return -1;
  }

};
module.exports = this.board;
