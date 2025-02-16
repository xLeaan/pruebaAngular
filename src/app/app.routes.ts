import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'entidades',
        loadComponent: ()=>import("./entidades/entidades.component"),
    },
    {
        path: 'contactos',
        loadComponent: ()=>import("./contactos/contactos.component"),
    }
];