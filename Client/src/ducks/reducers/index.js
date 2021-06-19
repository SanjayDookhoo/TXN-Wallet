import { combineReducers } from 'redux';

import auth from './auth';
import app from './app';
import database from './database';

export const reducers = combineReducers({ auth, app, database });
