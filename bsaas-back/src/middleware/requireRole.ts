import { Request, Response, NextFunction } from 'express';

// Checks if the authenticated user has at least one of the allowed roles
export function requireRole(
  allowedRoles: string[],
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    // user.roles can be an array of role objects or strings
    const userRoles: string[] = Array.isArray(user?.roles)
      ? user.roles.map((r: any) => (typeof r === 'string' ? r : r.name))
      : [];
    if (!userRoles.some((role) => allowedRoles.includes(role))) {
      res
        .status(403)
        .json({
          code: 'error.unauthorized',
          message: 'Only business users can manage portfolios.',
        });
      return;
    }
    next();
  };
}
