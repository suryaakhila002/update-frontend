import { UPDATE_SMS_TYPE } from './actionTypes';

export const updateSmsType = (smsType) => {
    return {
        type: UPDATE_SMS_TYPE,
        payload: smsType
    }
}



