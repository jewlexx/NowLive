import { setStorage } from '@lib/chromeapi';

export default async function validateToken(token: string): Promise<boolean> {
	const res = await (
		await fetch('https://id.twitch.tv/oauth2/validate', {
			headers: {
				Authorization: `OAuth ${token}`,
			},
		})
	).json();

	if (res.scopes.includes('user:read:follows') && res.expires_in > 500) {
		setStorage('NowLive:Storage:Token', token);
		return true;
	} else {
		return false;
	}
}
