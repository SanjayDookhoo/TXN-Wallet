import { combineReducers } from 'redux';

import auth from './auth';
import database from './database';

export const reducers = combineReducers({ auth, database });
