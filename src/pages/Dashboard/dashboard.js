import React, { useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Table } from 'reactstrap';
import { useDispatch } from 'react-redux';


// Charts
import InvoiceHistory from '../AllCharts/apex/invoiceHistory';
import TicketHistory from '../AllCharts/apex/ticketHistory';
import SmsSuccessHistory from '../AllCharts/apex/smsSuccessHistory';
import SmsHistoryByDate from '../AllCharts/apex/smsHistoryByDate';

import DashboardCards from '../../components/Dashboard/DashboardCards';


export default function Dashboard(){

    const dispatch = useDispatch();

    useEffect(()=>{
        dispatch({type: 'auth_layout', payload: {topbar: true,sidebar: true,footer: true,layoutType: 'Auth'}})
    }, [dispatch])

    return (
        <React.Fragment>
            <Container fluid>
                <div className="page-title-box">
                    <Row className="align-items-center">
                        <Col sm="6">
                            <h4 className="page-title">Dashboard</h4>
                            {/*<Breadcrumb>
                                <BreadcrumbItem active>Welcome to Veltrix Dashboard</BreadcrumbItem>
                            </Breadcrumb>*/}
                        </Col>
                        {/*<Col sm="6">
                            <div className="float-right d-none d-md-block">
                                <SettingMenu />
                            </div>
                        </Col>*/}
                    </Row>
                </div>

                <DashboardCards />

                <Row>
                    <Col md="4">
                        <Card>
                            <CardBody>
                                <h4 className="mt-0 header-title mb-4">INVOICES HISTORY</h4>
                                <div id="ct-donut" className="ct-chart wid pt-4">
                                    <InvoiceHistory />
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md="4">
                        <Card>
                            <CardBody>
                                <h4 className="mt-0 header-title mb-4">TICKET HISTORY</h4>
                                <div id="ct-donut" className="ct-chart wid pt-4">
                                    <TicketHistory />
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md="4">
                        <Card>
                            <CardBody>
                                <h4 className="mt-0 header-title mb-4">SMS SUCCESS HISTORY</h4>
                                {/*<div className="cleafix">
                                    <p className="float-left"><i className="mdi mdi-calendar mr-1 text-primary"></i> Jan 01 - Jan 31</p>
                                    <h5 className="font-18 text-right">$4230</h5>
                                </div>*/}
                                <div id="ct-donut" className="ct-chart wid pt-4">
                                    <SmsSuccessHistory />
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/*<Row>
                    <Col xl="3" md="6">
                        <Card className="mini-stat bg-primary text-white">
                            <CardBody>
                                <div className="mb-4">
                                    <div className="float-left mini-stat-img mr-4">
                                        <img src={img1} alt="" />
                                    </div>
                                    <h5 className="font-16 text-uppercase mt-0 text-white">Orders</h5>
                                    <h4 className="font-500">1,685 <i className="mdi mdi-arrow-up text-success ml-2"></i></h4>
                                    <div className="mini-stat-label bg-success">
                                        <p className="mb-0">+ 12%</p>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <div className="float-right">
                                        <Link to="#" className="text-white-50"><i className="mdi mdi-arrow-right h5"></i></Link>
                                    </div>
                                    <p className="text-white-50 mb-0">Since last month</p>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl="3" md="6">
                        <Card className="mini-stat bg-primary text-white">
                            <CardBody>
                                <div className="mb-4">
                                    <div className="float-left mini-stat-img mr-4">
                                        <img src={img2} alt="" />
                                    </div>
                                    <h5 className="font-16 text-uppercase mt-0 text-white">Revenue</h5>
                                    <h4 className="font-500">52,368 <i className="mdi mdi-arrow-down text-danger ml-2"></i></h4>
                                    <div className="mini-stat-label bg-danger">
                                        <p className="mb-0">- 28%</p>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <div className="float-right">
                                        <Link to="#" className="text-white-50"><i className="mdi mdi-arrow-right h5"></i></Link>
                                    </div>
                                    <p className="text-white-50 mb-0">Since last month</p>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl="3" md="6">
                        <Card className="mini-stat bg-primary text-white">
                            <CardBody>
                                <div className="mb-4">
                                    <div className="float-left mini-stat-img mr-4">
                                        <img src={img3} alt="" />
                                    </div>
                                    <h5 className="font-16 text-uppercase mt-0 text-white">Average Price</h5>
                                    <h4 className="font-500">15.8 <i className="mdi mdi-arrow-up text-success ml-2"></i></h4>
                                    <div className="mini-stat-label bg-info">
                                        <p className="mb-0"> 00%</p>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <div className="float-right">
                                        <Link to="#" className="text-white-50"><i className="mdi mdi-arrow-right h5"></i></Link>
                                    </div>
                                    <p className="text-white-50 mb-0">Since last month</p>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl="3" md="6">
                        <Card className="mini-stat bg-primary text-white">
                            <CardBody>
                                <div className="mb-4">
                                    <div className="float-left mini-stat-img mr-4">
                                        <img src={img4} alt="" />
                                    </div>
                                    <h5 className="font-16 text-uppercase mt-0 text-white">Product Sold</h5>
                                    <h4 className="font-500">2436 <i className="mdi mdi-arrow-up text-success ml-2"></i></h4>
                                    <div className="mini-stat-label bg-warning">
                                        <p className="mb-0">+ 84%</p>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <div className="float-right">
                                        <Link to="#" className="text-white-50"><i className="mdi mdi-arrow-right h5"></i></Link>
                                    </div>

                                    <p className="text-white-50 mb-0">Since last month</p>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>*/}

                <Row>
                    <Col xl="12">
                        <Card>
                            <CardBody>
                                <h4 className="mt-0 header-title mb-5">SMS HISTORY BY DATE</h4>
                                <Row>
                                    <Col lg="12">
                                        <div>
                                            <SmsHistoryByDate />
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/*<Row>
                    <Col xl="3">
                        <Card>
                            <CardBody>
                                <h4 className="mt-0 header-title mb-4">Sales Report</h4>
                                <div className="cleafix">
                                    <p className="float-left"><i className="mdi mdi-calendar mr-1 text-primary"></i> Jan 01 - Jan 31</p>
                                    <h5 className="font-18 text-right">$4230</h5>
                                </div>
                                <div id="ct-donut" className="ct-chart wid pt-4">
                                    <Salesdonut />
                                </div>
                                <div className="mt-4">
                                    <Table className="table mb-0">
                                        <tbody>
                                            <tr>
                                                <td><span className="badge badge-primary">Desk</span></td>
                                                <td>Desktop</td>
                                                <td className="text-right">54.5%</td>
                                            </tr>
                                            <tr>
                                                <td><span className="badge badge-success">Mob</span></td>
                                                <td>Mobile</td>
                                                <td className="text-right">28.0%</td>
                                            </tr>
                                            <tr>
                                                <td><span className="badge badge-warning">Tab</span></td>
                                                <td>Tablets</td>
                                                <td className="text-right">17.5%</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl="4">
                        <Card>
                            <CardBody>
                                <h4 className="mt-0 header-title mb-4">Activity</h4>
                                <ol className="activity-feed">
                                    <li className="feed-item">
                                        <div className="feed-item-list">
                                            <span className="date">Jan 22</span>
                                            <span className="activity-text">Responded to need “Volunteer Activities”</span>
                                        </div>
                                    </li>
                                    <li className="feed-item">
                                        <div className="feed-item-list">
                                            <span className="date">Jan 20</span>
                                            <span className="activity-text">At vero eos et accusamus et iusto odio dignissimos ducimus qui deleniti atque...<Link to="#" className="text-success">Read more</Link></span>
                                        </div>
                                    </li>
                                    <li className="feed-item">
                                        <div className="feed-item-list">
                                            <span className="date">Jan 19</span>
                                            <span className="activity-text">Joined the group “Boardsmanship Forum”</span>
                                        </div>
                                    </li>
                                    <li className="feed-item">
                                        <div className="feed-item-list">
                                            <span className="date">Jan 17</span>
                                            <span className="activity-text">Responded to need “In-Kind Opportunity”</span>
                                        </div>
                                    </li>
                                    <li className="feed-item">
                                        <div className="feed-item-list">
                                            <span className="date">Jan 16</span>
                                            <span className="activity-text">Sed ut perspiciatis unde omnis iste natus error sit rem.</span>
                                        </div>
                                    </li>
                                </ol>
                                <div className="text-center">
                                    <Link to="#" className="btn btn-primary">Load More</Link>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl="5">
                        <Row>
                            <Col md="6">
                                <Card className="text-center">
                                    <CardBody>
                                        <div className="py-4">
                                            <i className="ion ion-ios-checkmark-circle-outline display-4 text-success"></i>
                                            <h5 className="text-primary mt-4">Order Successful</h5>
                                            <p className="text-muted">Thanks you so much for your order.</p>
                                            <div className="mt-4">
                                                <Link to="#" className="btn btn-primary btn-sm">Chack Status</Link>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col md="6">
                                <Card className="bg-primary">
                                    <CardBody>
                                        <div className="text-center text-white py-4">
                                            <h5 className="mt-0 mb-4 text-white-50 font-16">Top Product Sale</h5>
                                            <h1>1452</h1>
                                            <p>Computer</p>
                                            <p className="text-white-50 mb-0">At solmen va esser necessi far uniform myth...
                                            <Link to="#" className="text-white"> View more</Link></p>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Card>
                                    <CardBody>
                                        <h4 className="mt-0 header-title mb-4">Client Reviews</h4>
                                        <p className="text-muted mb-5">" Everyone realizes why a new common language would be desirable one could refuse to pay expensive translators it would be necessary. "</p>
                                        <div className="float-right mt-2">
                                            <Link to="#" className="text-primary">
                                                <i className="mdi mdi-arrow-right h5"></i>
                                            </Link>
                                        </div>
                                        <h6 className="mb-0">
                                            <img src={user3} alt="" className="thumb-sm rounded-circle mr-2" /> James Athey
                                        </h6>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>*/}

                <Row>
                    <Col xl="6">
                        <Card>
                            <CardBody>
                                <h4 className="mt-0 header-title mb-4">RECENT 5 INVOICES</h4>
                                <div className="table-responsive">
                                    <Table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th scope="col">SL</th>
                                                <th scope="col">AMOUNT</th>
                                                <th scope="col">DUE DATE</th>
                                                <th scope="col" colSpan="2">STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th scope="row">#1</th>
                                                <td>$94</td>
                                                <td>15th Dec 2018</td>
                                                <td><span className="badge badge-success">Paid</span></td>
                                            </tr>
                                            <tr>
                                                <th scope="row">#2</th>
                                                <td>$112</td>
                                                <td>16th Feb 2019</td>
                                                <td><span className="badge badge-warning">Unpaid</span></td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl="6">
                        <Card>
                            <CardBody>
                                <h4 className="mt-0 header-title mb-4">RECENT 5 SUPPORT TICKETS</h4>
                                <div className="table-responsive">
                                    <Table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th scope="col">SL</th>
                                                <th scope="col">SUBJECT</th>
                                                <th scope="col">DATE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th scope="row">#1</th>
                                                <td><p>Ultimate SMS Customization Invoice</p></td>
                                                <td>16th Jan 2019</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">#2</th>
                                                <td><p>Ultimate SMS Invoice</p></td>
                                                <td>17th Jan 2019</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                </Row>

            </Container>

        </React.Fragment>
    );
}
