
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { BoardUserComponent } from './board-user/board-user.component';
import { BoardAdminComponent } from './board-admin/board-admin.component';
import { BoardSellerComponent } from './board-seller/board-seller.component';
import { Routes } from '@angular/router';
import { authGuard } from './guards/AuthGuardFuntion';
import { roleGuard } from './guards/RoleGuardFuntion';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  {
    path: 'dashboard',
    component: BoardAdminComponent,
    canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])],
  },
  { path: 'categorias', component: BoardAdminComponent, canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])], data: { resource: 'categorias' } },
  { path: 'subcategorias', component: BoardAdminComponent, canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])], data: { resource: 'subcategorias' } },
  { path: 'proveedores', component: BoardAdminComponent, canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])], data: { resource: 'proveedores' } },
  { path: 'grupos-venta', component: BoardAdminComponent, canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])], data: { resource: 'grupos-venta' } },
  { path: 'productos', component: BoardAdminComponent, canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])], data: { resource: 'productos' } },
  { path: 'movimientos', component: BoardAdminComponent, canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])], data: { resource: 'movimientos' } },
  { path: 'admin', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'movimientos/registrar',
    component: BoardSellerComponent,
    canActivate: [authGuard, roleGuard(['ROLE_SELLER', 'ROLE_VENDEDOR'])],
  },
  { path: 'user', redirectTo: 'movimientos/registrar', pathMatch: 'full' },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
