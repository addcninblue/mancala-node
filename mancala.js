const move = function (board, initialRow, initialPosition, saveState) {
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
};


// start() {
//   let playerTurn = 0;
//   while (!this.win) {
//     let turnEnded = false;
//     while (!turnEnded) {
//       const move = this.players[playerTurn % 2].getMove();
//       turnEnded = this.board.move(move, playerTurn % 2, false);
//     }
//     playerTurn += 1;
//     this.win = this.board.checkWin();
//   }
// }

// printBoard() {
//   // I apologize for this ugliness
//   // Built with Vim and a lot of patience
//   row0 = this.board.getRow(0);
//   row1 = this.board.getRow(1);
//   str = '     5  4  3  2  1  0\n┌──┬──┬──┬──┬──┬──┬──┬──┐\n│  │%2d│%2d│%2d│%2d│%2d│%2d│  │\n│%2d├──┼──┼──┼──┼──┼──┤%2d│\n│  │%2d│%2d│%2d│%2d│%2d│%2d│  │\n└──┴──┴──┴──┴──┴──┴──┴──┘\n     0  1  2  3  4  5\n';
//   console.log(str);
//   // System.out.format(str, row0[5], row0[4], row0[3], row0[2], row0[1], row0[0], row0[6],
//   //   row1[6], row1[0], row1[1], row1[2], row1[3], row1[4], row1[5]);
// }

module.exports = move;
