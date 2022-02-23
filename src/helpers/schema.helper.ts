// import {sequenceModel} from "./sequence";

import {Injectable} from '@nestjs/common';

@Injectable()
export class SchemaHelper {
  // constructor(
  //   @InjectModel('Sequence')
  //   private readonly sequenceModel: Model<>
  // ) {
  // }
  // updateSequenceId(seqName: Collection) {
  //   return this.sequenceModel.findOneAndUpdate(
  //     {seqName},
  //     {$inc: {nextSeqNumber: 1}},
  //     {new: true, upsert: true}
  //   );
  // }
}
