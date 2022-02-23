import {HttpStatus, Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {sessionName} from '../../common/constants.common';
import {HttpErrors} from '../../common/errors';
import {ErrorMessage} from '../../common/enum.common';

@Injectable()
export class EventsHelper {

  constructor(
    @InjectModel('Session') private readonly sessionModel: Model<any>,
  ) {
  }

  async authenticateConnection(cookie: string): Promise<string> {
    try {
      const sessionId = cookie.split(';').find(str => {
        return str.indexOf(sessionName) > -1;
      }).split('=')[1].split('.')[0].slice(4);
      const session = await this.sessionModel.findOne({_id: sessionId}).lean();
      try {
        return session['session'].passport.user._id;
      } catch (e) {
        throw new Error('Session not found!');
      }
    } catch (e) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        error: HttpErrors.UNAUTHORIZED,
        message: ErrorMessage.UNAUTHORIZED,
      });
    }
  }
}