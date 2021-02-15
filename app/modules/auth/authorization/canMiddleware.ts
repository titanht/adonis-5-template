import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import UnAuthorizedException from './unAuthorizedException';

export default class CanMiddleware {
  public async handle(
    { auth }: HttpContextContract,
    next: () => Promise<void>,
    allowedPermissions: string[]
  ) {
    const userPermissions: string[] = JSON.parse(
      auth.user?.permissions || '[]'
    );
    if (!allowedPermissions.every((i) => userPermissions.includes(i))) {
      throw new UnAuthorizedException();
    }

    await next();
  }
}
