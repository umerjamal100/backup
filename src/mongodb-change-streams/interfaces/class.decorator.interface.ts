export interface ChangeStreamInterface {
  changesStream: (collection: string, changeType: ChangeType) => any | Promise<any>;
  deleteStream: (collection: string) => any | Promise<any>;
}

export enum ChangeType {
  UPDATE = 'update',
  INSERT = 'insert',
  REPLACE = 'replace',
  DELETE = 'delete',
}

export interface SubscriptionInterface {
  descriptorName: string;
  collection: string;
  stream: ChangeType;
}