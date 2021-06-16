import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Input from 'src/pages/Input';
import { signIn, signUp } from 'actions/auth';
import { useSnackbar } from 'notistack';

const initialState = {
	email: '',
	password: '',
	confirm_password: '',
};

const Auth = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	const { enqueueSnackbar } = useSnackbar();

	const [form_data, updateFormData] = useState(initialState);
	const [is_signup, updateIsSignup] = useState(false);
	const [show_password, updateShowPassword] = useState(false);
	const handleShowPassword = () => updateShowPassword(!show_password);

	const switchMode = () => {
		updateFormData(initialState);
		updateIsSignup((prevIsSignup) => !prevIsSignup);
		updateShowPassword(false);
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		console.log({ is_signup });

		if (is_signup) {
			if (form_data.password === form_data.confirm_password) {
				dispatch(
					signUp({
						req_body: form_data,
						onSuccess: () => history.push('/'),
						onFailure: () =>
							enqueueSnackbar('Email already in use', {
								variant: 'error',
							}),
					})
				);
			} else {
				enqueueSnackbar('Passwords do not match, try again', {
					variant: 'error',
				});
			}
		} else {
			dispatch(
				signIn({
					req_body: form_data,
					onSuccess: () => history.push('/'),
					onFailure: () =>
						enqueueSnackbar('Incorrect credentials', {
							variant: 'error',
						}),
				})
			);
		}
	};

	const handleChange = (e) =>
		updateFormData({ ...form_data, [e.target.name]: e.target.value });

	return (
		<div className="w-1/3 mx-auto card flex flex-col justify-center items-center">
			<div className="text-lg">{is_signup ? 'Sign up' : 'Sign in'}</div>
			<form onSubmit={handleSubmit}>
				<div className="flex-col justify-center items-center">
					<Input
						name="email"
						label="Email Address"
						value={form_data.email}
						handleChange={handleChange}
						type="email"
					/>
					<Input
						name="password"
						label="Password"
						value={form_data.password}
						handleChange={handleChange}
						type={show_password ? 'text' : 'password'}
						handleShowPassword={handleShowPassword}
					/>
					{is_signup && (
						<Input
							name="confirm_password"
							label="Repeat Password"
							value={form_data.confirm_password}
							handleChange={handleChange}
							type="password"
						/>
					)}
				</div>
				<div className="clear-both"></div>
				<div className="flex flex-col justify-center items-center">
					<button type="submit">
						{is_signup ? 'Sign Up' : 'Sign In'}
					</button>
					<button onClick={switchMode}>
						{is_signup
							? 'Already have an account? Sign in'
							: "Don't have an account? Sign Up"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default Auth;
