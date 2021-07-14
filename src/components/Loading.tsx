import React from 'react';
import styles from '@styles/loader.module.scss';

interface LoadingProps {
	color: string;
	hidden: boolean;
}

export default function Loading({ color, hidden }: LoadingProps) {
	console.log('Color', color);

	const docBody = document.querySelector('body') as HTMLBodyElement;

	color = docBody.style.color;

	const circles: string[] = new Array(8).fill('');

	return (
		<>
			<style>{`.lds_rollerDivs div:after {
				background: ${color};
			}`}</style>
			{hidden ? (
				<div>{null}</div>
			) : (
				<div
					className={styles.lds_roller + ' lds_rollerDivs'}
					id='loadingChannels'>
					{circles.map((_val, i) => (
						<div key={i} />
					))}
				</div>
			)}
		</>
	);
}
