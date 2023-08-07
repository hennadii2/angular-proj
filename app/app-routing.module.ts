import { NgModule } from '@angular/core';
import { ExtraOptions, Routes, RouterModule } from '@angular/router';
import { ProtectGuard } from './shared/authentication/protect.guard';
import { PublicGuard } from './shared/authentication/public.guard';

const routes: Routes = [
  { path: 'pages', canActivate: [ProtectGuard], loadChildren: './pages/pages.module#PagesModule',runGuardsAndResolvers: 'always' },
  { path: 'auth',  canActivate: [PublicGuard], loadChildren: './auth/auth.module#AuthModule',runGuardsAndResolvers: 'always' },
  { path: '**', redirectTo: 'auth' },
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
