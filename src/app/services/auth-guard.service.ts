import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  canActivate(player: boolean): boolean {
    return player;
  }
}

export const canActivateMatch: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  if(inject(GameService).myPlayer.player.length > 0) {
    return true
  }
  else {
    inject(Router).navigate(['/']);
    return false
  }
};