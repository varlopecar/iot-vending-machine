import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Store global pour les headers de la requête courante
export class RequestContext {
  private static context = new Map<string, any>();

  static set(key: string, value: any) {
    this.context.set(key, value);
  }

  static get(key: string) {
    return this.context.get(key);
  }

  static clear() {
    this.context.clear();
  }

  static getAuthHeader(): string | undefined {
    return this.get('authorization');
  }
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Nettoyer le contexte précédent
    RequestContext.clear();

    // Stocker les headers de la requête courante
    if (req.headers.authorization) {
      RequestContext.set('authorization', req.headers.authorization);
    }

    next();
  }
}
