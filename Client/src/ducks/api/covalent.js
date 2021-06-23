import axios from 'axios';

const URL = 'https://api.covalenthq.com';
const api_version = 'v1';
const baseURL = `${URL}/${api_version}`;

const key = 'ckey_fc041bc37f7446a98f389c378d2';

const covalentAPI = axios.create({ baseURL });

covalentAPI.interceptors.request.use((req) => {
	req.params.key = key;
	return req;
});

export default covalentAPI;
