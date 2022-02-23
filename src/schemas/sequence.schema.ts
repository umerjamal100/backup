import * as mongoose from "mongoose";

export interface Sequence extends mongoose.Document {
  seqName: string;
  nextSeqNumber: number;
}

export const SequenceSchema = new mongoose.Schema({
  seqName: String,
  nextSeqNumber: {type: Number, default: 1}
});

// export const sequenceModel = mongoose.model<Sequence>('Sequence', SequenceSchema, Collection.Sequence, true);
