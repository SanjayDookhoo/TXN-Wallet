import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import coin_fallback from '../../../../assets/coin_fallback.png';
import AddressGroup from './AddressGroup';
import { useSelector } from 'react-redux';

const BlockchainAddressGroup = ({
	database,
	chains,
	chains_map,
	chain,
	...other_params
}) => {
	const app = useSelector((state) => state.app);
	const [collapsed, updateCollapsed] = useState(false);

	const toggleCollapsible = () => {
		updateCollapsed(!collapsed);
	};

	const address_group_params = {
		database,
		chain,
		...other_params,
	};

	return (
		<div className="blockchain-address-group my-4 p-2 rounded-lg border-2 border-yellow-400 bg-gray-300">
			<div
				className="blockchain-address-group-header flex justify-between items-center h-12 group cursor-pointer"
				onClick={toggleCollapsible}
			>
				<div className="blockchain-icon">
					<img
						className="h-10"
						src={chains_map[chain.covalent_chain_id]?.logo_url}
						onError={(e) => {
							e.target.onerror = null;
							e.target.src = coin_fallback;
						}}
					/>
				</div>
				<div
					className={`blockchain-name cursor-pointer rounded-lg p-2 ${
						app.is_mobile_app ? '' : 'group-hover:text-lg'
					}`}
				>
					{collapsed ? (
						<FontAwesomeIcon icon={faPlus} />
					) : (
						<FontAwesomeIcon icon={faMinus} />
					)}
					<div className="inline pl-2">
						{chains_map[chain.covalent_chain_id]?.label}
					</div>
				</div>
				<div></div>
			</div>
			<div className={`${collapsed && 'hidden'}`}>
				{database.address &&
					Object.values(database.address)
						.filter((address) => address.chain_id === chain.id)
						.map((address) => (
							<AddressGroup
								key={address.id}
								address={address}
								{...address_group_params}
							/>
						))}
			</div>
		</div>
	);
};

export default BlockchainAddressGroup;
