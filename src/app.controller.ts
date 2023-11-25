import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// {
//   hint: 'Authorization code has expired',
//   title: 'Некорректный запрос',
//   type: 'https://developers.amocrm.ru/v3/errors/OAuthProblemJson',
//   status: 400,
//   detail: 'В запросе отсутствует ряд параметров или параметры невалидны'
// }

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<any> {
    return 'hello';
  }
}
