import {Injectable} from '@nestjs/common';
import * as moment from "moment"

@Injectable()
export class StringUtils {

  async generateRandomNumber(length: number): Promise<string> {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    // tslint:disable-next-line:no-shadowed-variable
    for (let i = 0; i < length; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  generateRandomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    // tslint:disable-next-line:no-shadowed-variable
    for (let i = 0; i < length; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  /**
   * copied
   * https://codereview.stackexchange.com/questions/139095/generate-powerset-in-js
   * @param l
   */

  powerset(l: string[]) {
    // TODO: ensure l is actually array-like, and return null if not
    return (function ps(list) {
      if (list.length === 0) {
        return [[]];
      }
      const head = list.pop();
      const tailPS = ps(list);
      return tailPS.concat(tailPS.map(function (e) {
        return [head].concat(e);
      }));
    })(l.slice());
  }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  delay(delay: number): number {
    return moment.duration(delay, 'm').asMilliseconds();
  }

  async test() {
    return moment.duration(moment().unix(), 's').add(moment.duration(7, 'm')).asMilliseconds()
  }
}