
import { DocModel } from "./doc-model";

export class Picture extends DocModel {
  static FOR = {
    USER_AVATAR: 'user-avatar',
    BOOK_SHOT: 'book-shot',
    BOOK_COVER: 'book-cover',
    CHAT_MESSAGE: 'chat-message',
  };

  complete?: boolean;
  extension?: string;
  name?: string;
  progress?: number;
  size?: number;
  store?: string;
  token?: string;
  type?: string;
  uploadedAt?: Date;
  uploading?: boolean;
  url?: string;
  userId?: string;
  for?: string;
}


