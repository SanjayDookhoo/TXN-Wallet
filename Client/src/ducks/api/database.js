import axios from 'axios';

// const API = axios.create({ baseURL: 'http://localhost:5000' });
// const API = axios.create({ baseURL: 'http://192.168.0.10:5000' });
const API = axios.create({ baseURL: 'https://txn-wallet.herokuapp.com' });

API.interceptors.request.use((req) => {
	if (localStorage.getItem('profile')) {
		req.headers.Authorization = `Bearer ${
			JSON.parse(localStorage.getItem('profile')).token
		}`;
	}

	return req;
});

export const signIn = ({ req_body }) => API.post('/user/signIn', req_body);
export const signUp = ({ req_body }) => API.post('/user/signUp', req_body);

export const databaseGet = ({ table_name, req_params }) =>
	API.get(`/${table_name}`, { params: req_params });
export const databasePost = ({ table_name, req_body }) =>
	API.post(`/${table_name}`, req_body);
export const databasePatch = ({ table_name, req_body }) =>
	API.patch(`/${table_name}`, req_body);
export const databaseDelete = ({ table_name, req_body }) =>
	API.delete(`/${table_name}`, { data: req_body });
