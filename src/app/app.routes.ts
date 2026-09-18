
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { BoardUserComponent } from './board-user/board-user.component';
import { BoardModeratorComponent } from './board-moderator/board-moderator.component';
import { BoardAdminComponent } from './board-admin/board-admin.component';
import { Routes } from '@angular/router';
import { authGuard } from './guards/AuthGuardFuntion';
import { roleGuard } from './guards/RoleGuardFuntion';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  {
    path: 'user',
    component: BoardUserComponent,
    canActivate: [
      authGuard,
      roleGuard(['ROLE_USER', 'ROLE_MODERATOR', 'ROLE_ADMIN']),
    ],
  },
  {
    path: 'mod',
    component: BoardModeratorComponent,
    canActivate: [authGuard, roleGuard(['ROLE_MODERATOR'])],
  },
  {
    path: 'admin',
    component: BoardAdminComponent,
    canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])],
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
