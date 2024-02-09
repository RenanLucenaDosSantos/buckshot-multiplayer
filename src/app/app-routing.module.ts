import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LobbyComponent } from './components/lobby/lobby.component';
import { GameComponent } from './components/game/game.component';
import { canActivateMatch } from './services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: LobbyComponent
  },
  {
    path: 'lobby',
    component: LobbyComponent
  },
  {
    path: 'in-room',
    component: GameComponent,
    canActivate: [canActivateMatch]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }