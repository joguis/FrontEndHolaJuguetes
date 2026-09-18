import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage-service.service';

export const authGuard: CanActivateFn = (route, state) => {
    const storageService = inject(StorageService);
    const router = inject(Router);
    console.log("Verificando si el usuario esta autenticado");
    if (storageService.isLoggedIn()) {
        console.log("Usuario autenticado");
        return true;
    } else {
        console.log("Usuario no autenticado, redirigiendo a login");
        router.navigate(['/login']);
        return false;
    }
};