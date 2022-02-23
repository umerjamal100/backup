import {Inject, Injectable, UnprocessableEntityException} from '@nestjs/common';
import {AxiosInstance} from 'axios';
import {IDPProfileInterface} from './interfaces/auth.helper';
import {ConfigService} from '../config/config.service';

// TODO to be completed
@Injectable()
export class FacebookHelper {
  constructor(
    @Inject('GraphApiAxios')
    private readonly graphAPI: AxiosInstance,
    @Inject('OauthApiAxios')
    private readonly oauthAPI: AxiosInstance,
    private readonly configService: ConfigService,
  ) {
  }

  async verifyId(accessToken: string): Promise<IDPProfileInterface> {
    try {
      const {data} = await this.oauthAPI.get(`access_token?client_id=${this.configService.facebookAppId}&client_secret=${this.configService.facebookAppSecret}&grant_type=client_credentials`);
      console.log(data.access_token);
      const user = await this.graphAPI.get(`debug_token?access_token=${data.access_token}&input_token=${accessToken}`);
      console.log(user);
      return user.data;
    } catch (e) {
      // console.error(e);
      throw new UnprocessableEntityException();
    }
  }
}