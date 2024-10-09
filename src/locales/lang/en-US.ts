const en = {
	hi: 'Hi',
	search: 'Search',
	all: 'All',
	unread: 'Unread',
	'add-friend': 'Add friend',
	unfriend: 'Unfriend',
	'create-group-chat': 'Create group chat',
	// Chat room menu
	'pin-chatroom': 'Pin this conversation',
	label: 'Label',
	'label-customer': 'Customer',
	'label-family': 'Family',
	'label-work': 'Work',
	'label-friend': 'Friend',
	'label-rep': 'Reply later',
	'label-coworker': 'Co-worker',
	'manage-label': 'Manage label',
	'mark-chatroom': 'Mark as unread',
	'off-noti': 'Turn notify off',
	'hide-chatroom': 'Hide conversation',
	'delete-chatroom': 'Delete conversation',
	report: 'Report',
	//Chat header
	members: 'Members',
	'add-friends-to-group': 'Add friends to group',
	'search-message': 'Search message',
	'video-call': 'Video call',
	'room-info': 'Conservation Info',
	//Side bar
	'action-close-menu': 'Click to close menu',
	'action-expand-menu': 'Click to expand menu',
	setting: 'Setting',
	//Modal
	'create-group': 'Create group',
	'group-name-placeholder': 'Enter group name...',
	'search-place-holder': 'Enter name, phone number, or list of phone number here',
	'invalid-group-name': 'Please input group name',
	'invalid-group-members': 'Please select at least 2 members',
	//Message
	'create-success': 'Successfully created!',
	'create-failed': 'Create failed!',
	copied: 'Copied',
	copy: 'Copy',
	//Msg action
	reply: 'Reply',
	forwarding: 'Forwarding',
	more: 'More',
	'copy-text': 'Copy Text',
	'pin-msg': 'Pin message',
	'unpin-msg': 'Unpin message',
	'start-msg': 'Star this mesage',
	'select-msg': 'Select this message',
	'view-details': 'View Details',
	'other-options': 'Other options',
	'delete-for-me': 'Delete for me only',
	//#region Drawer
	//Members
	'copy-group': 'Copy group',
	//#endregion
	owner: 'Owner',
	admin: 'Admin',
	'list-member': 'List Member',
	'view-profile': 'View Profile',
	'appoint-admin': 'Appointed as admin',
	'remove-admin': 'Remove as admin',
	'block-member': 'Block member',
	'remove-from-group': 'Remove from group',
	'phone-number': 'Phone number',
	'add-by': 'Add by {{name}}',
	joined: 'Joined',
	you: 'You',
	customer: 'Customer',
	family: 'Family',
	work: 'Work',
	friend: 'Friend{{#plural}}s{{/plural}}',
	'reply-later': 'Reply later',
	'co-worker': 'Co-worker',
	image: 'Image{{#plural}}s{{/plural}}',
	yesterday: 'Yesterday',
	'recall-msg': 'Recall message',
	'recalled-msg': 'This message is recalled',
	'msg-notfound': 'Message not found',
	'ann-add': '{{user2}} is added by {{user1}}',
	'ann-remove': '{{user2}} is removed by {{user1}}',
	'ann-appointed': '{{user1}} have appointed {{user2}} as admin',
	'ann-remove-admin': '{{user1}} removed the admin role from {{user2}}',
	'ann-leave': '{{name}} leaved',
	leave: 'Leave',
	namecard: 'Namecard',
	'send-namecard': 'Send namecard',
	call: 'Call',
	message: 'Message',
	'copy-phone': 'Copy phone number',
	undo: 'Undo',
	'noti-del-msg': 'Deleted {{number}} message{{#plural}}s{{/plural}}',
	'mute-group': 'Mute',
	'unmute-group': 'Unmute',
	pin: 'Pin',
	unpin: 'Unpin',
	'manage-group': 'Manage group',
	sender: 'Sender',
	'last-n-days': 'Last {{number}} day{{#plural}}s{{/plural}}',
	'last-n-months': 'Last {{number}} month{{#plural}}s{{/plural}}',
	'this-month': 'This month',
	today: 'Today',
	'view-all': 'View all',
	'media-storage': 'Media storage',
	download: 'Download',
	forward: 'Forward',
	select: 'Select',
	selects: 'Select',
	deselect: 'Deselect',
	'jump-to-msg': 'Jump to message',
	'open-in-browser': 'Open in browser',
	'delete-only-me': 'Delete only me',
	cancel: 'Cancel',
	file: 'File{{#plural}}s{{/plural}}',
	link: 'Link{{#plural}}s{{/plural}}',
	share: 'Share',
	'group-chat': 'Group{{#plural}}s{{/plural}}',
	'disappearing-msg': 'Disappearing messages',
	'hide-conversation': 'Hide conversation',
	'delete-chat-history': 'Delete chat history'
};

export type ILocale = typeof en;
export { en };
