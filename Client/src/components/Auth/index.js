import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Input from 'src/components/Input';

import { signIn, signUp } from 'actions/auth';

const initialState = {
	email: '',
	password: '',
	confirm_password: '',
};

const Auth = () => {
	const [form, updateForm] = useState(initialState);
	const [is_signup, updateIsSignup] = useState(false);
	const dispatch = useDispatch();
	const history = useHistory();

	const [show_password, updateShowPassword] = useState(false);
	const handleShowPassword = () => updateShowPassword(!show_password);

	const switchMode = () => {
		updateForm(initialState);
		updateIsSignup((prevIsSignup) => !prevIsSignup);
		updateShowPassword(false);
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		console.log({ is_signup });

		if (is_signup) {
			dispatch(signUp(form, history));
		} else {
			dispatch(signIn(form, history));
		}
	};

	const handleChange = (e) =>
		updateForm({ ...form, [e.target.name]: e.target.value });

	return (
		<div className="w-1/3 mx-auto card flex flex-col justify-center items-center">
			<div className="text-lg">{is_signup ? 'Sign up' : 'Sign in'}</div>
			<form onSubmit={handleSubmit}>
				<div className="flex-col justify-center items-center">
					<Input
						name="email"
						label="Email Address"
						value={form.email}
						handleChange={handleChange}
						type="email"
					/>
					<Input
						name="password"
						label="Password"
						value={form.password}
						handleChange={handleChange}
						type={show_password ? 'text' : 'password'}
						handleShowPassword={handleShowPassword}
					/>
					{is_signup && (
						<Input
							name="confirm_password"
							label="Repeat Password"
							value={form.confirm_password}
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
