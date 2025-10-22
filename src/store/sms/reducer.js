import { UPDATE_SMS_TYPE } from './actionTypes';

const initialState = {
    sms_type: 'Plain'
}

const sms = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_SMS_TYPE:
            state = {
                ...state,
                sms_type: action.payload
            }
            break;

        default:
            state = { ...state };
            break;
    }
    return state;
}

export default sms;