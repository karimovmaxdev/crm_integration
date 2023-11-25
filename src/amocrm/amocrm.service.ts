import { Injectable, OnModuleInit } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

const ID_INTEGRATION_KEY = process.env.ID_INTEGRATION_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const AUTH_CODE = process.env.AUTH_CODE;
const BASE_URL = process.env.BASE_URL;
const REDIRECT_URI = process.env.REDIRECT_URI;

interface iData {
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AmocrmService implements OnModuleInit {
  private ACCESS_TOKEN: string;
  private REFRESH_TOKEN: string;
  EXPIRE_IN: number;
  axiosInstance: AxiosInstance;
  constructor() {}

  async onModuleInit(): Promise<void> {
    // state module init
    await this.createNewTokens();
  }

  setData(data: iData): void {
    const { expires_in, access_token, refresh_token } = data;

    this.ACCESS_TOKEN = access_token;
    this.REFRESH_TOKEN = refresh_token;
    this.EXPIRE_IN = Date.now() + expires_in * 1000;

    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      headers: {
        Authorization: `Bearer ${this.ACCESS_TOKEN}`,
      },
    });
  }

  async createNewTokens(): Promise<void> {
    console.log('createNewTokens()');

    try {
      const body = {
        client_id: ID_INTEGRATION_KEY,
        client_secret: SECRET_KEY,
        grant_type: 'authorization_code',
        code: AUTH_CODE,
        redirect_uri: REDIRECT_URI,
      };

      const response = await axios.post(
        `${BASE_URL}/oauth2/access_token`,
        body,
      );

      this.setData(response.data);
      this.saveTokensToBd();
    } catch (error) {
      if (
        error?.response?.data?.hint == 'Authorization code has been revoked'
      ) {
        console.log('if Authorization code has been revoked');
        // если AUTH_CODE протух, считываем последние актуальные токены из джсона.
        // если они валидны, сервер продолжит работу
        // если токены устарели, нужно обновить AUTH_CODE
        const info = this.readTokensFromBd();
        this.setData(info);
        return;
      }
      console.log(error);
    }
  }

  async refreshTokens(): Promise<void> {
    console.log('refreshTokens()');
    try {
      const body = {
        client_id: ID_INTEGRATION_KEY,
        client_secret: SECRET_KEY,
        grant_type: 'refresh_token',
        refresh_token: this.REFRESH_TOKEN,
        redirect_uri: REDIRECT_URI,
      };
      console.log('fetch for refresh');
      const response = await this.axiosInstance.post(
        '/oauth2/access_token',
        body,
      );
      this.setData(response.data);
      this.saveTokensToBd();
    } catch (error) {
      console.log('refresh error: ');
      console.log(error.response.data);
    }
  }

  async getContactAndCompany({ email, name, phone }) {
    let contact = null;
    const findByEmail = await this.axiosInstance.get('/api/v4/contacts', {
      params: {
        query: email,
      },
    });
    const findByPhone = await this.axiosInstance.get('/api/v4/contacts', {
      params: {
        query: email,
      },
    });

    if (!findByPhone.data && !findByEmail.data) {
      console.log('create new user');
      const body = [
        {
          name: name,
          first_name: name,
          custom_fields_values: [
            {
              field_code: 'EMAIL',
              field_name: 'email',
              values: [
                {
                  value: email,
                },
              ],
            },
            {
              field_code: 'PHONE',
              field_name: 'phone',
              values: [
                {
                  value: phone,
                },
              ],
            },
          ],
        },
      ];
      const newContact = await this.axiosInstance.post(
        '/api/v4/contacts',
        body,
      );
      contact = newContact.data._embedded.contacts[0];
    } else {
      console.log('patch user');
      const user_id =
        findByPhone?.data?._embedded.contacts[0].id ||
        findByEmail?.data?._embedded.contacts[0].id;
      const body = [
        {
          id: user_id,
          name: name,
          first_name: name,
          custom_fields_values: [
            {
              field_code: 'EMAIL',
              field_name: 'email',
              values: [
                {
                  value: email,
                },
              ],
            },
            {
              field_code: 'PHONE',
              field_name: 'phone',
              values: [
                {
                  value: phone,
                },
              ],
            },
          ],
        },
      ];
      const patchedContact = await this.axiosInstance.patch(
        '/api/v4/contacts',
        body,
      );
      contact = patchedContact.data._embedded.contacts[0];
    }

    const lead = await this.createLead(contact);
    return {
      contact,
      lead,
    };
  }

  async createLead(user) {
    console.log('create lead');
    const body = [
      {
        name: 'Моя сделка',
        price: 7777,
        _embedded: {
          contacts: [user],
        },
      },
    ];
    const newLead = await this.axiosInstance.post(
      '/api/v4/leads/complex',
      body,
    );
    return newLead.data[0];
  }

  // вместо бд используется обычный json файл, просто в качестве примера.
  saveTokensToBd() {
    const data = {
      refresh_token: this.REFRESH_TOKEN,
      access_token: this.ACCESS_TOKEN,
      expire: this.EXPIRE_IN,
    };
    fs.writeFileSync('bd.json', JSON.stringify(data, null, 2));
  }

  readTokensFromBd() {
    const data = fs.readFileSync('bd.json', 'utf8');
    return JSON.parse(data);
  }
}
