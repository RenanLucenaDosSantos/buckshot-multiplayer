export interface GameState {
    canEnter: boolean;
    running: boolean;

    player1: player;
    player2: player;

    shotgunAmmos: boolean[];
    actualTurnPlayer: string;
}

interface player {
    id: string;
    hp: number;
    inRoom: boolean;
}