import {
  getChannelInfo,
  setStorageIfNull,
  setStorageLocalIfNull,
} from "../lib/chromeapi";
import validateToken from "../lib/validateToken";

browser.alarms.create("NowLive:Refresh", {
  // delayInMinutes: 1,
  periodInMinutes: 1,
});

browser.runtime.onInstalled.addListener(async () => {
  await setStorageLocalIfNull("NowLive:Theme", "dark");
  await setStorageIfNull("NowLive:Favorites", []);
  await getChannelInfo();
  console.log("Initialized Now Live");
});

browser.runtime.onMessage.addListener((message, sender, res) => {
  if (!sender.url?.startsWith("https://nowlive.jewelexx.com/auth/callback")) {
    return false;
  }

  if (
    typeof message === "object" &&
    message.name === "NowLive:Token" &&
    typeof message.token === "string"
  ) {
    validateToken(message.token).then((valid) => {
      if (valid) {
        res([`Received valid token: ${message.token}`, true]);
        getChannelInfo();
      } else {
        res([`Received invalid token: ${message.token}`, false]);
      }
    });
  } else {
    res([`Received invalid message object: ${message}`, false]);
  }
  return true;
});

(async () => {
  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "NowLive:Refresh") {
      await getChannelInfo();
    }
  });
})();
