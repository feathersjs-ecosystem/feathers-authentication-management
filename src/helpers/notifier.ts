import makeDebug from 'debug';
import sanitizeUserForNotifier from './sanitize-user-for-notifier';

import type { User, Notifier, NotificationType } from '../types';

const debug = makeDebug('authLocalMgnt:notifier');

// TODO: notifierOptions
export default async function notifier (
  optionsNotifier: Notifier,
  type: NotificationType,
  user: User,
  notifierOptions: Record<string, unknown>
): Promise<User> {
  debug('notifier', type);

  await optionsNotifier(type, sanitizeUserForNotifier(user), notifierOptions || {});
  return user;
}
