import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { activateNonAuthLayout } from '../../store/actions';
import { removeLoggedInUser } from '../../helpers/authUtils'

class Logout extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {

        removeLoggedInUser();
        
        this.props.activateNonAuthLayout();
        

        // Remove all Item from localstorage and redirect to login page
        this.props.history.push('/login');
    }

    render() {
        return (
            <React.Fragment>
                <h1>&nbsp;</h1>
            </React.Fragment>
        );
    }
}

const mapStatetoProps = state => {
    return {};
}

export default withRouter(connect(mapStatetoProps, { activateNonAuthLayout })(Logout));

