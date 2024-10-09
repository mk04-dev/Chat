import { Col, Input, InputNumber, Modal, Row, Select, Space, Typography } from 'antd';
import { observer } from 'mobx-react';
import { useStores } from '../../../stores/stores';
import ReactCountryFlag from 'react-country-flag';
import { getMobileCode } from '../../../utils/helper';
import { COUNTRIES, Country } from '../../../utils/countries';
import { useEffect, useMemo, useState } from 'react';
import SearchList from './SearchList';
import { User } from '../../../utils/type';
import Member from '../../common/Member';
import { DELAY_INPUT } from '../../../utils/constants';

function AddFriendModal() {
	const { appStore } = useStores();
	const { toggleAddFriend, setToggleAddFiend, $$, searchUserByPhoneNumber } = appStore;
	const [country, setCountry] = useState<Country>('VN');
	const [searchText, setSearchText] = useState<string>('');
	const [listUsers, setListUsers] = useState<User[]>([]);
	const phoneCode = useMemo(() => getMobileCode(country), [country]);

	useEffect(() => {
		const timer = setTimeout(() => {
			let text = searchText;
			if (text) {
				if (text.startsWith('0')) {
					text = text.replace('0', phoneCode);
				} else {
					text = phoneCode + searchText;
				}
			}

			setListUsers(searchUserByPhoneNumber(text));
		}, DELAY_INPUT);

		return () => clearTimeout(timer);
	}, [searchText, phoneCode]);

	return (
		<Modal
			centered
			destroyOnClose
			open={toggleAddFriend}
			title={$$('add-friend')}
			width='35rem'
			styles={{ body: { height: '60vh' } }}
			footer={<></>}
			onCancel={setToggleAddFiend}
		>
			<div className='container'>
				<Row gutter={8}>
					<Col span={6}>
						<Select
							showSearch
							className='max-width styled-select'
							value={country}
							onChange={(e) => setCountry(e)}
							options={COUNTRIES.map((country) => ({
								key: country.code,
								title: country.phone,
								label: (
									<Typography.Text key={country.code}>
										<ReactCountryFlag
											svg
											countryCode={country.code}
											style={{
												fontSize: '1.2rem',
												lineHeight: '1.2rem',
												marginRight: '4px',
											}}
										/>
										{country.phone}
									</Typography.Text>
								),
								value: country.code,
							}))}
							filterOption={(inputValue, option) => option!.title.includes(inputValue.replace('+', ''))}
						/>
					</Col>
					<Col span={18}>
						<Input
							className='styled-input max-height'
							placeholder={$$('phone-number')}
							min={0}
							value={searchText}
							onChange={(e) => {
								const value = e.target.value.trim();
								if (!isNaN(Number(value))) setSearchText(value);
							}}
						/>
					</Col>
				</Row>
				<Space direction='vertical' className='grow-list' style={{ marginTop: 16 }} size={12}>
					{listUsers.map((user) => (
						<Member user={user} />
					))}
				</Space>
			</div>
		</Modal>
	);
}

export default observer(AddFriendModal);
