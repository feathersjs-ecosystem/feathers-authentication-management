import makeDebug from 'debug';
import { User, Notifier } from '../types';
import sanitizeUserForNotifier from './sanitize-user-for-notifier';

const debug = makeDebug('authLocalMgnt:notifier');

// TODO: notifierOptions
export default async function notifier (optionsNotifier: Notifier, type: string, user: User, notifierOptions: Record<string, unknown>): Promise<User> {
  debug('notifier', type);
  await optionsNotifier(type, sanitizeUserForNotifier(user), notifierOptions || {});
  return user;
}
