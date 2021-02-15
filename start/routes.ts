import Route from '@ioc:Adonis/Core/Route';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import academicRoutes from 'app/modules/academic/academicRoutes';
import { getAuthGuard } from 'app/services/utils';

Route.group(() => {
  academicRoutes();

  Route.get('/test', async ({ auth }: HttpContextContract) => {
    return auth.user;
  }).middleware([getAuthGuard(), 'can:add-users']);
}).prefix('api');

Route.post('/api/login', '/app/modules/auth/authController.login');
Route.post('/api/register', '/app/modules/auth/authController.register');
Route.get('/api/post', '/app/modules/auth/authController.post');
