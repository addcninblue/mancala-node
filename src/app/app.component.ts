import { Component, ChangeDetectorRef } from '@angular/core';
import { GameComponent } from './game/game.component';
import { LobbyComponent } from './lobby/lobby.component';
import { Router } from '@angular/router';
import {SocketioService } from './socketio.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [SocketioService],
})
export class AppComponent {

  title = 'app works!';

  constructor(private router: Router) {
    this.router.navigate(['./login']);
  }

}
