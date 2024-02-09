import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { fireDto } from 'src/app/dto/fire.dto';
import { GameService } from 'src/app/services/game.service';
import { LobbyService } from 'src/app/services/lobby.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewInit {
  youArePlayer: string
  realShotgun: boolean[]
  sortedShotgun: boolean[]
  bulletPattern: boolean[]
  actualTurnPlayer = ''
  canPlay = false
  starting = true
  actualBullet = 0

  player1HP = 3
  player2HP = 3

  showHP = {
    myHP: 3,
    opponentHP: 3,
  }
  showSortedAmmo = false
  gunPointedTo = 'neutral'
  ready = false
  // screenEffect = ''

  constructor (
    private GameService: GameService,
    private LobbyService: LobbyService,
    private router: Router,
  ) {
    this.youArePlayer = this.GameService.myPlayer.player

    // console.log('o que o realShotgun recebe no começo', this.GameService.gameState.shotgunAmmos)
    this.realShotgun = [...this.GameService.gameState.shotgunAmmos];
    this.bulletPattern = [...this.GameService.gameState.shotgunAmmos];
    this.sortedShotgun = this.shuffleBullets([...this.realShotgun]);
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

        // console.log('shotgun atualizada', gameState.shotgunAmmos)

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

        this.realShotgun = [...gameState.shotgunAmmos]
        this.actualTurnPlayer = gameState.actualTurnPlayer
        this.canPlay = this.actualTurnPlayer === this.youArePlayer ? true : false
      }
    })

    this.GameService.reloadAmmo$().subscribe({
      next: (data) => {
        console.log('reload')
        this.ready = false
        this.realShotgun = [...data];
        this.bulletPattern = [...data];
        this.sortedShotgun = this.shuffleBullets([...data]);
        setTimeout(() => {
          this.runTurnAnimation()
        }, 2000)
      }
    })

    this.actualTurnPlayer = this.GameService.gameState.actualTurnPlayer
    if(this.actualTurnPlayer === this.youArePlayer) this.canPlay = true
  }
 
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.runTurnAnimation()
      const lightsOn = new Howl({
        src: ['/assets/sounds/light-switch.wav'],
      });
      lightsOn.volume(1)
      lightsOn.play()

      this.starting = false
    }, 1000)
  }

  runOponnentFireAnimation() {
    this.gunPointedTo = 'enemy'
    this.ready = false
    
    setTimeout(() => {
      const fireSound = new Howl({
        src: ['/assets/sounds/shotgun-fire.wav'],
      });
      fireSound.volume(.6)
      fireSound.play()

      // this.startScreenEffect('enemy-damage')
      
      this.showHP.opponentHP = this.showHP.opponentHP - 1
      this.gunPointedTo = 'ready'
      this.dropBullet()

      if(this.showHP.opponentHP > 0 && this.realShotgun.length) {
        this.ready = true
      }
    }, 2000)
  }

  runSelfFireAnimation() {
    this.gunPointedTo = 'me'
    this.ready = false
    
    setTimeout(() => {
      const fireSound = new Howl({
        src: ['/assets/sounds/shotgun-fire.wav'],
      });
      fireSound.volume(.6)
      fireSound.play()

      // this.startScreenEffect('me-damage')

      this.showHP.myHP = this.showHP.myHP - 1
      this.gunPointedTo = 'ready'
      this.dropBullet()

      if(this.showHP.myHP > 0 && this.realShotgun.length) {
        this.ready = true
      }
    }, 2000)
  }

  runSelfBlankAnimation() {
    this.gunPointedTo = 'me'
    this.ready = false
    
    setTimeout(() => {
      const blankSound = new Howl({
        src: ['/assets/sounds/blank-shot.wav'],
      });
      blankSound.volume(.5)
      blankSound.play()

      this.gunPointedTo = 'ready'
      this.dropBullet()

      if(this.realShotgun.length) {
        this.ready = true
      }
    }, 2000)
  }

  runOponnentBlankAnimation() {
    this.gunPointedTo = 'enemy'
    this.ready = false

    setTimeout(() => {
      const blankSound = new Howl({
        src: ['/assets/sounds/blank-shot.wav'],
      });
      blankSound.volume(.5)
      blankSound.play()

      this.gunPointedTo = 'ready'
      this.dropBullet()

      if(this.realShotgun.length) {
        this.ready = true
      }
    }, 2000)
  }

  // startScreenEffect(effect: string) {
  //   this.screenEffect = effect
  //   this.dismissScreenEffect()
  // }

  // dismissScreenEffect() {
  //   setTimeout(() => {
  //     this.screenEffect = ''
  //   }, 400);
  // }

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

  dropBullet() {    
    setTimeout(() => {
      const bullet = document.getElementById(`bullet-${this.actualBullet}`)
      let randomTop, randomLeft;
  
      do {
          randomTop = Math.floor(Math.random() * (80 - 20 + 1)) + 20;
      } while (randomTop >= 40 && randomTop <= 60);
  
      do {
          randomLeft = Math.floor(Math.random() * (80 - 20 + 1)) + 20;
      } while (randomLeft >= 40 && randomLeft <= 60);
  
      const randomAngle = Math.floor(Math.random() * (180 - 1 + 1)) + 1;
      
      if(bullet) {
        bullet.style.top = `${randomTop}%`
        bullet.style.left = `${randomLeft}%`
        bullet.style.transform = `translate(-50%, -50%) rotateZ(${randomAngle}deg)`
        bullet.style.opacity = '1'
      }

      const bulletSound = new Howl({
        src: ['/assets/sounds/bullet-drop.wav'],
      });
      bulletSound.volume(5)
      bulletSound.play()
  
      this.actualBullet = this.actualBullet + 1
    }, 600)
  }

  clearDroppedBullets() {
    setTimeout(() => {
      this.actualBullet = 0
  
      let i = 0
      while(i < 5) {
        const bullet = document.getElementById(`bullet-${i}`)
  
        if(bullet) {
          bullet.style.top = '50%'
          bullet.style.left = '50%'
          bullet.style.transform = 'translate(-50%, -50%) rotateZ(0deg)'
          bullet.style.opacity = '0'
        }
        i++
      }
    }, 800)
  }

  runLoseAnimation() {
    this.router.navigate(['/lobby'])
  }
  
  runTurnAnimation() {
    this.clearDroppedBullets()
    this.ready = false

    this.showSortedAmmo = true
    setTimeout(() => {
      this.showSortedAmmo = false
      this.reload()
    }, 3000)
  }

  reload() {
    this.gunPointedTo = 'neutral'
    this.ready = false

    const bulletSound = new Howl({
      src: ['/assets/sounds/shotgun-reaload.wav'],
    });

    this.realShotgun.forEach((bullet, index) => {
      setTimeout(() => {
        bulletSound.volume(1)
        bulletSound.play()
      }, 500 * index)
    })

    setTimeout(() => {
      this.gunPointedTo = 'ready'
      this.ready = true
    }, 500 * this.realShotgun.length)
  }
 
  fire(target: string) {
    const dto: fireDto = {
      player: this.youArePlayer,
      bullet: this.realShotgun[0],
      target
    }

    this.GameService.postFire(dto).subscribe({
      next: () => {
        // console.log('fire http sent')
      }
    })
  }
 
  win(winner: string) {
    setTimeout(() => {
      this.GameService.gameIsRunning.next(false)
      if(winner === this.youArePlayer) this.runWinAnimation()
      if(winner !== this.youArePlayer) this.runLoseAnimation()
    }, 2000)
  }

  // sortBullets(shotgunAmmos: boolean[]): boolean[] {
  //   const randomChoice = Math.random() < 0.5;
  
  //   const sortedArray = randomChoice
  //     ? shotgunAmmos.sort((a, b) => (a === true ? -1 : 1))
  //     : shotgunAmmos.sort((a, b) => (a === false ? -1 : 1));
  
  //   return sortedArray;
  // }

  shuffleBullets(shotgunAmmos: boolean[]): boolean[] {
    let shuffledArray = [...shotgunAmmos];

    function shuffleArray(array: boolean[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    if (shuffledArray.length > 2) {
        do {
            shuffleArray(shuffledArray);
        } while (JSON.stringify(shuffledArray) === JSON.stringify(this.realShotgun));
    } else {
        shuffleArray(shuffledArray);
    }

    return shuffledArray;
  }
}
