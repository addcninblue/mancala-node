import { Component, OnInit, Input, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { SocketioService } from '../socketio.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  board = [
    [4, 4, 4, 4, 4, 4, 0],
    [4, 4, 4, 4, 4, 4, 0]
  ];

  players = [
    'Waiting',
    'Err'
  ];

  playerNumber = 0;
  socket = this.socketioService.socket;
  won = false;
  playerTurn: number;
  timedout = false; // to prevent double click bug

  constructor(private socketioService: SocketioService, private _ngZone: NgZone, private router: Router) {
    this.socket.on('games', (board) => {
      this._ngZone.run(() => {
        this.timedout = false;
        this.board = board;
        if (board[2] === 1) {
          document.getElementById('playerOneTurn').style.visibility = 'visible';
          document.getElementById('playerTwoTurn').style.visibility = 'hidden';
        } else {
          document.getElementById('playerOneTurn').style.visibility = 'hidden';
          document.getElementById('playerTwoTurn').style.visibility = 'visible';
        }
        if (board[0][6] + board[1][6] === 48) {
          this.won = true;
          if (board[0][6] > board[1][6]) {
            this.players[0] += ' won';
          } else if (board[0][6] < board[1][6]) {
            this.players[1] += ' won';
          } else {
            this.players[0] += ' tied';
            this.players[1] += ' tied';
          }
        }
      });
      console.log('board: ' + board);
    });
    this.socket.on('players', (players) => {
      this._ngZone.run(() => {
        this.players = players;
      });
      console.log('players: ' + players);
    });
    this.socket.on('player number', (playerNumber) => {
      this._ngZone.run(() => {
        this.playerNumber = playerNumber;
      });
    });
    this.socket.on('leave room', () => {
      console.log('fired');
      this._ngZone.run(() => {
        this.router.navigate(['./lobby']);
      });
    });
  }

  ngOnInit() { }

  move($event, playerNumber) {
    if (this.won) {
      return;
    }
    let numClicked = $event.toElement.cellIndex;
    if (this.playerNumber !== playerNumber) {
      console.log("Error");
      return;
    }
    if (playerNumber === 1) {
      numClicked = 6 - numClicked;
    } else if (playerNumber === 2) {
      // do nothing
    } else {
      console.log("Error");
      return;
    }
    this.socket.emit('make move', numClicked, (err, msg) => {
      this.timedout = true;
      if (err) {
        console.log(err, msg);
      }
    });
    console.log(numClicked);
  }

  leaveGame($event) {
    this.socket.emit('leave room');
    this.router.navigate(['./lobby']);
  }

}
