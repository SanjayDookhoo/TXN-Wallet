import React from 'react';
import { TextField, Grid, InputAdornment, IconButton } from '@material-ui/core';

import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

const Input = ({
	name,
	handleChange,
	label,
	half,
	autoFocus,
	type,
	handleShowPassword,
	value,
	required,
	...other_params
}) => (
	<Grid item xs={12} sm={half ? 6 : 12}>
		<div className="py-4">
			<TextField
				name={name}
				onChange={handleChange}
				variant="outlined"
				required={required}
				fullWidth
				label={label}
				autoFocus={autoFocus}
				type={type}
				value={value}
				InputProps={
					name === 'password'
						? {
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											onClick={handleShowPassword}
										>
											{type === 'password' ? (
												<Visibility />
											) : (
												<VisibilityOff />
											)}
										</IconButton>
									</InputAdornment>
								),
						  }
						: null
				}
				{...other_params}
			/>
		</div>
	</Grid>
);

export default Input;
