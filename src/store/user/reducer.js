import { UPDATE_SMS_BALANCE, GET_SMS_BALANCE } from './actionTypes';
import {getLoggedInUser} from '../../helpers/authUtils';

const initialState = {
    sms_balance: (getLoggedInUser() !== null)?getLoggedInUser().assignedCredits:'0',
}

const user = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_SMS_BALANCE:
            state = {
                ...state,
                sms_balance: action.payload
            }
            break;
        case GET_SMS_BALANCE:
            state = {
                ...state,
            }
            break;

        default:
            state = { ...state };
            break;
    }
    return state;
}

export default user;