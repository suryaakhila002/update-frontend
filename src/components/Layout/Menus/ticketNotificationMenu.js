
import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Scrollbars } from 'react-custom-scrollbars';

class TicketNotificationMenu extends Component {

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
                <Dropdown isOpen={this.state.menu} toggle={this.toggle} className="notification-list list-inline-item mr-1" tag="li">
                    <DropdownToggle className="nav-link arrow-none waves-effect" tag="a">
                        <i className="mdi mdi-message-text-outline noti-icon"></i>
                        <span className="badge badge-pill badge-danger noti-icon-badge">2</span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-lg" left>
                        <h6 className="dropdown-item-text">  Recent 5 Pending Tickets </h6>
                        <Scrollbars style={{ height: "230px" }}>
                            <DropdownItem tag="a" htef="#" className="notify-item">
                                <div className="notify-icon  bg-warning"><i className="mdi mdi-message-text-outline"></i></div>
                                <p className="notify-details">Demo User<span className="text-muted">Invoice Overdue</span></p>
                            </DropdownItem>
                            <DropdownItem tag="a" htef="#" className="notify-item">
                                <div className="notify-icon  bg-warning"><i className="mdi mdi-message-text-outline"></i></div>
                                <p className="notify-details">Demo User2<span className="text-muted">Inquiry</span></p>
                            </DropdownItem>
                        </Scrollbars>
                        <DropdownItem tag="a" htef="#" className="text-center text-primary notify-all">
                            View all <i className="fi-arrow-right"></i>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </React.Fragment>
        );
    }
}


export default TicketNotificationMenu;
