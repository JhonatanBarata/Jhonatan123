import requireRole from './roles';

/**
 * `Roles(...)` — usable both as Express middleware factory and (optionally)
 * as a TS method decorator. Example middleware usage:
 *   router.post('/x', authMiddleware, Roles('ADMIN','MASTER'), handler)
 * If used as a decorator (`@Roles('ADMIN')`) it will attach a `__rolesMiddleware`
 * property to the method for future frameworks that want metadata.
 */
export function Roles(...roles: string[]) {
  const middleware = requireRole(roles);

  function wrapper(...args: any[]) {
    // Express will call with (req,res,next) where req.headers exists
    if (args[0] && args[0].headers !== undefined) {
      return (middleware as any)(...args);
    }

    // Decorator usage: (target, propertyKey, descriptor)
    const [target, propertyKey, descriptor] = args as any;
    if (descriptor && typeof descriptor === 'object') {
      (descriptor.value as any).__rolesMiddleware = middleware;
      return descriptor;
    }

    return wrapper;
  }

  return wrapper as any;
}

export default Roles;
