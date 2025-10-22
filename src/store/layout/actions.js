import { ACTIVATE_AUTH_LAYOUT, ACTIVATE_NON_AUTH_LAYOUT, IS_LARGE, CLOSE_SNACK, OPEN_SNACK } from './actionTypes';

export const activateAuthLayout = () => {
    return {
        type: ACTIVATE_AUTH_LAYOUT,
        payload: {
            topbar: true,
            sidebar: true,
            footer: true,
            layoutType: 'Auth'
        }
    }
}

export const activateNonAuthLayout = () => {
    localStorage.removeItem('user');
    localStorage.clear();
    return {
        type: ACTIVATE_NON_AUTH_LAYOUT,
        payload: {
            topbar: false,
            sidebar: false,
            footer: false,
            layoutType: 'NonAuth'
        }
    }
}

export const isLarge = (isToggle) => {
    return {
        type: IS_LARGE,
        payload: isToggle
    }
}

export const openSnack = (payload) => {
    return {
        type: OPEN_SNACK,
        payload,
    }
}

export const closeSnack = () => {
    return {
        type: CLOSE_SNACK,
    }
}


