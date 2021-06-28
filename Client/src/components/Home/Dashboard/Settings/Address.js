import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faTrash,
	faEdit,
	faPlus,
	faMinus,
} from '@fortawesome/free-solid-svg-icons';

const initialState = {
	name: '',
	address_hash: '',
};

const Address = ({
	address,
	handleAddressUpdate,
	handleAddressRemove,
	editing_id,
}) => {
	return (
		<tr
			className={`address h-12 ${
				editing_id === address.id && 'bg-green-700'
			}`}
		>
			<td className="px-1 border border-yellow-200">{address.name}</td>
			<td className="px-1 break-all border border-yellow-200">
				{address.address_hash}
			</td>
			<td className="px-1 border border-yellow-200">
				<div className="flex justify-around items-center">
					<div
						className="address-update cursor-pointer waves-effect rounded-lg p-2 hover:text-yellow-400"
						onClick={() => handleAddressUpdate(address.id)}
					>
						<FontAwesomeIcon icon={faEdit} />
					</div>
					<div
						className="address-delete cursor-pointer waves-effect rounded-lg p-2 hover:text-red-400"
						onClick={() => handleAddressRemove(address.id)}
					>
						<FontAwesomeIcon icon={faTrash} />
					</div>
				</div>
			</td>
		</tr>
	);
};

export default Address;
