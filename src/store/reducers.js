import { combineReducers  } from 'redux';

// Front
import Layout from './layout/reducer';

//user
import User from './user/reducer';

//user
import Sms from './sms/reducer';

// Authentication Module
import Account from './auth/register/reducer';
import Login from './auth/login/reducer';
import Forget from './auth/forgetpwd/reducer';


const rootReducer = combineReducers({

    // public
    Layout,

    //user
    User,

    //sms
    Sms,

    // Authentication
    Account,
    Login,
    Forget

});

export default rootReducer;