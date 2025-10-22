
import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
// import { updateSmsBalance } from '../../../store/actions';

class LanguageMenu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            menu: false,
        };
        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState(prevState => ({
            menu: !prevState.menu
        }));
    }
    render() {

        return (
            <React.Fragment>
                {/*<Dropdown isOpen={this.state.menu} toggle={this.toggle} className="notification-list list-inline-item d-none d-md-inline-block mr-1" tag="li">
                    <DropdownToggle className="nav-link dropdown-toggle arrow-none waves-effect" tag="a">
                        <img alt="DashBiz" src={usFlag} className="mr-2" height="12" /> English  <span className="mdi mdi-chevron-down"></span>
                    </DropdownToggle>
                    <DropdownMenu className="language-switch" right>
                        <DropdownItem tag="a" href="#"><img alt="DashBiz" src={germanyFlag} height="16" /><span> German </span></DropdownItem>
                        <DropdownItem tag="a" href="#"><img alt="DashBiz" src={italyFlag} height="16" /><span> Italian </span></DropdownItem>
                        <DropdownItem tag="a" href="#"><img alt="DashBiz" src={frenchFlag} height="16" /><span> French </span></DropdownItem>
                        <DropdownItem tag="a" href="#"><img alt="DashBiz" src={spainFlag} height="16" /><span> Spanish </span></DropdownItem>
                        <DropdownItem tag="a" href="#"><img alt="DashBiz" src={russiaFlag} height="16" /><span> Russian </span></DropdownItem>
                    </DropdownMenu>
                </Dropdown>*/}

            </React.Fragment >
        );
    }
}

export default withRouter(LanguageMenu);