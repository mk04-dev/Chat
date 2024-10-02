import React from 'react';
import { isImage, mentionRegex, urlRegx, uuidRegx } from '../../../../utils/helper';
import { Typography, Image } from 'antd';
import { Attachment } from '../../../../utils/type';
import FileMessage from './FileMessage';

interface Props {
	content: string;
	attachment?: Attachment[];
}
function TextMessage(props: Props) {
	const { content, attachment } = props;
	const listSrc: string[] = [];

	const replacer = (matchString: string) => {
		const name = matchString.substring(matchString.indexOf('[') + 1, matchString.indexOf(']'));
		const mGuid = matchString.match(uuidRegx);
		let id = '';
		if (mGuid) id = mGuid[0];
		return `<a data-id="${id})" class="mention-member">${name}</a>`;
	};

	const urlReplacer = (matchString: string) => {
		if (isImage(matchString)) {
			console.log('HAHAHA', matchString);
			listSrc.push(matchString);
		}
		return `<a href="${matchString}" target="_blank">${matchString}</a>`;
	};

	const parseContent = () => {
		let str = content;
		str = str.replaceAll(
			'http://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72',
			'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64'
		);
		str = str.replace(urlRegx, urlReplacer);
		return str.replace(mentionRegex, replacer);
	};

	return (
		<Typography.Text
			className='text-primary'
			style={{
				whiteSpace: 'pre-wrap',
				direction: 'ltr',
				fontSize: 16,
			}}
		>
			<div dangerouslySetInnerHTML={{ __html: parseContent() }}></div>
			{attachment && (
				<Image.PreviewGroup>
					{attachment.map((file, idx) => (
						<FileMessage key={idx} content={file.name} fileSize={file.size} data={file.data} />
					))}
				</Image.PreviewGroup>
			)}
			{listSrc.length === 1 && <Image src={listSrc[0]} style={{ maxHeight: 200, padding: 2 }}></Image>}
		</Typography.Text>
	);
}

export default React.memo(TextMessage);
