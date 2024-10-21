import { Collapse, CollapseProps, Flex, Row, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import GroupAvatar from '../../common/GroupAvatar';
import UserAvatar from '../../common/UserAvatar';
import { CaretRightOutlined, DeleteOutlined, EyeInvisibleOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons';
import ActionBar from './ActionBar';
import { GROUP_AVT_SIZE } from '../../../utils/constants';
import { useStores } from '../../../stores/stores';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { notify } from '../../../utils/notify';
import PreviewPhotoStorage from '../room-storage/preview/PreviewPhotoStorage';
import PreviewFileStorage from '../room-storage/preview/PreviewFileStorage';
import PreviewLinkStorage from '../room-storage/preview/PreviewLinkStorage';
import { observer } from 'mobx-react';
import Confirm from '../../common/Confirm';
import Personal from './collapse-items/Personal';

const panelStyle: React.CSSProperties = {
	marginTop: 4,
	background: 'var(--background-color)',
	borderRadius: 'none',
	border: 'none',
	borderTop: '4px solid var(--border-color)',
};

function RoomInfo() {
	const {
		appStore: { $$, setDrawerOpen },
		chatStore: { Room, onLeaveGroup, onDeleteChatHistory, addFriendToGroup },
	} = useStores();
	
	const { id, name, isGroup, members, image, pinned } = Room!;

	const [activeKey, setActiveKey] = useState<string[]>([])

	const personalItems: CollapseProps['items'] = [
		{
			key: 'personal',
			label: 'Peronal',
			children: <Personal/>,
			style: panelStyle,
		},
		
	]

	const groupItems: CollapseProps['items'] = [
		{
			key: 'members',
			label: $$('group-member'),
			children: (
				<div className='div-button' onClick={() => setDrawerOpen('Members')}>
					<FontAwesomeIcon icon={faUserGroup} /> {members.length} {$$('members')}
				</div>
			),
			style: panelStyle,
		},
		{
			key: 'board',
			label: 'Group board',
			children: (
				<Flex vertical gap='small'>
					<div className='div-button' onClick={() => notify('Incomming')}>
						<FontAwesomeIcon icon={faClock} /> Reminer board
					</div>
					<div className='div-button' onClick={() => setDrawerOpen('Board')}>
						<FileTextOutlined /> Note, pin, poll
					</div>
				</Flex>
			),
			style: panelStyle,
		},
	]

	const items: CollapseProps['items'] = useMemo(()=> [
		...isGroup ? groupItems : personalItems,
		{
			key: 'photos',
			label: 'Photos/Videos',
			children: <PreviewPhotoStorage />,
			style: panelStyle,
		},
		{
			key: 'files',
			label: 'Files',
			children: <PreviewFileStorage />,
			style: panelStyle,
		},
		{
			key: 'links',
			label: 'Links',
			children: <PreviewLinkStorage />,
			style: panelStyle,
		},
		{
			key: 'privacy',
			label: $$('privacy-setting'),
			children: (
				<Flex vertical gap='mall'>
					<div className='div-button' onClick={() => notify('Incomming')}>
						<EyeInvisibleOutlined /> {$$('disappearing-msg')}
					</div>
					<Confirm danger title={$$('delete-chat-history')} okText={$$('delete')} onOk={() => onDeleteChatHistory()}>
						<div className='div-button danger'>
							<DeleteOutlined /> {$$('delete-chat-history')}
						</div>
					</Confirm>

					<Confirm
						danger
						title='Leave group'
						body='Leave and delete this conversation?'
						okText={$$('leave')}
						onOk={() => onLeaveGroup()}
					>
						<div className='div-button danger'>
							<LogoutOutlined  /> {$$('leave')}
						</div>
					</Confirm>
				</Flex>
			),
			style: panelStyle,
		},
	], [isGroup]);

	useEffect(() => {
		setActiveKey(items.map(e=> e.key as string))
	}, [items])

	return (
		<>
			<Row className='header' justify='center' align='middle'>
				<Typography.Text strong ellipsis>
					{$$('room-info')}
				</Typography.Text>
			</Row>
			<div className='body' style={{ overflow: 'auto' }}>
				<Flex vertical justify='center' align='center' className='drawer-group group-info-sticky'>
					{isGroup ? (
						<GroupAvatar image={image} members={members} />
					) : (
						<UserAvatar id={id} size={GROUP_AVT_SIZE} />
					)}
					<Flex style={{ width: '80%' }} justify='center'>
						<Typography.Text strong ellipsis>
							{name}
						</Typography.Text>
						{/* <EditOutlined /> */}
					</Flex>
					<ActionBar id={id} isGroup={isGroup} pinned={pinned}/>
				</Flex>
				<Collapse
					items={items}
					bordered={false}
					expandIconPosition='end'
					activeKey={activeKey}
					onChange={(keys)=> setActiveKey(keys)}
					expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
				></Collapse>
			</div>
		</>
	);
}

export default React.memo(observer(RoomInfo));
