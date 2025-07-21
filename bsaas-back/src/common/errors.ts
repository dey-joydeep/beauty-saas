export class NotFoundError extends Error {
  status: number;
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

export class UnauthorizedError extends Error {
  status: number;
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    this.status = 401;
  }
}

export class ForbiddenError extends Error {
  status: number;
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.status = 403;
  }
}

export class BadRequestError extends Error {
  status: number;
  constructor(message: string = 'Bad request') {
    super(message);
    this.name = 'BadRequestError';
    this.status = 400;
  }
}
