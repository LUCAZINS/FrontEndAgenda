import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';
export const routes: Routes = [

{
    path: 'Auth/login/Profissional',
    loadComponent: () =>
      import('./shared/component/login-google-profissional/login-google-profissional')
        .then(m => m.LoginGoogleProfissional)
  },
//   {
//     path: 'Auth/login/Profissional/home/Servicos',
//     loadComponent: () =>
//       import('./shared/component/ServicoProfissional/servicocomponent/servicocomponent')
//         .then(m => m.Servicocomponent),
//     canActivate: [authGuard]
//   },
  {
    path:'Auth/login/Profissional/home',
    loadComponent: () =>
      import('./shared/pages/home-pages/home-pages')
        .then(m => m.HomePages),
    canActivate: [authGuard],
    children: [
          {
        path: 'servicos',
        loadComponent: () =>
          import('./shared/component/ServicoProfissional/servicocomponent/servicocomponent')
            .then(m => m.Servicocomponent),
      },

    ]



  },


  {
    path: '404',
    loadComponent: () =>
      import('./shared/pages/page-not-found/page-not-found')
        .then(m => m.PageNotFoundComponent)
  },

   {
    path: '**',
    redirectTo: '404'
  }



];
