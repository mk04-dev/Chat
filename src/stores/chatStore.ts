import { makeAutoObservable } from 'mobx';
import {
	AnnouceType,
	Attachment,
	ChatRoom,
	Message,
	MessageLog,
	ModalDetailMsgProps,
	ReactLogPopProps,
	ReplyMessage,
	RoleType,
	RoomMember,
	ShareModalProps,
	ShareSelectItemProps,
	StorageFilter,
	StorageSelect,
	StorageType,
	TabItemType,
	User,
} from '../utils/type';
import { CHAT_ROOMS, MESSAGES } from '../utils/constants';
import { isEmpty, isImage, isUrl, matchSearchUser, newGuid, normalizeIncludes, toNormalize } from '../utils/helper';
import { stores } from './stores';
import { SYSTEM_NOW } from '../utils/dateHelper';
import { notify } from '../utils/notify';
import { openUndo } from '../utils/notification';

type DateMessage = {
	[key: string]: Message[][];
};

export default class ChatStore {
	tabItem: TabItemType = 'All';
	chatRooms: ChatRoom[] = CHAT_ROOMS;

	allMessage: Message[] = MESSAGES;

	messages: Message[] = [];
	activeRoom: string | undefined = undefined;

	openCreateGroup: boolean = false;

	selectedUsers: Map<string, User> = new Map();

	searchRoom: string = '';

	fetching: boolean = false;
	activePin: string | undefined = undefined;
	replyMessage: ReplyMessage | undefined = undefined;
	reactLogPopup: ReactLogPopProps = {
		visible: false,
		logs: [],
	};

	nextGIF: string = '';
	listGIF: {
		id: string;
		previewSrc: string;
		src: string;
	}[] = [];

	modalDetailMsg: ModalDetailMsgProps = {
		visible: false,
		message: undefined,
	};

	mdlNmCardVisible: boolean = false;

	selectMessages: Map<string, Message> = new Map();

	storageFilter: StorageFilter = {};

	storageTab: StorageType = 'Photo';

	storageSelect: StorageSelect = {
		selecting: false,
		selected: new Set(),
	};

	mdlShareProps: ShareModalProps = {
		open: false,
		items: [],
	};

	get Rooms() {
		if (!this.searchRoom) return this.chatRooms;
		return this.chatRooms.filter((e) => toNormalize(e.name).includes(toNormalize(this.searchRoom)));
	}

	get Room() {
		return this.getActiveRoom();
	}

	get RoomMessages() {
		if (!this.activeRoom || !this.messages || !this.messages.length) return [];
		const roomMessages = this.messages
			.filter((e) => !e.deleted)
			.sort((a, b) => Number(b.createDate) - Number(a.createDate));
		let dayMessages: DateMessage = {};
		let group: Message[][] = [];
		let messages: Message[] = [];
		for (let i = 0; i < roomMessages.length; i++) {
			if (i === 0) {
				messages.push(roomMessages[i]);
			} else if (roomMessages[i].createDate.substring(0, 8) !== roomMessages[i - 1].createDate.substring(0, 8)) {
				group.push(messages.reverse());
				dayMessages = { ...dayMessages, [roomMessages[i - 1].createDate.substring(0, 8)]: group };
				group = [];
				messages = [roomMessages[i]];
			} else if (!roomMessages[i].announce !== !roomMessages[i - 1].announce) {
				group.push(messages.reverse());
				messages = [roomMessages[i]];
			} else if (roomMessages[i].sender === roomMessages[i - 1].sender) {
				messages.push(roomMessages[i]);
			} else {
				group.push(messages.reverse());
				messages = [roomMessages[i]];
			}

			if (i === roomMessages.length - 1) {
				group.push(messages.reverse());
				dayMessages = { ...dayMessages, [roomMessages[i].createDate.substring(0, 8)]: group };
			}
		}
		return dayMessages;
	}

	get listIdPinned() {
		return this.Room?.pinMessages?.map((e) => e.id) ?? [];
	}

	get Selecting() {
		return this.selectMessages.size > 0;
	}

	get Role() {
		return this.getRole(stores.appStore.CurrentUserId);
	}

	get Images() {
		if (!this.activeRoom) return [];
		const { sender, startTime, endTime } = this.storageFilter;
		return this.allMessage
			.filter(
				(e) =>
					e.groupId === this.activeRoom &&
					!e.recalled &&
					!e.deleted &&
					(!sender || e.sender === sender) &&
					(!startTime || e.createDate >= startTime) &&
					(!endTime || e.createDate <= endTime) &&
					isImage(e.content)
			)
			.sort((a, b) => Number(b.createDate) - Number(a.createDate));
	}

