import 'express';

declare module 'express' {
  interface Request {
    user?: {
      uid: string;
      email: string;
    };
  }
}
