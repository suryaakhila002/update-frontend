import { takeEvery, fork, put, all, call } from 'redux-saga/effects';

// Login Redux States
import { CHECK_LOGIN } from './actionTypes';
import {  apiError, loginUserSuccessful } from './actions';

// AUTH related methods
import { setLoggeedInUser, postLogin } from '../../../helpers/authUtils';

//If user is login then dispatch redux action's are directly from here.
function* loginUser({ payload: { username, password, history } }) {

        var raw = JSON.stringify({"password":password,"usernameOrEmail":username});
        var requestOptions = {
          method: 'POST',
          headers: {"Content-Type": "application/json"},
          body: raw,
          redirect: 'follow'
        };

        try {
            fetch("http://atssms.com:8090/api/auth/signin", requestOptions)
              .then(response => response.json())
              .then(data => {
                if (data.sessionToken !== undefined) {
                    apiError([400, "Username and password are invalid. Please enter correct username and password"])
                    return false;
                }
                
                //save user data in localstorage
                setLoggeedInUser(data);
                
                //mutate state
                loginUserSuccessful(data);

                //new route
                history.push('/dashboard');

              })
              .catch(error => console.log('error', error));

            // const response = yield call(postLogin, 'http://atssms.com:8090/api/auth/signin', {usernameOrEmail: username, password: password});
            // console.log(response);
            
            // setLoggeedInUser(response);
            // yield put(loginUserSuccessful(response));
            // history.push('/dashboard');
        } catch (error) {
            yield put(apiError(error));
        }
}

export function* watchUserLogin() {
    // yield takeEvery(CHECK_LOGIN, loginUser)
}

function* loginSaga() {
    // yield all([fork(watchUserLogin)]);
}

export default loginSaga;