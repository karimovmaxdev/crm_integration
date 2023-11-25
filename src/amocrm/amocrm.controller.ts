import { Controller, Get, Query } from '@nestjs/common';
import { AmocrmService } from './amocrm.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Controller()
export class AmocrmController {
  constructor(private readonly amocrmService: AmocrmService) {}

  @Get('amocrm')
  async getData(
    @Query('name') name: string,
    @Query('email') email: string,
    @Query('phone') phone: string,
  ): Promise<any> {
    try {
      const info = await this.amocrmService.getContactAndCompany({
        name,
        email,
        phone,
      });
      console.log('info: ', info);
      return info;
    } catch (error) {
      console.log('error in controller: ', error);
      return error.response.data;
    }
  }
}
