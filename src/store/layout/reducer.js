import { ACTIVATE_AUTH_LAYOUT, ACTIVATE_NON_AUTH_LAYOUT, IS_LARGE, OPEN_SNACK, CLOSE_SNACK } from './actionTypes';

const initialState = {
    topbar: true,
    sidebar: true,
    footer: true,
    snack: false,
    snack_message: '',
    snack_type:'',
    
    is_large_state: false
}

const layout = (state = initialState, action) => {
    switch (action.type) {
        case ACTIVATE_AUTH_LAYOUT:
            state = {
                ...state,
                ...action.payload
            }
            break;
        case ACTIVATE_NON_AUTH_LAYOUT:
            state = {
                ...state,
                ...action.payload
            }
            break;
        case IS_LARGE:
            state = {
                ...state,
                is_large_state: action.payload
            }
            break;
        case OPEN_SNACK:
            state = {
                ...state,
                snack: true,
                snack_message: action.payload.message,
                snack_type: action.payload.type,
            }
            break;
        case CLOSE_SNACK:
            state = {
                ...state,
                snack: false,
                snack_message: '',
            }
            break;

        default:
            state = { ...state };
            break;
    }
    return state;
}

export default layout;