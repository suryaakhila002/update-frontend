import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {getLoggedInUser} from '../../helpers/authUtils';

class SideNav extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    
    render() {
        // console.log(this.props.location)
        return (
            <React.Fragment>
                <div id="sidebar-menu">
                    <ul className="metismenu" id="menu" style={{ marginTop: 20, fontSize: '13px'}}>
                        {/*<li className="menu-title">Main</li>*/}
                        <li>
                            <Link to="/dashboard" className="waves-effect">
                                <span> Dashboard </span> <i className="float-right ti-dashboard mt-1"></i>
                            </Link>
                        </li>

                        {/* only super admin */}
                        {getLoggedInUser().userType === 'SUPER_ADMIN' && (
                        <li id="temp">
                            <Link to="/#" className="waves-effect"><i className="mt-1 ti-user float-right"></i><span> Clients <span className="menu-arrow  float-right"> <i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="/allClients">All Clients</Link></li>
                                <li><Link to="/superadminCreateClients">Add New Client</Link></li>
                                {/* <li><Link to="/clientGroups">Clients Groups</Link></li> */}
                                {/*<li><Link to="/clientExportImport">Export and Import Clients</Link></li>*/}
                            </ul>
                        </li>
                        )}

                        {getLoggedInUser().userType === 'ADMIN' && (
                        <li id="temp">
                            <Link to="/#" className="waves-effect"><i className="mt-1 ti-user float-right"></i><span> Clients <span className="menu-arrow  float-right"> <i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="/allClients">All Clients</Link></li>
                                <li><Link to="/adminCreateClients">Add New Client</Link></li>
                                {/* <li><Link to="/clientGroups">Clients Groups</Link></li> */}
                                {/*<li><Link to="/clientExportImport">Export and Import Clients</Link></li>*/}
                            </ul>
                        </li>
                        )}

                        {getLoggedInUser().userType === 'RESELLER' && (
                        <li id="temp">
                            <Link to="/#" className="waves-effect"><i className="mt-1 ti-user float-right"></i><span> Clients <span className="menu-arrow  float-right"> <i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="/allClients">All Clients</Link></li>
                                <li><Link to="/resellerCreateClients">Add New Client</Link></li>
                                {/* <li><Link to="/clientGroups">Clients Groups</Link></li> */}
                                {/*<li><Link to="/clientExportImport">Export and Import Clients</Link></li>*/}
                            </ul>
                        </li>
                        )}

                        <li id="temp">
                            <Link to="/#" className="waves-effect"><i className="mdi mdi-send float-right mt-1"></i><span> Bulk SMS <span className="menu-arrow  float-right"> <i className="mdi mdi-chevron-right mr-3 "></i></span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="/sendQuickSms">Quick SMS</Link></li>
                                <li><Link to="/sendGroupSms">Send Group SMS</Link></li>
                                <li><Link to="/sendSmsFile">Send SMS From File</Link></li>
                                {/* <li><Link to="/sendBulkSms">Send Custom SMS</Link></li>
                                <li><Link to="/pages-blank">Send Shortcode SMS</Link></li> */}
                            </ul>
                        </li>
                        <li>
                            <Link to="/senderIdManage" className="waves-effect"><i className="float-right ti-shield mt-1"></i><span> Sender ID </span></Link>
                            {getLoggedInUser().userType === 'SUPER_ADMIN' && (
                              <Link to="/blockSenderId" className="waves-effect"><i className="float-right ti-shield mt-1"></i><span> Block Sender ID </span></Link>
                            )}
                        </li>

                        {getLoggedInUser().userType === 'SUPER_ADMIN' &&  (
                        <li>
                            <Link to="/smsTemplate" className="waves-effect"><i className="float-right ti-file mt-1"></i><span> SMS Templates </span></Link>
                        </li>
                        )}
                        {getLoggedInUser().templateBased === true &&  (
                        <li>
                            <Link to="/smsTemplate" className="waves-effect"><i className="float-right ti-file mt-1"></i><span> SMS Templates </span></Link>
                        </li>
                        )}

                        {getLoggedInUser().userType === 'SUPER_ADMIN' && (
                        <li>
                            <Link to="/smsRoutes" className="waves-effect"><i className="float-right ti-signal mt-1"></i><span> SMS Routes </span></Link>
                        </li>
                        )}

                        <li id="reports" className={(this.props.location.pathname === '/manageReport')?"mm-active":""}>
                            <Link to="/#" className={(this.props.location.pathname === '/manageReport')?"waves-effect mm-active":"waves-effect"}><i className="mt-1 float-right ti-printer"></i><span> Reports <span className="menu-arrow float-right"><i className="mdi mdi-chevron-right mr-3"></i> </span>  </span></Link>
                            <ul className="submenu">
                                <li><Link to="/smsReport">Campaign Reports</Link></li>
                                <li><Link to="/pages-blank">Schedule Reports</Link></li>
                                {/* <li><Link to="/smsHistory">SMS History</Link></li> */}
                                {/* <li><Link to="/queue">Queue</Link></li> */}
                            </ul>
                        </li>
                        <li>
                            <Link to="/groups" className="waves-effect"><i className="float-right ti-id-badge mt-1"></i><span> Contact Groups </span></Link>
                        </li>
                        <li>
                            <Link to="/smsApi" className="waves-effect"><i className="float-right ti-unlink mt-1"></i><span> SMS API </span></Link>
                        </li>

                        {getLoggedInUser().userType === 'ADMIN' && (
                            <li>
                                <Link to="/settings" className="waves-effect"><i className="float-right ti-settings mt-1"></i><span> Settings </span></Link>
                            </li>
                        )}


                        {false && getLoggedInUser().userType !== 'SUPER_ADMIN' && getLoggedInUser().accountType === 'Prepaid'  && (
                            <li id="temp">
                                <Link to="/#" className="waves-effect"><i className="float-right pt-1 ti-cart"></i><span> Recharge <span className="float-right menu-arrow"><i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                                <ul className="submenu">
                                    {/* <li><Link to="/viewFixedRechargePlans">Purchase SMS Plan</Link></li> */}
                                    <li><Link to="/buyUnit">Buy Unit</Link></li>
                                </ul>
                            </li>
                        )}

                        {/* {getLoggedInUser().userType !== 'USER' && (
                            <li id="temp">
                                <Link to="/#" className="waves-effect"><i className="float-right pt-1 ti-receipt"></i><span> SMS Plan <span className="float-right menu-arrow"><i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                                <ul className="submenu">
                                    <li><Link to="/viewBundlePlan">Bundle Plans</Link></li>
                                    <li><Link to="/viewFixedPlan">View Plans</Link></li>
                                    <li><Link to="/addPricePlan">Create Plan</Link></li>
                                </ul>
                            </li>
                        )} */}

                        {getLoggedInUser().userType === 'SUPER_ADMIN' && (
                        <>
                        <li id="temp">
                            <Link to="/#" className="waves-effect"><i className="ti-credit-card float-right"></i><span> Invoices <span className="float-right  menu-arrow"> <i className="mdi mdi-chevron-right mr-3"></i> </span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="/allInvoices">All Invoices</Link></li>
                                <li><Link to="/recurringInvoices">Recurring Invoices</Link></li>
                                <li><Link to="/recurringInvoices">Add New Invoices</Link></li>
                            </ul>
                        </li>
                        {/*<li id="temp">
                            <Link to="/#" className="waves-effect"><i className="mdi mdi-keyboard"></i><span> Keywords <span className="float-right menu-arrow"><i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="/allKeywoards">All Keywords</Link></li>
                                <li><Link to="/addNewKeywoard">Add New Keywords</Link></li>
                                <li><Link to="/keywoardsSetting">Keywords Settings</Link></li>
                            </ul>
                        </li>
                        <li id="temp">
                            <Link to="/#" className="waves-effect"><i className="float-right ti-id-badge"></i><span> Contacts <span className="float-right menu-arrow"><i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="/phoneBook">Phone Book</Link></li>
                                <li><Link to="/importContact">Import Contacts</Link></li>
                                <li><Link to="/blacklistContact">Blacklist Contacts</Link></li>
                                <li><Link to="/spamWords">Spam Words</Link></li>
                            </ul>
                        </li>
                        <li>
                            <Link to="/coverage" className="waves-effect"><i className="float-right ti-signal"></i><span> Coverage / Routing </span></Link>
                        </li>*/}
                        
                        
                        <li id="temp">
                            <Link to="/#" className="waves-effect"><i className="float-right pt-1 ti-receipt"></i><span> Support Tickets <span className="float-right menu-arrow"><i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="/allSupportTickets">All Support Tickets</Link></li>
                                <li><Link to="/createNewTicket">Create New Tickets</Link></li>
                                <li><Link to="/supportDepartments">Support Department</Link></li>
                            </ul>
                        </li>
                        <li id="temp">
                            <Link to="/#" className="waves-effect"><i className="float-right pt-1 ti-user"></i><span> Administrators <span className="float-right menu-arrow"><i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="/administrators">Administrators</Link></li>
                                <li><Link to="/administratorRoles">Administrator Roles</Link></li>
                            </ul>
                        </li>

                        <li id="temp">
                            <Link to="/#" className="waves-effect"><i className="float-right pt-1 ti-settings"></i><span> Settings <span className="float-right menu-arrow"><i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="/pages-blank">System</Link></li>
                                <li><Link to="/pages-blank">Payment Gateway</Link></li>
                                <li><Link to="/pages-blank">Keywords Settings</Link></li>
                            </ul>
                        </li>
                        </>
                        )}

                        <li>
                            <Link to="/logout" className="waves-effect"><i className="float-right ti-power-off mt-1 text-danger"></i><span> Logout </span></Link>
                        </li>
                        {/*<li>
                            <Link to="calendar" className="waves-effect"><i className="float-right ti-calendar"></i><span> Calendar </span></Link>
                        </li>
                        <li id="temp">
                            <Link to="/#" className="waves-effect"><i className="float-right ti-email"></i><span> Email <span className="float-right menu-arrow"><i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                            <ul className="submenu">
                                <li><Link   to="email-inbox">Inbox</Link></li>
                                <li><Link to="email-read">Email Read</Link></li>
                                <li><Link   to="email-compose">Email Compose</Link></li>
                            </ul>
                        </li>

                        <li className="menu-title">Components</li>

                        <li>
                            <Link to="/#" className="waves-effect"><i className="float-right ti-package"></i> <span> UI Elements <span className="float-right menu-arrow"><i className="mdi mdi-chevron-right mr-3"></i></span> </span> </Link>
                            <ul className="submenu">
                                <li><Link to="ui-alerts">Alerts</Link></li>
                                <li><Link to="ui-buttons">Buttons</Link></li>
                                <li><Link to="ui-cards">Cards</Link></li>
                                <li><Link to="ui-carousel">Carousel</Link></li>
                                <li><Link to="ui-dropdowns">Dropdowns</Link></li>
                                <li><Link to="ui-grid">Grid</Link></li>
                                <li><Link to="ui-images">Images</Link></li>
                                <li><Link to="ui-lightbox">Lightbox</Link></li>
                                <li><Link to="ui-modals">Modals</Link></li>
                                <li><Link to="ui-rangeslider">Range Slider</Link></li>
                                <li><Link to="ui-session-timeout">Session Timeout</Link></li>
                                <li><Link to="ui-progressbars">Progress Bars</Link></li>
                                <li><Link to="ui-sweet-alert">Sweet-Alert</Link></li>
                                <li><Link to="ui-tabs-accordions">Tabs & Accordions</Link></li>
                                <li><Link to="ui-typography">Typography</Link></li>
                                <li><Link to="ui-video">Video</Link></li>
                                <li><Link to="ui-general">General</Link></li>
                                <li><Link to="ui-colors">Colors</Link></li>
                                <li><Link to="ui-rating">Rating</Link></li>
                            </ul>
                        </li>

                        <li>
                            <Link to="/#" className="waves-effect"><i className="float-right ti-receipt"></i><span> Forms <span className="badge badge-pill badge-success float-right">9</span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="form-elements">Form Elements</Link></li>
                                <li><Link to="form-validation">Form Validation</Link></li>
                                <li><Link to="form-advanced">Form Advanced</Link></li>
                                <li><Link to="form-editors">Form Editors</Link></li>
                                <li><Link to="form-uploads">Form File Upload</Link></li>
                                <li><Link to="form-xeditable">Form Xeditable</Link></li>
                                <li><Link to="form-repeater">Form Repeater</Link></li>
                                <li><Link to="form-wizard">Form Wizard</Link></li>
                                <li><Link to="form-mask">Form Mask</Link></li>
                            </ul>
                        </li>

                        <li>
                            <Link to="/#" className="waves-effect"><i className="float-right ti-pie-chart"></i><span> Charts <span className="float-right menu-arrow"><i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="charts-apex">Apex Chart</Link></li>
                                <li><Link to="charts-chartist">Chartist Chart</Link></li>
                                <li><Link to="charts-chartjs">Chartjs Chart</Link></li>
                                <li><Link to="charts-knob">Knob Chart</Link></li>
                                <li><Link to="charts-echart">E - Chart</Link></li>
                                <li><Link to="charts-sparkline">Sparkline Chart</Link></li>
                            </ul>
                        </li>

                        <li>
                            <Link to="/#" className="waves-effect"><i className="float-right ti-view-grid"></i><span> Tables <span className="float-right menu-arrow"><i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="tables-basic">Basic Tables</Link></li>
                                <li><Link to="tables-datatable">Data Table</Link></li>
                                <li><Link to="tables-responsive">Responsive Table</Link></li>
                                <li><Link to="tables-editable">Editable Table</Link></li>
                            </ul>
                        </li>

                        <li>
                            <Link to="/#" className="waves-effect"><i className="float-right ti-face-smile"></i> <span> Icons  <span className="float-right menu-arrow"><i className="mdi mdi-chevron-right mr-3"></i></span></span> </Link>
                            <ul className="submenu">
                                <li><Link to="icons-material">Material Design</Link></li>
                                <li><Link to="icons-fontawesome">Font Awesome</Link></li>
                                <li><Link to="icons-ion">Ion Icons</Link></li>
                                <li><Link to="icons-themify">Themify Icons</Link></li>
                                <li><Link to="icons-dripicons">Dripicons</Link></li>
                                <li><Link to="icons-typicons">Typicons Icons</Link></li>
                            </ul>
                        </li>

                        <li>
                            <Link to="/#" className="waves-effect"><i className="float-right ti-location-pin"></i><span> Maps <span className="badge badge-pill badge-danger float-right">2</span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="maps-google"> Google Map</Link></li>
                                <li><Link to="maps-vector"> Vector Map</Link></li>
                            </ul>
                        </li>

                        <li className="menu-title">Extras</li>

                        <li>
                            <Link to="/#" className="waves-effect"><i className="float-right ti-archive"></i><span> Authentication <span className="float-right menu-arrow"><i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="pages-login-2">Login 2</Link></li>
                                <li><Link to="pages-register-2">Register 2</Link></li>
                                <li><Link to="pages-recoverpw-2">Recover Password 2</Link></li>
                                <li><Link to="pages-lock-screen-2">Lock Screen 2</Link></li>
                            </ul>
                        </li>

                        <li>
                            <Link to="/#" className="waves-effect"><i className="float-right ti-support"></i><span> Extra Pages <span className="float-right menu-arrow"><i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="pages-timeline">Timeline</Link></li>
                                <li><Link to="pages-invoice">Invoice</Link></li>
                                <li><Link to="pages-directory">Directory</Link></li>
                                <li><Link to="pages-blank">Blank Page</Link></li>
                                <li><Link to="pages-404">Error 404</Link></li>
                                <li><Link to="pages-500">Error 500</Link></li>
                                <li><Link to="pages-pricing">Pricing</Link></li>
                                <li><Link to="pages-gallery">Gallery</Link></li>
                                <li><Link to="pages-maintenance">Maintenance</Link></li>
                                <li><Link to="pages-comingsoon">Coming Soon</Link></li>
                                <li><Link to="pages-faq">Faq</Link></li>
                            </ul>
                        </li>

                        <li>
                            <Link to="/#" className="waves-effect"><i className="float-right ti-bookmark-alt"></i><span> Email Templates <span className="float-right menu-arrow"><i className="mdi mdi-chevron-right mr-3"></i></span> </span></Link>
                            <ul className="submenu">
                                <li><Link to="email-template-basic">Basic Action Email</Link></li>
                                <li><Link to="email-template-Alert">Alert Email</Link></li>
                                <li><Link to="email-template-Billing">Billing Email</Link></li>
                            </ul>
                        </li>*/}

                    </ul>
                </div>

            </React.Fragment>
        );
    }
}


export default SideNav;
