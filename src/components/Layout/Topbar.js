import React, { Component } from 'react';
import LanguageMenu from './Menus/languageMenu';
import ProfileMenu from './Menus/profileMenu';
import {getLoggedInUser} from '../../helpers/authUtils';
import { Link } from 'react-router-dom';
import { isLarge } from '../../store/actions';
import { connect } from 'react-redux';

import logoLight from "../../images/img/admin logo.png";
import logoSmall from "../../images/img/admin logo.png";
import {Tag} from 'antd';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

class Topbar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            create_menu: false,
            toggle: false,
            username: '',
            userType: '',
        };
        this.toggleCreate = this.toggleCreate.bind(this);
    }

    componentDidMount(){
        this.setState({
            username: getLoggedInUser().userName,
            balance: (getLoggedInUser().wallet !== null)?getLoggedInUser().wallet.closingCredit:0, 
            userType: getLoggedInUser().userType, 
            accountType: getLoggedInUser().accountType
        })
    }

    toggleCreate() {
        this.setState(prevState => ({
            create_menu: !prevState.create_menu
        }));
    }

    sidebarToggle = () => {
        console.log('this.props.is_large_state')
        console.log(this.props.is_large_state)
        document.body.classList.toggle('enlarged');
        this.props.isLarge(!this.props.is_large_state);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement && /* alternative standard method */ !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    }

    getBalance() {
        const userDetails = getLoggedInUser();
        if (userDetails) {
            // const amount = userDetails.wallet ? userDetails.wallet.closingCredit : 0;
            // const isGST = userDetails.pricing ? userDetails.pricing.gstInclusive : false;
            // const netPrice = userDetails.pricing ? userDetails.pricing.netPrice : 0;
            // const credits = Math.round((amount - (!isGST ? amount * 0.18 : 0)) / (netPrice / 100));
            // return Math.round(credits - (credits * 0.25));
            return userDetails.wallet?.closingCredit ? Math.round(userDetails.wallet.closingCredit) : 0;
        }
        return 0;
    }

    render() {
        return (
            <React.Fragment>
                <div className="topbar">
                    <div className="topbar-left">
                        <div className="">
                            {/* <Link to="/" className="logo">
                                <span>
                                    <img src={logoLight} alt="" height="35" />
                                </span>
                                <i>
                                    <img src={logoSmall} alt="" height="32" />
                                </i>
                            </Link> */}

                            <div className="float-right">
                                <button onClick={this.sidebarToggle} className="button-menu-mobile open-left waves-effect">
                                    <i className="mdi mdi-menu"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <nav className="navbar-custom">

                        <ul className="navbar-right list-inline float-right mt-4">
                            {/*<li className="dropdown notification-list list-inline-item d-none d-md-inline-block mr-1">
                                <form role="search" className="app-search">
                                    <div className="form-group mb-0">
                                        <input type="text" className="form-control" placeholder="Search.." />
                                        <button type="submit"><i className="fa fa-search"></i></button>
                                    </div>
                                </form>
                            </li>*/}

                            {/*<li className="dropdown notification-list list-inline-item d-none d-md-inline-block mr-1">
                                <Link onClick={this.toggleFullscreen} className="nav-link waves-effect" to="#" id="btn-fullscreen">
                                    <i className="mdi mdi-fullscreen noti-icon"></i>
                                </Link>
                            </li>*/}

                            <ProfileMenu />
                        </ul>

                        <ul className="navbar-right list-inline float-right mt-4">
                            <span className="hide-sm mr-2 font-weignt-bold"> <b><Tag color="blue">{this.state.username}</Tag> </b> </span>
                            <span className="hide-sm mr-2 font-weignt-bold"> <b><Tag color="blue">{this.state.userType}</Tag> ({this.state.accountType})</b> </span>
                            {this.state.userType !== 'superadmin' &&(
                                <span tag="a" href="#">
                                    {/* <i className="mdi mdi-wallet m-r-5"></i> Balance: {Math.round((parseFloat((this.props.sms_balance !== undefined) ? this.props.sms_balance : this.state.balance) + Number.EPSILON) * 100) / 100}</span> */}
                                    <i className="mdi mdi-wallet m-r-5"></i> Balance: {this.getBalance()}</span>
                            )}

                            <LanguageMenu />
                        </ul>
                        
                        <ul className="list-inline menu-left mb-0">
                            {/* <li className="float-left">
                                <button onClick={this.sidebarToggle} className="button-menu-mobile open-left waves-effect">
                                    <i className="mdi mdi-menu"></i>
                                </button>
                            </li> */}

                            {/*<InvoiceNotificationMenu />
                            <TicketNotificationMenu />*/}

                            {/*<li className="d-none d-sm-block">
                                <Dropdown isOpen={this.state.create_menu} toggle={this.toggleCreate} className="pt-3 d-inline-block">
                                    <DropdownToggle className="btn btn-light" caret tag="a">
                                        Create {' '}{' '}{' '}
                                    </DropdownToggle>
                                    <DropdownMenu >
                                        <DropdownItem tag="a" href="#">Action</DropdownItem>
                                        <DropdownItem tag="a" href="#">Another action</DropdownItem>
                                        <DropdownItem tag="a" href="#">Something else here</DropdownItem>
                                        <div className="dropdown-divider"></div>
                                        <DropdownItem tag="a" href="#">Separated link</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </li>*/}
                        </ul>
                    </nav>
                </div>

                {getLoggedInUser().dltRegNo===null && (
                    <Alert 
                    style={{    
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: '999',
                        boxShadow: '0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)'}}
                        severity="warning">Please Update DLT No. To Continue. <Link to="/profile"><Button size="small">Update</Button></Link></Alert>
                )}

            </React.Fragment>
        );
    }
}

const mapStatetoProps = state => {
    const { is_large_state } = state.Layout;
    const { sms_balance } = state.User;
    return { is_large_state, sms_balance };
}


export default connect(mapStatetoProps, { isLarge })(Topbar);
