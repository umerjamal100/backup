export type Relationship = {
  profilePic: string;
  healthCards: string[]; // front and back
  emiratesId: string[] // front and back
  _id: string;
}

export type Nullable<T> = {
  [P in keyof T]?: T[P];
};

