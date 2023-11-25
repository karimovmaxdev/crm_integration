import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly kek: string;
  constructor() {
    this.kek = this.kek ? this.kek : 'yes';
    console.log(this.kek);
  }
  getHello(): string {
    console.log('is work');
    return 'Hello World!';
  }
}
