import { FastAverageColor } from 'fast-average-color';
import { clientId } from './lib';
import { error } from './logger';
import type { Local, Synced } from '../types/chrome';
import type { TwitchStream, TwitchUser } from '../types/twitch';

export function setStorage(key: Synced, value: unknown): Promise<void> {
  return chrome.storage.local.set({ [key]: value });
}

export function getStorage(
  key: 'NowLive:Favorites',
): Promise<string[] | undefined>;
export function getStorage(key: 'NowLive:Token'): Promise<string | undefined>;
export function getStorage(key: Synced): Promise<unknown>;
export function getStorage<T>(key: Synced): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(key, (res) => {
        resolve(res[key]);
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function setStorageLocal(key: Local, value: unknown): Promise<void> {
  return chrome.storage.local.set({ [key]: value });
}

export function getStorageLocal(
  key: 'NowLive:Channels',
): Promise<TwitchStream[] | undefined>;
export function getStorageLocal(
  key: 'NowLive:Theme',
): Promise<'light' | 'dark'>;
export function getStorageLocal<T>(key: Local): Promise<T> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (res) => resolve(res[key]));
  });
}

export async function setStorageIfNull(
  key: Synced,
  value: unknown,
): Promise<void> {
  if ((await getStorage(key)) === undefined) {
    setStorage(key, value);
  }
}

export async function setStorageLocalIfNull(
  key: Synced,
  value: unknown,
): Promise<void> {
  if ((await getStorage(key)) === undefined) {
    setStorage(key, value);
  }
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  const reader = new FileReader();
  return new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export async function getChannelInfo(): Promise<void> {
  const token = await getStorage('NowLive:Token');
  if (!token) {
    await chrome.browserAction.setTitle({
      title: 'Please verify Now Live',
    });
    await chrome.browserAction.setBadgeText({ text: '' });
    return;
  }
  try {
    const userId = await getStorage('NowLive:UserId');

    const { data }: { data: TwitchStream[] } = await (
      await fetch(
        `https://api.twitch.tv/helix/streams/followed?user_id=${userId}`,
        {
          headers: {
            'Client-Id': clientId,
            Authorization: `Bearer ${token}`,
          },
        },
      )
    ).json();

    const users: { data: TwitchUser[] } = await fetch(
      `https://api.twitch.tv/helix/users?id=${data
        .map((stream) => stream.user_id)
        .join('&id=')}`,
      {
        headers: {
          'Client-Id': clientId,
          Authorization: `Bearer ${token}`,
        },
      },
    ).then((res) => res.json());

    const withicons = data.map((stream) => {
      const withicon = {
        ...stream,
        profile_image_url:
          users.data.find((user: TwitchUser) => user.id === stream.user_id)
            ?.profile_image_url || '',
      };

      return withicon;
    });

    const fac = new FastAverageColor();

    // Downloads the images and converts them into a base64 url
    const withImages = await Promise.all(
      withicons.map(async (stream) => {
        const url = stream.profile_image_url;
        if (url.startsWith('https://static-cdn.jtvnw.net/')) {
          const blob = await (await fetch(stream.profile_image_url)).blob();

          const withImage: TwitchStream = {
            ...stream,
            profile_image_url: await blobToBase64(blob),
            average_color: await fac.getColorAsync(stream.profile_image_url),
          };

          return withImage;
        }
        return stream;
      }),
    );

    const streamingNow = Number(data.length.toString());

    if (streamingNow !== 0) {
      await chrome.browserAction.setTitle({
        title: `There are ${streamingNow} people streaming right now`,
      });
      await chrome.browserAction.setBadgeText({
        text: streamingNow.toString(),
      });
    } else {
      await chrome.browserAction.setTitle({
        title: 'There is nobody streaming right now',
      });
      await chrome.browserAction.setBadgeText({ text: '' });
    }

    await setStorageLocal('NowLive:Channels', withImages);
  } catch (err) {
    error(err);
  }
}
