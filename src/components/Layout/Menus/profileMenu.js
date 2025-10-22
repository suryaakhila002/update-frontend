
import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';

// users
import logoLight from "../../../images/ATSSMSANDIVRLOGO.png";
import {getLoggedInUser} from '../../../helpers/authUtils';

class ProfileMenu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            menu: false,
        };
        this.toggle = this.toggle.bind(this);
        this.myProfile = this.myProfile.bind(this);
    }

    toggle() {
        this.setState(prevState => ({
            menu: !prevState.menu
        }));
    }

    myProfile() {        
        this.props.history.push({pathname: '/profile', state: { user: true, clientId: getLoggedInUser().id }});
    }

    render() {
        return (
            <React.Fragment>
                <Dropdown isOpen={this.state.menu} toggle={this.toggle} className="notification-list list-inline-item nav-pro-img" tag="li">
                    <DropdownToggle className="nav-link arrow-none nav-user waves-effect" tag="a">
                        {/* <img src={logoLight} alt="user" className="rounded-circle" /> */}
                        <span><i className="mt-1 ti-user float-right"></i></span>
                    </DropdownToggle>
                    <DropdownMenu className="profile-dropdown" right>
                        <DropdownItem tag="a" onClick={()=>this.myProfile()}><i className="mdi mdi-account-circle m-r-5"></i> Update Profile</DropdownItem>
                        <Link to="/changePassword"><DropdownItem ><i className="mdi mdi-settings m-r-5"></i> Change Password</DropdownItem></Link>
                        <div className="dropdown-divider"></div>
                        <Link to="/logout"><DropdownItem className="text-danger"><i className="mdi mdi-power text-danger"></i> Logout</DropdownItem></Link>
                    </DropdownMenu>
                </Dropdown>
            </React.Fragment >
        );
    }
}

export default withRouter(ProfileMenu);
