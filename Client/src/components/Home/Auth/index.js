import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Input from '../../Input';
import Button from '../../Button';
import { signIn, signUp } from '../../../ducks/actions/auth';
import logo from '../../../assets/logo.svg';
import logo_mobile from '../../../assets/logo_mobile.svg';

const initialState = {
	user_name: '',
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

	const switchMode = (e) => {
		e.preventDefault();

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
						onFailure: (err) => {
							const message = err?.response?.data?.message;
							if (message) {
								enqueueSnackbar(message, {
									variant: 'error',
								});
							} else {
								enqueueSnackbar('Something went wrong', {
									variant: 'error',
								});
							}
						},
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
					onFailure: (err) => {
						const message = err?.response?.data?.message;
						if (message) {
							enqueueSnackbar(message, {
								variant: 'error',
							});
						} else {
							enqueueSnackbar('Something went wrong', {
								variant: 'error',
							});
						}
					},
				})
			);
		}
	};

	const handleChange = (e) =>
		updateFormData({ ...form_data, [e.target.name]: e.target.value });

	return (
		<div className="window-container h-screen flex flex-col justify-center items-center bg-gray-200">
			<div className="auth-component flex flex-col md:flex-row justify-center items-center rounded-lg overflow-hidden shadow-2xl">
				<div className="logo w-96 h-16 md:h-full border-gray-600 border-b-2 md:border-b-0 md:border-r-2 flex justify-center items-center bg-yellow-500">
					{/* <img className="h-full" src={logo} /> */}
					<img className="hidden md:block" src={logo} />
					<img className="md:hidden h-full" src={logo_mobile} />
				</div>
				<div className="form w-96 h-full border-gray-600 border-t-2 md:border-t-0 md:border-l-2 p-4">
					<form onSubmit={handleSubmit}>
						<div className="text-lg font-bold">
							{is_signup ? 'Sign up' : 'Sign in'}
						</div>
						<div className="flex-col justify-center items-center">
							{is_signup && (
								<Input
									name="email"
									label="Email Address"
									value={form_data.email}
									handleChange={handleChange}
									type="email"
									required={true}
								/>
							)}
							<Input
								name="user_name"
								label="User Name"
								value={form_data.user_name}
								handleChange={handleChange}
								type="text"
								required={true}
							/>
							<Input
								name="password"
								label="Password"
								value={form_data.password}
								handleChange={handleChange}
								type={show_password ? 'text' : 'password'}
								handleShowPassword={handleShowPassword}
								required={true}
							/>
							{is_signup && (
								<Input
									name="confirm_password"
									label="Repeat Password"
									value={form_data.confirm_password}
									handleChange={handleChange}
									type="password"
									required={true}
								/>
							)}
						</div>
						<div className="clear-both"></div>
						<div className="flex flex-col justify-center items-center">
							<Button variant="secondary" type="submit">
								{is_signup ? 'Sign Up' : 'Sign In'}
							</Button>
							<Button variant="light" onClick={switchMode}>
								{is_signup
									? 'Already have an account? Sign in'
									: "Don't have an account? Sign Up"}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Auth;
