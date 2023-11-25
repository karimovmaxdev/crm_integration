import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AmocrmController } from './amocrm.controller';
import { AmocrmService } from './amocrm.service';
import { AmocrmMiddleware } from './amocrm.middleware';

@Module({
  controllers: [AmocrmController],
  providers: [AmocrmService],
})
export class AmocrmModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AmocrmMiddleware).forRoutes('/amocrm');
  }
}
