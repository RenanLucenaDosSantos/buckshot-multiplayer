import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as socketio from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class GatewayService {
  readonly apiPath = environment.api.path
  socket: any;

  constructor() {
    this.socket = socketio.io((this.apiPath))
  }

  listen(eventName: string) {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      })
    })
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data)
  }
}