	get Files() {
		if (!this.activeRoom) return [];
		const { sender, startTime, endTime, searchText } = this.storageFilter;
		const messages = this.allMessage
			.filter(
				(e) =>
					e.groupId === this.activeRoom &&
					!e.recalled &&
					!e.deleted &&
					e.isFile &&
					!isImage(e.content) &&
					(!sender || e.sender === sender) &&
					(!startTime || e.createDate >= startTime) &&
					(!endTime || e.createDate <= endTime) &&
					(!searchText || toNormalize(e.content).includes(toNormalize(searchText)))
			)
			.sort((a, b) => Number(b.createDate) - Number(a.createDate));
		return messages;
	}

	get Links() {
		if (!this.activeRoom) return [];
		const { startTime, endTime, searchText } = this.storageFilter;
		const messages = this.allMessage
			.filter(
				(e) =>
					e.groupId === this.activeRoom &&
					!e.recalled &&
					!e.deleted &&
					!e.isFile &&
					isUrl(e.content) &&
					(!startTime || e.createDate >= startTime) &&
					(!endTime || e.createDate <= endTime) &&
					(!searchText || toNormalize(e.content).includes(toNormalize(searchText)))
			)
			.sort((a, b) => Number(b.createDate) - Number(a.createDate));
		return messages;
	}

	constructor() {
		makeAutoObservable(this);
	}
	//#region GET
	getActiveRoom = (room?: string) => this.chatRooms.find((e) => e.id === (room ?? this.activeRoom));

	getRoom = (room: string) => this.chatRooms.find((e) => e.id === room);

	getMessage = (id: string) => this.messages.find((e) => e.id === id);

	getRole = (userId: string): RoleType => {
		const room = this.Room;
		if (!room || !room.isGroup) return 'Member';
		if (userId === room.creatorId) return 'Owner';
		const { members } = room;
		const currentUser = members.find((e) => e.id === userId);
		return currentUser?.role || 'Member';
	};
	//#endregion GET

	//#region SET
	lockFetch = () => (this.fetching = true);
	unlockFetch = () => (this.fetching = false);
	setSearchRoom = (value: string) => (this.searchRoom = value);
	setSelectedUsers = (state: Map<string, User>) => {
		this.selectedUsers = state;
	};
	clearSelectedUsers = () => (this.selectedUsers = new Map());
	toggleCreateGroup = () => {
		this.openCreateGroup = !this.openCreateGroup;
		!this.openCreateGroup && this.clearSelectedUsers();
	};
	setTabItem = (tab: TabItemType) => (this.tabItem = tab);
	setActiveRoom = (room: string) => {
		if (this.activeRoom === room) return;
		this.activeRoom = room;
		this.onGetMessage(room);
	};
	setActivePin = (id: string | undefined) => (this.activePin = id);

	setReplyMessage = (msg: ReplyMessage | undefined) => (this.replyMessage = msg);

	setModalDetail = (state: ModalDetailMsgProps) => (this.modalDetailMsg = state);

	clearListSelectedMsg = () => this.selectMessages.clear();

	onSelectMessage = (message: Message) =>
		this.selectMessages.has(message.id)
			? this.selectMessages.delete(message.id)
			: this.selectMessages.set(message.id, message);

	toggleMdlNmCard = () => {
		this.mdlNmCardVisible = !this.mdlNmCardVisible;
		this.clearSelectedUsers();
	};

	setStorageFilter = (state: any) => Object.assign(this.storageFilter, state);

	setStorageSelect = (state: any) => Object.assign(this.storageSelect, state);

	setStorageTab = (tab: StorageType) => (this.storageTab = tab);

	clearStorageSelect = () =>
		(this.storageSelect = {
			selecting: false,
			selected: new Set(),
		});

	onStorageItemSelect = (id: string) => {
		const { selected } = this.storageSelect;
		if (selected.has(id)) {
			selected.delete(id);
			!selected.size && this.clearStorageSelect();
		} else {
			selected.add(id);
		}
	};

	toggleShareModal = (items?: Message[]) => {
		this.mdlShareProps = {
			open: !this.mdlShareProps.open,
			items: items ?? [],
		};
	};

	resetGIF = () => {
		this.nextGIF = '';
		this.listGIF = [];
	};

