import React, { Component } from 'react';
import Layout from './components/Layout';
import { withRouter,Route, Switch,BrowserRouter as Router,Redirect  } from 'react-router-dom';

import routes from './routes';
import './custom.css';

// import { useRouterHistory } from 'react-router'
import { createBrowserHistory } from 'history'

// Get all Auth methods
import { isUserAuthenticated } from './helpers/authUtils';
import Snack from './components/Notification/Snack';

function withLayout(WrappedComponent) {
  // ...and returns another component...
  return class extends React.Component { 
    render() {
      return <Layout>
        <WrappedComponent></WrappedComponent>
      </Layout>
    }
  };
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {   }
   }

  componentDidMount(){
    //remove preloader
    document.getElementById("preloader").remove();
  }

  
  render() {

    const PrivateRoute = ({ component: Component, ...rest }) => (
      <Route {...rest} render={(props) => (
        isUserAuthenticated() === true
          ? <Component {...props} />
          : <Redirect to='/logout' />
      )} />
    )

    const history = createBrowserHistory({ basename: '/bulksms' })

    history.listen(_ => {
        window.scrollTo(0, 0)  
    })

    return (
      <React.Fragment>
        <Router history={history}>
          <Switch>
            {routes.map((route, idx) =>
               route.ispublic ?
                 <Route path={route.path} component={route.component}  key={idx}  />
                      : 
                 <PrivateRoute path={route.path} component={withLayout(route.component)}  key={idx}  />
            )}
          </Switch>
          <Snack />
        </Router>        
      </React.Fragment>
    );
  }
}


export default withRouter(App);


