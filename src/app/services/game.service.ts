import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { GameState } from '../interfaces/game-state.interface';
import { defaultGameState } from '../types/default-game-state.type';
import { BehaviorSubject, Observable, Subject, catchError, map, skip } from "rxjs";
import { enterRoomDto } from '../dto/enter-room.dto';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { fireDto } from '../dto/fire.dto';

@Injectable({
  providedIn: 'root'
})
export class GameService extends BaseService {
  apiPath = `${environment.api.path}/game`

  gameState: GameState = new defaultGameState()
  myPlayer: enterRoomDto = {
    player: '',
  }

  canEnter = new BehaviorSubject<boolean>(this.gameState.canEnter);
  someoneEnteredRoom = new BehaviorSubject<undefined>(undefined);
  someoneleavedRoom = new BehaviorSubject<undefined>(undefined);
  gameIsRunning = new BehaviorSubject<boolean>(false);
  reloadAmmo = new BehaviorSubject<boolean[]>([]);
  fire = new BehaviorSubject<[GameState, string, boolean]>([this.gameState, '', false]);

  constructor(
    private readonly httpClient: HttpClient
  ) {
    super()
  }

  postFire(dto: fireDto) {
    return this.httpClient
        .post(`${this.apiPath}/fire`, dto, this.anonymousHeader())
        .pipe(map(this.extractData), catchError(this.serviceError));
  }

  win(player: string) {
    return this.httpClient
        .post(`${this.apiPath}/win`, { player }, this.anonymousHeader())
        .pipe(map(this.extractData), catchError(this.serviceError));
  }

  connectPlayer(playerNumber: number, id: string) {
    // if(playerNumber === 1) {
    //   this.gameState.player1.id = id
    //   this.myPlayer = 1
    // } else {
    //   this.gameState.player2.id = id
    //   this.myPlayer = 2
    // }

    this.myPlayer.player = `player${playerNumber}`
  }

  disconnectPlayer(id: string) {
    const player1id = this.gameState.player1.id;
    const player2id = this.gameState.player2.id;

    if(id === player1id) {
      this.gameState.player2.id = '';
    } else if(id === player2id) {
      this.gameState.player1.id = '';
    }
  }
 
  startGame(gameState: GameState) {
    this.gameState = gameState
    this.gameIsRunning.next(true)
  }

  reloadAmmoState(data: boolean[]) {
    this.gameState.shotgunAmmos = data
    this.reloadAmmo.next(data)
  }
  
  endGame() {
    this.gameState.running = false
    this.gameIsRunning.next(false)
  }
  
  fire$(): Observable<[GameState, string, boolean]> {
    return this.fire.asObservable().pipe(skip(1))
  }
  
  reloadAmmo$(): Observable<boolean[]> {
    return this.reloadAmmo.asObservable().pipe(skip(1))
  }

  canEnter$(): Observable<boolean> {
    return this.canEnter.asObservable()
  }

  someoneEnteredRoom$(): Observable<undefined> {
    return this.someoneEnteredRoom.asObservable().pipe(skip(1))
  }

  someoneleavedRoom$(): Observable<undefined> {
    return this.someoneleavedRoom.asObservable().pipe(skip(1))
  }

  gameIsRunning$(): Observable<boolean> {
    return this.gameIsRunning.asObservable()
  }
}
