const client_id = '6ucdumdkn0j562bf9oog38efzmx4vh';
const token = (await getStorage('userToken')) || 'undefined';

const twitchtoken = () => {
	return new Promise((resolve) =>
		chrome.storage.sync.get(['twitchtoken'], (res) => {
			if (res.twitchtoken === undefined) {
				chrome.storage.sync.set({ twitchtoken: 'unset' });
				resolve('unset');
			} else {
				resolve(res.twitchtoken);
			}
		})
	);
};

chrome.runtime.onInstalled.addListener(async () => {
	console.log('Initialized chrome extension');
});

chrome.storage.onChanged.addListener(async () => getChannelInfo);

function getStorage(key) {
	return new Promise((resolve) => {
		chrome.storage.sync.get([key], (res) => {
			resolve(res[key]);
		});
	});
}

function setStorageLocal(key, value) {
	chrome.storage.local.set({ [key]: value }, () => {});
}

async function getChannelInfo() {
	console.log('Updating channel info');
	const userId = (
		await (
			await fetch(
				'https://api.twitch.tv/helix/users?login=' +
					(await getStorage('user')),
				{
					headers: {
						'Client-Id': client_id,
						Authorization: 'Bearer ' + (await twitchtoken()),
					},
				}
			)
		).json()
	).data[0].id;

	const resbJson = await (
		await fetch(
			'https://api.twitch.tv/helix/streams/followed?user_id=' + userId,
			{
				headers: {
					'Client-Id': client_id,
					Authorization: 'Bearer ' + (await twitchtoken()),
				},
			}
		)
	).json();

	chrome.browserAction.setBadgeText({
		text: resbJson.data.length.toString(),
	});
	chrome.browserAction.setTitle({ title: 'Number of people streaming: ' });

	setStorageLocal('channels', resbJson.data);

	console.log('Updated channel info');
}

function getChannelInfoInit() {
	getChannelInfo();
	return setInterval(async () => getChannelInfo(), 60000);
}

getChannelInfoInit();
