
 if(window.location.href.match('localhost:')){
      // eslint-disable-next-line no-redeclare
      var BASE_URL = 'http://165.232.177.52:8090/';
}else{
      // eslint-disable-next-line no-redeclare
      //var BASE_URL = 'https://145.239.206.220:8090/bulksms/';
      //var BASE_URL = 'https://smstake.hemshrestha.com.np/';
      //var BASE_URL = 'https://login.smstake.com/bulksms/'
      var BASE_URL = 'http://165.232.177.52:8090/'
}

const Settings = {
      // 'BASE_URL' : 'http://165.22.219.253:8090/',
      'BASE_URL' : BASE_URL,
      // 'CLIENT_MICRO_SERVER' : 'http://134.209.148.127:8080/',
      'CLIENT_MICRO_SERVER' : BASE_URL,
      'SITE_NAME' : 'smstake',
};

export default Settings;
