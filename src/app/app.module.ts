import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { LobbyComponent } from './lobby/lobby.component';
import { GameComponent } from './game/game.component';
import { SocketioService } from './socketio.service';

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot([
      // { path: '', redirect: '/lobby' },
      { path: 'lobby', component: LobbyComponent },
      { path: 'game', component: GameComponent },
    ])
  ],
  providers: [SocketioService],
  bootstrap: [AppComponent]
})
export class AppModule { }