	setRoomName = (id: string, name: string) => {
		const room = this.getRoom(id);
		room!.name = name;
		console.log('hahaha');
	};
	//#endregion SET

	//#region FUNCTION
	onCopyGroup = () => {
		if (!this.Room) return;
		this.Room.members.forEach((user) => {
			this.selectedUsers.set(user.id, user);
		});
		this.openCreateGroup = true;
	};
	toggleReactLog = (logs?: MessageLog[]) => {
		this.reactLogPopup = {
			visible: logs ? true : false,
			logs: logs ?? [],
		};
	};

	pushMessage = (message: Message) => {
		this.allMessage.push(message);

		if (message.groupId === this.activeRoom) {
			this.messages.push(message);
		}

		let room = this.getRoom(message.groupId);
		if (room) {
			room.previewMsg = message;
		} else {
			//Create room
			this.openPersonalRoom(message.groupId);
			room = this.getRoom(message.groupId);
			room!.previewMsg = message;
		}
		if (message.reply) this.replyMessage = undefined;
		document.querySelector('.chat-body-view')?.scrollTo({ top: 0 });
	};

	openPersonalRoom = (userId: string, active?: boolean) => {
		if (!this.chatRooms.find((e) => e.id === userId)) {
			this.chatRooms.push({
				id: userId,
				name: stores.appStore.getUserName(userId),
				isGroup: false,
				members: [],
			});
		}
		active && this.setActiveRoom(userId);
	};
	//#endregion FUNCTION

	//#region FAKE BACKEND
	fakeFetchMessage = async (roomId: string, skip: number) => {
		return this.allMessage
			.filter((e) => e.groupId === roomId)
			.sort((a, b) => b.createDate.localeCompare(a.createDate))
			.splice(skip, 20);
	};
	fakeFetchPinMessage = async (id: string, roomId: string, skip: number) => {
		const listMsg = MESSAGES.filter((e) => e.groupId === roomId).sort((a, b) =>
			b.createDate.localeCompare(a.createDate)
		);
		const idx = listMsg.findIndex((e) => e.id === id);
		return listMsg.splice(skip, Math.min(idx + 20 - skip, listMsg.length));
	};

	createAnnouncement = (type: AnnouceType, toUser: string, roomId?: string) => {
		//this feature should be in backend
		const room = roomId ?? this.activeRoom;
		if (!room) return;
		const announce: Message = {
			id: newGuid(),
			groupId: room,
			sender: stores.appStore.CurrentUserId,
			content: '',
			createDate: SYSTEM_NOW(),
			lastUpdateDate: SYSTEM_NOW(),
			recalled: false,
			deleted: false,
			logs: [],
			announce: {
				userId: toUser,
				type,
			},
		};
		this.pushMessage(announce);
	};
	//#endregion FAKE BACKEND

	//#region API
	onSearchGIF = async (searchTxt: string, next?: string) => {
		const searchParams = new URLSearchParams({
			q: searchTxt,
			key: 'LIVDSRZULELA',
			limit: '50',
		});

		if (next) searchParams.append('pos', next);

		const url = `https://g.tenor.com/v1/search?${searchParams.toString()}`;
		try {
			const res = await fetch(url, { headers: { method: 'GET' } }).then((res) => res.json());

			this.nextGIF = res.next;
			const parsed = res.results?.map((e: any) => ({
				id: e.id,
				previewSrc: e.media[0].nanogif.url,
				src: e.media[0].tinygif.url,
			}));
			if (next) {
				this.listGIF.push(...parsed);
			} else {
				this.listGIF = parsed;
			}
		} catch (err) {
			console.debug(err);
		}
	};

	onGetMessage = async (roomId?: string) => {
		const room = roomId ?? this.activeRoom;
		if (this.fetching || !room || this.activePin) return;
		this.lockFetch();
		const skip = roomId ? 0 : this.messages.length;
		let result: Message[] = [];
		try {
			result = await this.fakeFetchMessage(room, skip);
			if (roomId) {
				this.messages = result;
			} else {
				this.messages.push(...result);
			}
		} catch (err) {
			console.log(err);
			result = [];
		} finally {
			this.unlockFetch();
			return result;
		}
	};
	onSendMessage = (content: string, isFile?: boolean, files?: any[]) => {
		const activeRoom = this.activeRoom;
		if (!activeRoom || (isEmpty(content) && (!files || !files.length))) return;
		const message: Message = {
			id: newGuid(),
			groupId: activeRoom,
			sender: stores.appStore.CurrentUserId,
			content,
			isFile: !!isFile,
			createDate: SYSTEM_NOW(),
			lastUpdateDate: SYSTEM_NOW(),
			recalled: false,
			deleted: false,
			logs: [],
			reply: this.replyMessage,
			attachment: files,
		};
		this.pushMessage(message);
	};

