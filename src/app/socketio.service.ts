import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable()
export class SocketioService {

  myThing = 1;

  socket = io();

  emit(param: string, data: string, callback: (err, msg) => void): any {
    this.socket.emit(param, data, (err, msg) => {
      callback(err, msg);
      return msg;
    });
  }

  on(param: string, callback: (msg) => void): void {
    this.socket.on(param, (msg) => {
      console.log(msg);
      callback(msg);
    });
  }

  constructor() { }
}
