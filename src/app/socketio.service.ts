import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable()
export class SocketioService {

  myThing = 1;

  constructor() {
    const testing = io();
    console.log(testing);
    testing.emit('set username', 'hi', (err, msg) => {
      console.log(err + ': ' + msg);
    });
  }
}
