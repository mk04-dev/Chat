import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { useStores } from '../../stores/stores';
import RoomInfo from './room-info/RoomInfo';
import Members from './members/Members';
import RoomStorage from './room-storage/RoomStorage';
import RoomBoard from './board/RoomBoard';
import GroupManagement from './management/GroupManagement';

function ChatDrawer() {
	const {
		appStore: { drawerOpen, setDrawerOpen },
		chatStore: { Room },
	} = useStores();

	useEffect(() => {
		if (!drawerOpen) {
			document.documentElement.style.setProperty('--drawer-w', '0px');
		} else {
			document.documentElement.style.setProperty('--drawer-w', '24vw');
		}
	}, [drawerOpen]);

	useEffect(() => {
		!Room?.isGroup && drawerOpen && !['Info', 'Storage'].includes(drawerOpen) && setDrawerOpen('Info');
	}, [Room, drawerOpen, setDrawerOpen]);

	if (!Room) return <></>;

	return (
		<div className='drawer max-height'>
			{drawerOpen === 'Info' && <RoomInfo />}
			{drawerOpen === 'Members' && <Members />}
			{drawerOpen === 'Storage' && <RoomStorage />}
			{drawerOpen === 'Board' && <RoomBoard />}
			{drawerOpen === 'Management' && <GroupManagement />}
		</div>
	);
}

export default React.memo(observer(ChatDrawer));