	onSendFile = (file: Attachment, error?: boolean) => {
		const activeRoom = this.activeRoom;
		if (!activeRoom || isEmpty(file.data)) return;
		const message: Message = {
			id: newGuid(),
			groupId: activeRoom,
			sender: stores.appStore.CurrentUserId,
			content: file.name,
			isFile: true,
			data: file.data,
			fileSize: file.size,
			createDate: SYSTEM_NOW(),
			lastUpdateDate: SYSTEM_NOW(),
			recalled: false,
			deleted: false,
			logs: [],
			reply: undefined,
			error,
		};

		this.pushMessage(message);
	};

	onSendNameCard = () => {
		const activeRoom = this.activeRoom;
		if (!activeRoom || !this.selectedUsers.size) {
			this.toggleMdlNmCard();
			return;
		}
		Array.from(this.selectedUsers.keys()).forEach((id) => {
			const message: Message = {
				id: newGuid(),
				groupId: activeRoom,
				sender: stores.appStore.CurrentUserId,
				content: id,
				createDate: SYSTEM_NOW(),
				lastUpdateDate: SYSTEM_NOW(),
				recalled: false,
				deleted: false,
				logs: [],
				isNameCard: true,
			};
			this.pushMessage(message);
		});
		this.toggleMdlNmCard();
	};

	onCreateGroup = (group: ChatRoom) => {
		const { $$, user, CurrentUserId } = stores.appStore;
		try {
			if (!group.name) {
				notify($$('invalid-group-name'), 'warning');
				return;
			} else if (this.selectedUsers.size < 2) {
				notify($$('invalid-group-members'), 'warning');
				return;
			}
			group.members = [
				{ ...user, invitedBy: CurrentUserId, role: 'Owner' },
				...Array.from(this.selectedUsers.values()).map((e): RoomMember => ({
					...e,
					invitedBy: CurrentUserId,
					role: 'Member',
				})),
			];
			// Call API
			//then

			this.chatRooms = [...this.chatRooms, group];
			this.toggleCreateGroup();
			notify($$('create-success'), 'success');
		} catch {
			notify($$('create-failed'), 'error');
		}
	};

	onPinMessage = (message: Message) => {
		const room = this.getActiveRoom();
		if (!room) return;
		if (room.pinMessages?.find((e) => e.id === message.id)) {
			//Unpin
			room.pinMessages = room.pinMessages.filter((e) => e.id !== message.id);
		} else {
			//Pin
			room.pinMessages = [...(room.pinMessages ?? []), message];
		}
	};

	onChangeLabel = (roomId: string, label: string) => {
		const room = this.getActiveRoom(roomId);
		room!.label = label;
	};

	handleReaction = (id: string, reaction: string) => {
		const userId = stores.appStore.CurrentUserId;
		const log: MessageLog = {
			userId,
			reactionDate: SYSTEM_NOW(),
			reaction,
		};
		let message = this.messages.find((e) => e.id === id);
		if (message) {
			let oldLog = message.logs.find((e) => e.userId === userId);
			if (oldLog) {
				if (oldLog.reaction === log.reaction) {
					//Remove
					message.logs = message.logs.filter((e) => e.userId !== userId);
				} else {
					//Update
					message.logs = message.logs.map((e) => (e.userId === userId ? log : e));
				}
			} else {
				// Add
				message.logs = [...message.logs, log];
			}
		}
	};

	onDeleteMessages = (ids: string[]) => {
		ids.forEach((id) => {
			const message = this.getMessage(id);
			message!.deleted = true;
		});
		openUndo({
			count: ids.length,
			callback: () => {
				ids.forEach((id) => {
					const message = this.getMessage(id);
					message!.deleted = false;
				});
			},
		});
	};

	onRecallMessage = (id: string) => (this.getMessage(id)!.recalled = true);

	scrollToMessage = async (id: string) => {
		this.setActivePin(id);
		if (!this.activeRoom || this.messages.some((e) => e.id === id)) return;
		this.lockFetch();
		try {
			const res = await this.fakeFetchPinMessage(id, this.activeRoom, this.messages.length);
			this.messages.push(...res);
		} catch (err) {
			console.log(err);
		} finally {
			this.unlockFetch();
		}
	};

