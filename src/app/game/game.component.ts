import { Component, OnInit, Input } from '@angular/core';
import { SocketioService } from '../socketio.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  board = [
    [0, 4, 4, 4, 4, 4, 4],
    [0, 4, 4, 4, 4, 4, 4]
  ];


  constructor(private socketioService: SocketioService) { }

  ngOnInit() {
    console.log(this.socketioService.myThing);
  }

  move($event) {
    const numClicked = $event.toElement.cellIndex;
  }

}
