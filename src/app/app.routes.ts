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
  path: 'Auth/Profissional/home',
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

    {
      path: 'agendamentos',
      loadComponent: () =>
        import('./shared/component/AgendamentoProfissional/profissionalcomponent')
          .then(m => m.Profissionalcomponent),
    },

    {
      path: 'Perfil',
      loadComponent: () =>
        import('./shared/component/perfil-prof-component/perfil-prof-component')
          .then(m => m.PerfilProfComponent),
    },

    {
      path: 'clientes',
      loadComponent: () =>
        import('./shared/component/cliente-components/clienteComponents')
          .then(m => m.ClienteComponents),
    }

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
