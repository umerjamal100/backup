import {Injectable} from '@nestjs/common';
import {InjectConnection} from '@nestjs/mongoose';
import {Connection} from 'mongoose';

@Injectable()
export class TokenProvider {
  constructor(
    @InjectConnection() private connection: Connection,
  ) {
  }

  async getResumetoken(id) {
    console.log('Getting resume token', {id});
    const tokensCollection = await this.connection.collections['tokens'];
    const result = await tokensCollection.findOne({'_id': id});
    return result ? result.resumeToken : null;
  }

  async saveResumeTaken(resumeToken, id) {
    console.log('Saving resume token');
    const tokensCollection = await this.connection.collections['tokens'];
    return tokensCollection.updateOne(
      {'_id': id},
      {'$set': {resumeToken, 'lastModifiedDate': new Date()}},
      {'upsert': true},
    );
  }
}