	searchGroupAndUser = (text: string): ShareSelectItemProps[] => {
		const friends = stores.appStore.Friends;
		const rooms = this.chatRooms;

		const arr = [
			...friends
				.filter((e) => !text || matchSearchUser(text, e))
				.map((e) => ({
					id: e.id,
					name: e.userName,
					image: e.imageSrc,
				})),
			...rooms
				.filter((e) => !text || normalizeIncludes(e.name, text))
				.map((e) => ({
					id: e.id,
					name: e.name,
					isGroup: e.isGroup,
					members: e.members,
					image: e.image,
				})),
		];
		return [...new Map(arr.map((e) => [e.id, e])).values()];
	};

	searchGroup = (text: string): ShareSelectItemProps[] => {
		const rooms = this.chatRooms;
		return rooms
			.filter((e) => e.isGroup && (!text || normalizeIncludes(e.name, text)))
			.map((e) => ({
				id: e.id,
				name: e.name,
				isGroup: e.isGroup,
				members: e.members,
				image: e.image,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	};

	searchUser = (text: string, label?: string) => {
		const Friends = stores.appStore.Friends;
		const ignoreLabel = !label || label === 'all';

		if (ignoreLabel && !text) return Friends;
		return Friends.filter((e) => (ignoreLabel || e.label === label) && matchSearchUser(text, e));
	};

	forwardMessage = (rooms: string[]) => {
		rooms.forEach((roomId) => {
			this.mdlShareProps.items.forEach((e) => {
				this.pushMessage({
					...e,
					id: newGuid(),
					groupId: roomId,
					sender: stores.appStore.CurrentUserId,
					createDate: SYSTEM_NOW(),
					lastUpdateDate: SYSTEM_NOW(),
					logs: [],
				});
			});
		});
	};

	onCall = () => {
		notify('Incomming');
	};

	onDeleteChatHistory = () => {
		if (!this.activeRoom) return;
		this.messages = this.messages.map((e) => (e.groupId === this.activeRoom ? { ...e, deleted: true } : e));
		const room = this.getActiveRoom();
		room!.previewMsg = undefined;
	};

	//#region GROUP
	onPinConversation = (id: string) => {
		const room = this.getRoom(id);
		room!.pinned = !room!.pinned;
	};

	//#endregion GROUP
	//#region Group Member API
	onLeaveGroup = () => {
		// 1. Add an announce message
		// 2. Leave group
		// 3. Appoint a group leader if current user is a leader
		const room = this.Room;
		if (!room) return;
		this.chatRooms = this.chatRooms.filter((e) => e.id !== room.id);
		this.setActiveRoom('');
	};

	addFriendToGroup = () => {
		const room = this.getActiveRoom();
		if (!room) return;
		room.members = [
			...room.members,
			...Array.from(this.selectedUsers.values()).map(
				(e): RoomMember => ({ ...e, invitedBy: stores.appStore.CurrentUserId, role: 'Member' })
			),
		];
		Array.from(this.selectedUsers.keys()).forEach((id) => this.createAnnouncement('Add', id));
	};

	addFriendToGroups = (memberId: string, groupIds: string[]) => {
		const user = stores.appStore.getUserById(memberId);
		if (!user) return;

		groupIds.forEach((groupId) => {
			const room = this.getRoom(groupId);
			if (room) {
				room.members = [...room.members, { ...user, role: 'Member', invitedBy: stores.appStore.CurrentUserId }];
				this.createAnnouncement('Add', memberId, groupId);
			}
		});
		this.chatRooms = [...this.chatRooms];
	};

	onRemoveMember = (userId: string, roomId?: string) => {
		const room = this.getActiveRoom(roomId);
		if (!room) return;
		room.members = room.members.filter((e) => e.id !== userId);
		this.createAnnouncement('Remove', userId, roomId);
	};

	appointAdmin = (userId: string) => {
		this.createAnnouncement('AppointAdmin', userId);
		const room = this.getActiveRoom();
		if (!room) return;
		room.members.find((e) => e.id === userId)!.role = 'Admin';
	};

	removeAdmin = (userId: string) => {
		this.createAnnouncement('RemoveAdmin', userId);
		const room = this.getActiveRoom();
		if (!room) return;
		room.members.find((e) => e.id === userId)!.role = 'Member';
	};
	//#endregion Group Member API

	//#endregion API
}
