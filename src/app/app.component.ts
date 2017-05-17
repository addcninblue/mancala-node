import { Component } from '@angular/core';
import { GameComponent } from './game/game.component';
import { LobbyComponent } from './lobby/lobby.component';
import {SocketioService } from './socketio.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [SocketioService]
})
export class AppComponent {
  title = 'app works!';
}
