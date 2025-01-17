import { Dropdown, Flex, Row, Typography } from 'antd';
import { observer } from 'mobx-react';
import { useStores } from '../../../stores/stores';
import {
	SearchOutlined,
	TagFilled,
	UnorderedListOutlined,
	UsergroupAddOutlined,
	UserOutlined,
	VideoCameraOutlined,
} from '@ant-design/icons';
import { LabelMenu } from '../../common/LabelMenu';
import GroupAvatar from '../../common/GroupAvatar';
import UserAvatar from '../../common/UserAvatar';
import { GROUP_AVT_SIZE } from '../../../utils/constants';

function ChatHeader() {
	const {
		chatStore,
		appStore: { $$, drawerOpen, setDrawerOpen, setToggleAddFriendToGroup, getLabel },
	} = useStores();
	const { Room } = chatStore;
	if (!Room) return <></>;
	const { id, name, isGroup, members, image, label, personalId } = Room;

	return (
		<Row className='header chat-header' align='middle'>
			{isGroup ? <GroupAvatar image={image} members={members} /> : <UserAvatar id={personalId ?? ''} size={GROUP_AVT_SIZE} />}
			<Row className='flex-grow' wrap={false}>
				<Row style={{ overflow: 'hidden' }}>
					<Row wrap={false}>
						<Typography.Text ellipsis strong>
							{name}
						</Typography.Text>
					</Row>
					<Flex gap={4}>
						{isGroup && (
							<Flex gap='inherit' className='hover-change-color' onClick={() => setDrawerOpen('Members')}>
								<UserOutlined className='text-secondary text-small'/>
								<Typography.Text ellipsis className='text-small text-secondary'>
									{`${Room.members.length} ${$$('members')}`}
								</Typography.Text>
							</Flex>
						)}
						<Dropdown trigger={['click']} menu={{ items: LabelMenu(id) }} destroyPopupOnHide>
							<TagFilled
								rotate={45}
								className='hover-change-color text-medium'
								style={{ color: getLabel(label)?.color ?? 'var(--text-secondary)' }}
							/>
						</Dropdown>
					</Flex>
				</Row>
				<div
					style={{
						display: 'flex',
						columnGap: '4px',
					}}
				>
					<UsergroupAddOutlined
						className='hoverable-icon'
						title={$$('add-friends-to-group')}
						onClick={setToggleAddFriendToGroup}
					/>
					<SearchOutlined
						className='hoverable-icon'
						title={$$('search-message')}
						onClick={() => console.log('djasdklasjkl')}
					/>
					<VideoCameraOutlined
						className='hoverable-icon'
						title={$$('video-call')}
						onClick={() => console.log('djasdklasjkl')}
					/>
					<UnorderedListOutlined
						className='hoverable-icon'
						title={$$('room-info')}
						style={{ color: drawerOpen && 'var(--primary-color)' }}
						onClick={() => setDrawerOpen(drawerOpen ? undefined : 'Info')}
					/>
				</div>
			</Row>
		</Row>
	);
}

export default observer(ChatHeader);
