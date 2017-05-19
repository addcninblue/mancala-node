import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { SocketioService } from '../socketio.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
})
export class LobbyComponent implements OnInit, OnDestroy {

  games = [];
  // player1, player2, gameid
  // DEBUG
  // games = [['Add', undefined, 'fjdkajfkal']];

  socket = this.socketioService.socket;
  getGamesId: any;

  constructor(private socketioService: SocketioService, private router: Router, private _ngZone: NgZone) {
    this.getGamesId = setInterval(() => {
      this.socket.emit('get games', (err, boards) => {
        this._ngZone.run(() => {
          this.games = boards;
        });
      });
      console.log(this.games);
    }, 500);
  }

  ngOnInit() { }

  ngOnDestroy() {
    clearTimeout(this.getGamesId);
  }

  updateBoard(): void {
  }

  createGame($event) {
    this.socket.emit('create game', (err, game) => {
      if (err === 'success') {
        this.router.navigate(['./game']);
      } else {
        console.log(err);
      }
    });
  }

  joinGame($event) {
    const gamename = $event.toElement.id;
    this.socket.emit('join game', gamename, (err, msg) => {
      if (err === 'success') {
        this.router.navigate(['./game']);
      } else {
        console.log(err, msg);
      }
    });
  }

}
