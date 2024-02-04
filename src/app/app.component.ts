import { Component, OnInit } from '@angular/core';
import { GatewayService } from './services/gateway.service';
import { GameService } from './services/game.service';
import { GameState } from './interfaces/game-state.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  myId = ''
  myPlayer = ''

  constructor(
    private GatewayService: GatewayService,
    private GameService: GameService,
  ) {}

  ngOnInit() {
    this.GatewayService.listen('youArePlayer').subscribe({
      next: (data: any) => {
        console.log('youArePlayer', data)
        this.GameService.connectPlayer(data.playerNumber, data.id)
        this.myId = data.id
        this.myPlayer = `player${data.playerNumber}`
      },
      error: (err) => {
        console.log(err)
      }
    })

    this.GatewayService.listen('oponentLeaved').subscribe({
      next: () => {
        console.log('oponentLeaved')
        this.GameService.disconnectPlayer(this.myId)
      },
      error: (err) => {
        console.log(err)
      }
    })

    this.GatewayService.listen('canEnter').subscribe({
      next: (data: any) => {
        console.log('canEnter')
        this.GameService.canEnter.next(data.canEnter)
      },
      error: (err) => {
        console.log(err)
      }
    })

    this.GatewayService.listen('someoneEnteredRoom').subscribe({
      next: () => {
        console.log('someoneEnteredRoom')
        this.GameService.someoneEnteredRoom.next(undefined)
      },
      error: (err) => {
        console.log(err)
      }
    })

    this.GatewayService.listen('someoneleavedRoom').subscribe({
      next: () => {
        console.log('someoneleavedRoom')
        this.GameService.someoneleavedRoom.next(undefined)
      },
      error: (err) => {
        console.log(err)
      }
    })

    this.GatewayService.listen('gameStarted').subscribe({
      next: (data: any) => {
        console.log('gameStarted')
        this.GameService.startGame(data)
      },
      error: (err) => {
        console.log(err)
      }
    })

    this.GatewayService.listen('fire').subscribe({
      next: (data: any) => {
        console.log('fire', data)
        this.GameService.fire.next(data)
      },
      error: (err) => {
        console.log(err)
      }
    }) 

    this.GatewayService.listen('reloadShotgun').subscribe({
      next: (data: any) => {
        console.log('reloadShotgun')
        this.GameService.reloadAmmoState(data)
      },
      error: (err) => {
        console.log(err)
      }
    })
  }
}