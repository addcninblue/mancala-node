import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketioService } from '../socketio.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  socket = this.socketioService.socket;

  constructor(private socketioService: SocketioService, private router: Router) { }

  ngOnInit() { }

  enterName($event) {
    const username = (<HTMLInputElement>document.getElementById('name')).value;
    this.socket.emit('set username', username, (err, msg) => {
      if (err === 'success') {
        this.router.navigate(['./lobby']);
      } else {
        console.log(err);
      }
    });
  }

}
