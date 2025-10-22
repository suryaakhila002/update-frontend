import axios from 'axios';
import {ServerApi} from '../utils/ServerApi';

//Set the logged in user data in local session 
const setLoggeedInUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
}

// Gets the logged in user data from local session 
const getLoggedInUser = () => {
    const user = localStorage.getItem('user');
    if (user)
        return JSON.parse(user);
    return null;
}

// remove the logged in user data from local session 
const removeLoggedInUser = () => {
    localStorage.removeItem('user');
    return true;
}

//is user is logged in
const isUserAuthenticated = () => {
    return getLoggedInUser() !== null;
}

//update user local data
const updateLoggeedInUserSmsBalance = (smsBalance) => {
    if(getLoggedInUser() == null || getLoggedInUser().userType === 'superadmin'){return '0'}

    const userObj = localStorage.getItem('user');
    const userJson = JSON.parse(userObj);
    userJson.wallet.closingCredit = smsBalance;
    localStorage.setItem('user', JSON.stringify(userJson));
}

// Gets the user Sms Balance 
const getLoggedInUserSmsBalance = () => {
    if(getLoggedInUser().userType === 'superadmin'){return '0'}
    
    ServerApi().get(`client/getBalance/${getLoggedInUser().id}`)
        .then(res => {
        if (res.data === undefined) {
            return 'N/A';
        } 
        return res.data.response;
        // this.props.updateSmsBalance(res.data.response);
    })
    .catch(error => console.log('error', error));
}

// Register Method
const postRegister = (url, data) => {
    return axios.post(url, data).then(response => {
        if (response.status >= 200 || response.status <= 299)
            return response.data;
        throw response.data;
    }).catch(err => {
        var message;
        if (err.response && err.response.status ) {
            switch (err.response.status) {
                case 404: message = "Sorry! the page you are looking for could not be found"; break;
                case 500: message = "Sorry! something went wrong, please contact our support team"; break;
                case 401: message = "Invalid credentials"; break;
                default: message = err[1]; break;
            }
        }
        throw message;
    });

}

// Login Method
const postLogin = (url, data) => {
    return axios.post(url, data).then(response => {
        if (response.status === 400 || response.status === 500)
            throw response.data;
        return response.data;
    }).catch(err => {
        throw err[1];
    });
}

// postForgetPwd 
const postForgetPwd = async (url, data) => {
    try {
        const response = await axios.post(url, data);
        if (response.status === 400 || response.status === 500)
            throw response.data;
        return response.data;
    }
    catch (err) {
        throw err[1];
    }
}




export { setLoggeedInUser, getLoggedInUser, isUserAuthenticated, postRegister, postLogin, postForgetPwd, removeLoggedInUser, getLoggedInUserSmsBalance, updateLoggeedInUserSmsBalance }