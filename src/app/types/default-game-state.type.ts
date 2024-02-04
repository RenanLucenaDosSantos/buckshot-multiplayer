export class defaultGameState {
    canEnter = false
    running = false
    player1 = {
      id: '',
      hp: 3,
      inRoom: false,
    }
    player2 = {
      id: '',
      hp: 3,
      inRoom: false,
    }
    shotgunAmmos = []
    actualTurnPlayer = 'player1';
  
    constructor() {}
  }