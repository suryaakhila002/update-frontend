import { UPDATE_SMS_BALANCE, GET_SMS_BALANCE } from './actionTypes';
import {updateLoggeedInUserSmsBalance} from '../../helpers/authUtils';

export const updateSmsBalance = (balance) => {
    updateLoggeedInUserSmsBalance(balance);

    return {
        type: UPDATE_SMS_BALANCE,
        payload: balance
    }
}

export const getSmsBalance = () => {
    return {
        type: GET_SMS_BALANCE,
    }
}


