import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AmocrmModule } from './amocrm/amocrm.module';

@Module({
  imports: [AmocrmModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
