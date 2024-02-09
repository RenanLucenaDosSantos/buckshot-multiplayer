import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { enterRoomDto } from 'src/app/dto/enter-room.dto';
import { GameService } from 'src/app/services/game.service';
import { LobbyService } from 'src/app/services/lobby.service';
import { Howl } from 'howler';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  canEnter: boolean
  iAmInRoom = false
  someoneInRoom = false

  constructor (
    private GameService: GameService,
    private LobbyService: LobbyService,
    private router: Router,
  ) {
    this.canEnter = this.GameService.gameState.canEnter
  }

  ngOnInit() {
    this.GameService.canEnter$().subscribe({
      next: (data) => {
        this.canEnter = data
      }
    })

    this.GameService.someoneEnteredRoom$().subscribe({
      next: () => {
        this.someoneInRoom = true
        setTimeout(() => {
          this.someoneInRoom = false
        }, 5000)
      }
    })
 
    this.GameService.gameIsRunning$().subscribe({
      next: (data) => {
        if(data) {
          setTimeout(() => {
            this.router.navigate(['/in-room'])
          }, 1000)
        }
      }
    })
  }

  enterRoom() {
    if(!this.canEnter) return

    const dto: enterRoomDto = {
      player: this.GameService.myPlayer.player
    }
    this.LobbyService.enterRoom(dto).subscribe({
      next: () => {
        this.iAmInRoom = true

        const doorSound = new Howl({
          src: ['/assets/sounds/open-door.wav'],
        });
        doorSound.volume(1)
        doorSound.play()
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  leaveRoom() {
    if(!this.canEnter) return

    const dto: enterRoomDto = {
      player: this.GameService.myPlayer.player
    }
    this.LobbyService.leaveRoom(dto).subscribe({
      next: () => {
        this.iAmInRoom = false
      },
      error: (err) => {
        console.log(err)
      }
    })
  }
}
