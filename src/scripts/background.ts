import {
  getChannelInfo,
  setStorageIfNull,
  setStorageLocalIfNull,
} from '../lib/chromeapi';
import { log } from '../lib/logger';
import validateToken from '../lib/validateToken';

chrome.alarms.create('NowLive:Refresh', { delayInMinutes: 1 });

chrome.runtime.onInstalled.addListener(async () => {
  await setStorageLocalIfNull('NowLive:Theme', 'dark');
  await setStorageIfNull('NowLive:Favorites', []);
  log('Initialized Now Live');
});

chrome.storage.onChanged.addListener(async changes => {
  if ('NowLive:Token' in changes) await getChannelInfo();
});

chrome.runtime.onMessage.addListener(async (message, sender, res) => {
  if (sender.url?.startsWith('https://nowlive.jamesinaxx.me/auth/callback')) {
    return false;
  }

  if (
    typeof message === 'object' &&
    message.name === 'NowLive:Token' &&
    typeof message.token === 'string'
  ) {
    if (await validateToken(message.token)) {
      res([`Received valid token: ${message.token}`, true]);
    } else {
      res([`Received invalid token: ${message.token}`, false]);
    }
  } else {
    res([`Received invalid message object: ${message}`, false]);
  }
  return true;
});

(async () => {
  await getChannelInfo();
  chrome.alarms.onAlarm.addListener(async alarm => {
    if (alarm.name === 'NowLive:Refresh') {
      await getChannelInfo();
    }
  });
})();
