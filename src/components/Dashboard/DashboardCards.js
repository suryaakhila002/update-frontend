import React, { Component } from 'react';
import {  Row, Col, Card, CardBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {getLoggedInUser} from '../../helpers/authUtils';

//Images admin
import img1 from '../../images/ATSICONS/Dashboard/Contacts.png';
import img2 from '../../images/ATSICONS/Dashboard/group Contacts.png';
import img3 from '../../images/ATSICONS/Dashboard/invoice.png';
import img4 from '../../images/ATSICONS/Dashboard/support Tiket.png';

//Images users
import u_img1 from '../../images/ATSICONS/Dashboard/User dash board/invoice.png';
import u_img2 from '../../images/ATSICONS/Dashboard/User dash board/Quick SMS.png';
import u_img3 from '../../images/ATSICONS/Dashboard/User dash board/report.png';
import u_img4 from '../../images/ATSICONS/Dashboard/User dash board/Send sms from file.png';


class DashboardCards extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        // this.props.activateAuthLayout();
    }

    render() {

        return (
            <React.Fragment>

                {getLoggedInUser().userType === 'superadmin' && (

                    <Row>
                        <Col xl="3" md="4">
                            <Card className="mini-stat bg-success1 text-white">
                                <CardBody>
                                    <div className="mb-4">
                                        <div className="float-left mini-stat-img mr-4">
                                            <img src={img1} alt="" />
                                        </div>
                                        <h5 className="font-16 text-uppercase mt-0 text-white">Clients</h5>
                                        <h4 className="text-white font-500">1 </h4>
                                    </div>
                                    <div className="pt-2">
                                        <div className="float-right">
                                            <Link to="/addNewClient" className="text-white-50"><i className="mdi mdi-arrow-right h5"></i></Link>
                                        </div>
                                        <p className="text-white-50 mb-0">Add New</p>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xl="3" md="4">
                            <Card className="mini-stat bg-primary1 text-white">
                                <CardBody>
                                    <div className="mb-4">
                                        <div className="float-left mini-stat-img mr-4">
                                            <img src={img2} alt="" />
                                        </div>
                                        <h5 className="font-16 text-uppercase mt-0 text-white"> Groups</h5>
                                        <h4 className="text-white font-500">0</h4>
                                    </div>
                                    <div className="pt-2">
                                        <div className="float-right">
                                            <Link to="/clientGroups" className="text-white-50"><i className="mdi mdi-arrow-right h5"></i></Link>
                                        </div>
                                        <p className="text-white-50 mb-0">Add New</p>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xl="3" md="4">
                            <Card className="mini-stat bg-warning1 text-white">
                                <CardBody>
                                    <div className="mb-4">
                                        <div className="float-left mini-stat-img mr-4">
                                            <img src={img3} alt="" />
                                        </div>
                                        <h5 className="font-16 text-uppercase mt-0 text-white">Invoices</h5>
                                        <h4 className="text-white font-500">0 </h4>
                                        
                                    </div>
                                    <div className="pt-2">
                                        <div className="float-right">
                                            <Link to="#" className="text-white-50"><i className="mdi mdi-arrow-right h5"></i></Link>
                                        </div>
                                        <p className="text-white-50 mb-0">Add New</p>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xl="3" md="4">
                            <Card className="mini-stat bg-danger1 text-white">
                                <CardBody>
                                    <div className="mb-4">
                                        <div className="float-left mini-stat-img mr-4">
                                            <img src={img4} alt="" />
                                        </div>
                                        <h5 className="font-16 text-uppercase mt-0 text-white">Tickets</h5>
                                        <h4 className="text-white font-500">0 </h4>
                                    </div>
                                    <div className="pt-2">
                                        <div className="float-right">
                                            <Link to="#" className="text-white-50"><i className="mdi mdi-arrow-right h5"></i></Link>
                                        </div>

                                        <p className="text-white-50 mb-0">Add New</p>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                
                )}

                {getLoggedInUser().userType !== 'superadmin' && (

                <Row>
                    <Col xl="3" md="4">
                        <Card className="mini-stat bg-info text-white">
                            <CardBody>
                                <div className="mb-4">
                                    <div className="float-left mini-stat-img mr-4">
                                        <img src={u_img1} alt="" />
                                    </div>
                                    <h5 className="font-16 text-uppercase mt-0 text-white">Invoice</h5>
                                    <h4 className="text-white font-500">0 </h4>
                                </div>
                                <div className="pt-2">
                                    <div className="float-right">
                                        <Link to="#" className="text-white-50"><i className="mdi mdi-arrow-right h5"></i></Link>
                                    </div>
                                    <p className="text-white-50 mb-0">View</p>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl="3" md="4">
                        <Card className="mini-stat bg-info text-white">
                            <CardBody>
                                <div className="mb-4">
                                    <div className="float-left mini-stat-img mr-4">
                                        <img src={u_img2} alt="" />
                                    </div>
                                    <h5 className="font-16 text-uppercase mt-0 text-white"> Quick SMS</h5>
                                    <h4 className="text-white font-500">0</h4>
                                </div>
                                <div className="pt-2">
                                    <div className="float-right">
                                        <Link to="/sendQuickSms" className="text-white-50"><i className="mdi mdi-arrow-right h5"></i></Link>
                                    </div>
                                    <p className="text-white-50 mb-0">Send Now</p>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl="3" md="4">
                        <Card className="mini-stat bg-info text-white">
                            <CardBody>
                                <div className="mb-4">
                                    <div className="float-left mini-stat-img mr-4">
                                        <img src={u_img3} alt="" />
                                    </div>
                                    <h5 className="font-16 text-uppercase mt-0 text-white">Reports</h5>
                                    <h4 className="text-white font-500">0 </h4>
                                    
                                </div>
                                <div className="pt-2">
                                    <div className="float-right">
                                        <Link to="/smsReport" className="text-white-50"><i className="mdi mdi-arrow-right h5"></i></Link>
                                    </div>
                                    <p className="text-white-50 mb-0">View</p>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl="3" md="4">
                        <Card className="mini-stat bg-info text-white">
                            <CardBody>
                                <div className="mb-4">
                                    <div className="float-left mini-stat-img mr-4">
                                        <img src={u_img4} alt="" />
                                    </div>
                                    <h5 className="font-16 text-uppercase mt-0 text-white">Bulk SMS</h5>
                                    <h4 className="text-white font-500">0 </h4>
                                </div>
                                <div className="pt-2">
                                    <div className="float-right">
                                        <Link to="/sendSmsFile" className="text-white-50"><i className="mdi mdi-arrow-right h5"></i></Link>
                                    </div>

                                    <p className="text-white-50 mb-0">Send Now</p>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                )}
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout })(DashboardCards);
