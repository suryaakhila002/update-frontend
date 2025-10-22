
import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Scrollbars } from 'react-custom-scrollbars';

class InvoiceNotificationMenu extends Component {

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
                <Dropdown isOpen={this.state.menu} toggle={this.toggle} className="notification-list list-inline-item mr-1 hide-sm" tag="li">
                    <DropdownToggle className="nav-link arrow-none waves-effect" tag="a">
                        <i className="mdi mdi-cart-outline noti-icon"></i>
                        <span className="badge badge-pill badge-danger noti-icon-badge">1</span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-lg" left>
                        <h6 className="dropdown-item-text">  Recent 5 Unpaid Invoices </h6>
                        <Scrollbars style={{ height: "230px" }}>
                            <DropdownItem tag="a" htef="#" className="notify-item active">
                                <div className="notify-icon bg-success"><i className="mdi mdi-cart-outline"></i></div>
                                <p className="notify-details">Amount: <span className="text-muted">5</span></p>
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


export default InvoiceNotificationMenu;
