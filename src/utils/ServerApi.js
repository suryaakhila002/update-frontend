import axios from 'axios';
import Settings from './ServerSettings';
import {getLoggedInUser} from '../helpers/authUtils';



function ServerApi(props){
  //user bearer token
  // var token = '';
  try{
    var token = getLoggedInUser().sessionToken;
  }catch(e){
    token = '';
  }

  var baseURL= Settings.BASE_URL;

  if(props !== undefined){
    if(props.URL !== undefined && props.URL === 'CLIENT_MICRO_SERVER'){
      baseURL = Settings.CLIENT_MICRO_SERVER;
    }
  }

  // console.log('Server API props');
  // console.log(props);
  // return; 

  return (axios.create({
    baseURL: baseURL,
    headers: {
      'Authorization': 'Bearer '+token, 
      "Content-Type": "application/json"
    },
    redirect: 'follow',
    ...props
  }));
}
export {ServerApi}