const Board = require('./board');

const Game = class {
  constructor(player1, player2) {
    this.players = [player1, player2];
    this.win = false;
    this.board = new Board();
  }

  start() {
    let playerTurn = 0;
    console.log('hi');
    while (!this.win) {
      let turnEnded = false;
      while (!turnEnded) {
        const move = this.players[playerTurn % 2].getMove();
        turnEnded = this.board.move(move, playerTurn % 2, false);
      }
      playerTurn += 1;
      this.win = this.board.checkWin();
    }
  }

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

};
module.exports = Game;
