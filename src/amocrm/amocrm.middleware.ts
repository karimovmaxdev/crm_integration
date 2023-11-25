import { Injectable, NestMiddleware } from '@nestjs/common';
import { AmocrmService } from './amocrm.service';

@Injectable()
export class AmocrmMiddleware implements NestMiddleware {
  constructor(private readonly amocrmService: AmocrmService) {}
  use(req: any, res: any, next: () => void) {
    if (Date.now() >= this.amocrmService.EXPIRE_IN) {
      console.log('refresh tokens from middleware');
      this.amocrmService
        .refreshTokens()
        .then(() => next())
        .catch(() => next())
        .finally(() => next());
    } else {
      console.log('default middleware');
      next();
    }
  }
}
