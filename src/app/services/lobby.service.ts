import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, map } from "rxjs";
import { BaseService } from './base.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { enterRoomDto } from '../dto/enter-room.dto';

@Injectable({
  providedIn: 'root'
})
export class LobbyService extends BaseService {
  apiPath = `${environment.api.path}/lobby`

  constructor(
    private readonly httpClient: HttpClient
  ) {
    super()
  }

  enterRoom(dto: enterRoomDto) {
    return this.httpClient
        .post(`${this.apiPath}/enter-room`, dto, this.anonymousHeader())
        .pipe(map(this.extractData), catchError(this.serviceError));
  }

  leaveRoom(dto: enterRoomDto) {
    return this.httpClient
        .post(`${this.apiPath}/leave-room`, dto, this.anonymousHeader())
        .pipe(map(this.extractData), catchError(this.serviceError));
  }
}
