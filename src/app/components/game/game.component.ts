import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { fireDto } from 'src/app/dto/fire.dto';
import { GameService } from 'src/app/services/game.service';
import { LobbyService } from 'src/app/services/lobby.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  youArePlayer: string
  realShotgun: boolean[]
  sortedShotgun: boolean[]
  actualTurnPlayer = 'player1'
  canPlay = false

  player1HP = 3
  player2HP = 3

  showHP = {
    myHP: 3,
    opponentHP: 3,
  }
  showSortedAmmo = false

  constructor (
    private GameService: GameService,
    private LobbyService: LobbyService,
    private router: Router,
  ) {
    this.youArePlayer = this.GameService.myPlayer.player

    this.realShotgun = this.GameService.gameState.shotgunAmmos;
    this.sortedShotgun = this.sortBullets(this.realShotgun);
    this.runTurnAnimation()
  }

  ngOnInit() {
    this.GameService.gameIsRunning$().subscribe({
      next: (data) => {
        if(!data) this.router.navigate(['/'])
      }
    })

    this.GameService.fire$().subscribe({
      next: (data) => {
        const gameState = data[0]
        const target = data[1]
        const bullet = data[2]

        // Target is me
        if(bullet && target === this.youArePlayer) this.runSelfFireAnimation()
        if(!bullet && target === this.youArePlayer) this.runSelfBlankAnimation()

        // Target is him
        if(bullet && target !== this.youArePlayer) this.runOponnentFireAnimation()
        if(!bullet && target !== this.youArePlayer) this.runOponnentBlankAnimation()

        // Update hp state
        this.player1HP = gameState.player1.hp
        this.player2HP = gameState.player2.hp

        // If game ended
        if(this.player1HP === 0) {
          this.win('player2')
          return
        }
        if(this.player2HP === 0) {
          this.win('player1')
          return
        }

        this.realShotgun = gameState.shotgunAmmos
        this.actualTurnPlayer = gameState.actualTurnPlayer
      }
    })

    this.GameService.reloadAmmo$().subscribe({
      next: (data) => {
        this.realShotgun = data;
        this.sortedShotgun = this.sortBullets(data);
        this.runTurnAnimation()
      }
    })
  }

  runOponnentFireAnimation() {
    this.showHP.opponentHP = this.showHP.opponentHP - 1
  }

  runSelfFireAnimation() {
    this.showHP.myHP = this.showHP.myHP - 1
  }

  runSelfBlankAnimation() {
    
  }

  runOponnentBlankAnimation() {
    
  }

  runWinAnimation() {
    this.GameService.win(this.youArePlayer).subscribe({
      next: () => {
        console.log('Você ganhou')
      },
      error: (err) => {
        console.log(err)
      }
    })
    this.router.navigate(['/lobby'])
  }
  
  runLoseAnimation() {
    this.router.navigate(['/lobby'])
  }
  
  runTurnAnimation() {
    this.showSortedAmmo = true
    setTimeout(() => {
      this.showSortedAmmo = false
      this.reload()
    }, 3000)
  }

  reload() {
    this.realShotgun.forEach((bullet, index) => {
      setTimeout(() => {
        console.log('som de load')
      }, 500 * index)
    })
  }

  fire(target: string) {
    const dto: fireDto = {
      player: this.youArePlayer,
      bullet: this.realShotgun[0],
      target
    }

    this.GameService.postFire(dto).subscribe({
      next: () => {
        console.log('fire http sent')
      }
    })
  }

  win(winner: string) {
    this.GameService.gameIsRunning.next(false)
    if(winner === this.youArePlayer) this.runWinAnimation()
    if(winner !== this.youArePlayer) this.runLoseAnimation()
  }

  sortBullets(shotgunAmmos: boolean[]): boolean[] {
    const randomChoice = Math.random() < 0.5;
  
    const sortedArray = randomChoice
      ? shotgunAmmos.sort((a, b) => (a === true ? -1 : 1))
      : shotgunAmmos.sort((a, b) => (a === false ? -1 : 1));
  
    return sortedArray;
  }
}
