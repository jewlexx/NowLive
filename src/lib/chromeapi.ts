import { useCallback, useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";
import { base64ArrayBuffer } from "./arrayBufferBase64";
import { clientId } from "./lib";
import type { Key } from "../types/chrome";
import type { TwitchStream, TwitchUser } from "../types/twitch";
import { Theme } from "../theme";

export type ResolveNew<T> = T | ((prevState: T) => T);

export function useStorage<T>(
  key: Key,
): [T | undefined, (newValue: ResolveNew<T>) => void] {
  const [value, setValue] = useState<T | undefined>(undefined);

  const onChanged = useCallback(
    (changes: Record<string, browser.storage.StorageChange>) => {
      if (key in changes) {
        setValue(changes[key].newValue);
      }
    },
    [key],
  );

  const setValueLocal = useCallback(
    (newValue: ResolveNew<T>) => {
      if (typeof newValue === "function") {
        browser.storage.local.get(key).then((res) => {
          const updatedValue = (newValue as (prevState: T) => T)(res[key]);
          browser.storage.local.set({ [key]: updatedValue });
        });
      } else {
        browser.storage.local.set({ [key]: newValue });
      }
    },
    [key],
  );

  useEffect(() => {
    browser.storage.local.get(key).then((res) => setValue(res[key]));

    browser.storage.local.onChanged.addListener(onChanged);

    return () => browser.storage.local.onChanged.removeListener(onChanged);
  }, [key, onChanged]);

  return [value, setValueLocal];
}

export function setStorage(key: Key, value: unknown): Promise<void> {
  return browser.storage.local.set({ [key]: value });
}

export function getStorage(
  key: "NowLive:Favorites",
): Promise<string[] | undefined>;
export function getStorage(key: "NowLive:Token"): Promise<string | undefined>;
export function getStorage(key: "NowLive:Theme"): Promise<Theme | undefined>;
export function getStorage(
  key: "NowLive:Channels",
): Promise<TwitchStream[] | undefined>;
export function getStorage(key: Key): Promise<unknown>;
export async function getStorage<T>(key: Key): Promise<T | undefined> {
  const res = await browser.storage.local.get(key);
  return res[key];
}

export async function setStorageIfNull(
  key: Key,
  value: unknown,
): Promise<void> {
  if ((await getStorage(key)) === undefined) {
    await setStorage(key, value);
  }
}

export const setStorageLocal = setStorage;
export const getStorageLocal = getStorage;
export const setStorageLocalIfNull = setStorageIfNull;

export async function getChannelInfo(): Promise<void> {
  const token = await getStorage("NowLive:Token");
  if (!token) {
    await browser.browserAction.setTitle({ title: "Please verify Now Live" });
    await browser.browserAction.setBadgeText({ text: "" });
    return;
  }
  try {
    const userId = await getStorage("NowLive:UserId");

    const { data }: { data: TwitchStream[] } = await (
      await fetch(
        `https://api.twitch.tv/helix/streams/followed?user_id=${userId}`,
        {
          headers: { "Client-Id": clientId, Authorization: `Bearer ${token}` },
        },
      )
    ).json();

    const users: { data: TwitchUser[] } = await fetch(
      `https://api.twitch.tv/helix/users?id=${data
        .map((stream) => stream.user_id)
        .join("&id=")}`,
      { headers: { "Client-Id": clientId, Authorization: `Bearer ${token}` } },
    ).then((res) => res.json());

    const withicons = data.map((stream) => {
      const withicon = {
        ...stream,
        profile_image_url:
          users.data.find((user: TwitchUser) => user.id === stream.user_id)
            ?.profile_image_url || "",
      };

      return withicon;
    });

    const fac = new FastAverageColor();

    // Downloads the images and converts them into a base64 url
    const withImages = await Promise.all(
      withicons.map(async (stream) => {
        const url = stream.profile_image_url;
        if (url.startsWith("https://static-cdn.jtvnw.net/")) {
          const response = await fetch(stream.profile_image_url);
          const bytes = await response.arrayBuffer();
          const base64 = encodeURIComponent(base64ArrayBuffer(bytes));
          const base64Url = `data:${response.headers.get(
            "content-type",
          )};base64,${base64}`;
          const col = await fac.getColorAsync(base64Url);

          const withImage: TwitchStream = {
            ...stream,
            profile_image_url: base64Url,
            average_color: {
              colourHex: col.hex,
              colorRgb: col.rgb,
              isLight: col.isLight,
            },
          };

          return withImage;
        }
        return stream;
      }),
    );

    const streamingNow = Number(data.length.toString());

    if (streamingNow !== 0) {
      await browser.browserAction.setTitle({
        title: `There are ${streamingNow} people streaming right now`,
      });
      await browser.browserAction.setBadgeText({
        text: streamingNow.toString(),
      });
    } else {
      await browser.browserAction.setTitle({
        title: "There is nobody streaming right now",
      });
      await browser.browserAction.setBadgeText({ text: "" });
    }

    await setStorageLocal("NowLive:Channels", withImages);
  } catch (err) {
    console.error(err);
  }
}
