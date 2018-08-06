import { Message } from '../models/message';
import { makeCollection } from '../lib/make-collections';

export const Messages = makeCollection<Message>('messages', Message);
