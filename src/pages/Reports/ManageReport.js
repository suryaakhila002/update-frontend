import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { MDBDataTable } from 'mdbreact';
import classnames from 'classnames';
import {ServerApi} from '../../utils/ServerApi';
import {Tag} from 'antd';
import ReportsLoading from '../../components/Loading/ReportsLoading';


//Images
import img1 from '../../images/ATSICONS/Campaning Icons/RECIPIENTS.png';
import img2 from '../../images/ATSICONS/Campaning Icons/deliver.png';
import img3 from '../../images/ATSICONS/Campaning Icons/FAILED.png';
import img4 from '../../images/ATSICONS/Campaning Icons/pending.png';

//chart
import SmsReport from '../AllCharts/apex/smsReport';


export default function ManageReport(props){

    const dispatch = useDispatch(); 

    const location = useLocation();

    const [activeTab_border1, setActiveTab_border1] = useState('13');
    // const [reportsRawData, setReportsRawData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [recipents, setRecipents] = useState(0);
    
    const [delivered, setDelivered] = useState(0);
    const [submitted, setSubmitted] = useState(0);
    const [dnd, setDnd] = useState(0);
    const [expired, setExpired] = useState(0);
    const [undelivered, setUndelivered] = useState(0);
    const [rejected, setRejected] = useState(0);
    const [pending, setPending] = useState(0);

    const [dataModal, setDataModal] = useState({
        columns: [
            {
                label: 'SL' ,
                field: 'slno',
                sort: 'asc',
                width: 50
            },
            {
                label: 'MOBILE' ,
                field: 'mobile',
                sort: 'asc',
                width: 150
            },
            // {
            //     label: 'MESSAGE',
            //     field: 'messageText',
            //     sort: 'asc',
            //     width: 150
            // },
            // {
            //     label: 'SENDERID',
            //     field: 'senderId',
            //     sort: 'asc',
            //     width: 100
            // },
            // {
            //     label: 'COST',
            //     field: 'cost',
            //     sort: 'asc',
            //     width: 100
            // },
            {
                label: 'SUBMITED ON',
                field: 'submittedOn',
                sort: 'asc',
                width: 150
            },
            {
                label: 'DELIVERD ON',
                field: 'deliveredOn',
                sort: 'asc',
                width: 100
            },
            {
                label: 'STATUS',
                field: 'status',
                sort: 'asc',
                width: 100
            },
        ],
        rows: [
            
        ]
    });

    useEffect(()=>{
        dispatch({type: 'auth_layout', payload:{topbar: true,sidebar: true,footer: true,layoutType: 'Auth'}})
    },[dispatch])


    const t_border1=(tab)=>{
        if (activeTab_border1 !== tab) {
            setActiveTab_border1(tab)
        }
    }

    // const prepareTableData=(id)=>{
    //     ServerApi().get('reports/getDetailedReports/'+id)
    //         .then(res => {
    //             let recipents = res.data.response.length;
    //             let delivered = 0;
    //             let failed = 0;
    //             let queued = 0;

    //             res.data.response.map((item, index) => {
                    
    //                 delivered = (item.status === 'D' || item.status === 'C')?delivered+1:delivered;
    //                 failed = (item.status === 'F')?failed+1:failed;
    //                 queued = (item.status === 'W')?queued+1:queued;
                    
    //                 item.slno = (index+1);
    //                 item.mobile = item.msisdn;
    //                 item.messageText = item.message;
    //                 item.submittedOn = new Date(item.submitDate).toLocaleString('en-US', {hour12: true});
    //                 item.deliveredOn = new Date(item.deliveredDate).toLocaleString('en-US', {hour12: true});
    //                 item.status = <Tag color={(item.status === 'DONE')?'green':'red'}>{(item.status === 'DONE')?'Delivered':(item.status === 'W')?'Waiting':'Undelivered'}</Tag>;
    //                 delete item.message;
    //                 return true;
    //             });  
        
    //             let newTableDataRowsModal = [...dataModal.rows];
    //             newTableDataRowsModal = res.data.response;
    //             setRecipents(recipents);
    //             setDelivered(delivered);
    //             setFailed(failed);
    //             setQueued(queued);
    //             setIsLoading(false);
    //             setDataModal({...dataModal, rows: newTableDataRowsModal})
    //         })
    //         .catch(error => console.log('error', error));

    //     console.log(id);
    //     // if (this.state.reportsRawData[index] === undefined) { return false } 
    // }

    useEffect(()=>{
        ServerApi().get('reports/getDetailedReports/'+location.state.id)
            .then(res => {
                let recipents = res.data.response.length;
                let submitted_stat = 0;
                let delivered_stat = 0;
                let undelivered_stat = 0;
                let expired_stat = 0;
                let rejected_stat = 0;
                let dnd_stat = 0;
                let pending_stat = 0;

                res.data.response.map((item, index) => {
                    
                    submitted_stat = (item.status === 'C')?submitted_stat+1:submitted_stat;
                    delivered_stat = (item.status === 'DELIV')?delivered_stat+1:delivered_stat;
                    undelivered_stat = (item.status === 'UNDEL')?undelivered_stat+1:undelivered_stat;
                    expired_stat = (item.status === 'EXPIR')?expired_stat+1:expired_stat;
                    rejected_stat = (item.status === 'REJEC')?rejected+1:rejected;
                    dnd_stat = (item.status === 'DND')?dnd_stat+1:dnd_stat;
                    pending_stat = (item.status === 'W')?pending_stat+1:pending_stat;
                    // queued = (item.status === 'W')?queued+1:queued;
                    
                    item.slno = (index+1);
                    item.mobile = item.msisdn;
                    // item.messageText = item.message;
                    // item.cost = 'N/A';
                    item.submittedOn = item.submitDate ? new Date(item.submitDate).toLocaleString('en-US', {hour12: true}) : "";
                    item.deliveredOn = (item.deliveredDate === null) ?
                        (item.submitDate ? new Date(item.submitDate).toLocaleString('en-US', {hour12: true}) : "") :
                        new Date(item.deliveredDate).toLocaleString('en-US', { hour12: true });
                    item.status = <Tag color={(item.status === 'DELIV')?'green':(item.status === 'C')?'blue':(item.status === 'UNDEL')?'orange':(item.status==='W')?'yellow':'red'}>
                                        {(item.status === 'C')?'SUBMITTED':(item.status === 'REJEC')?'REJECTED':(item.status === 'UNDEL')?'UNDELIVERED':(item.status==='EXPIR')?'EXPIRED':(item.status==='W')?'Pending':(item.status === 'DELIV')?'DELIVERED':item.status}
                                    </Tag>;

                    //item.status = <Tag color={(item.status === 'C')?'green':'red'}>{(item.status === 'C')?'Delivered':(item.status === 'W')?'Waiting':'Undelivered'}</Tag>;
                    delete item.message;
                    return true;
                });  
        
                let newTableDataRowsModal = [...dataModal.rows];
                newTableDataRowsModal = res.data.response;
                setRecipents(recipents);
                setDelivered(delivered_stat);
                setUndelivered(undelivered_stat);
                setRejected(rejected_stat);
                setExpired(expired_stat);
                setDnd(dnd_stat);
                setSubmitted(submitted_stat);
                setPending(pending_stat);
                // setQueued(queued);
                setIsLoading(false);
                setDataModal({...dataModal, rows: newTableDataRowsModal})
            })
            .catch(error => console.log('error', error));

        console.log(location.state.id);

        // prepareTableData(location.state.id)
        // eslint-disable-next-line
    },[]);

    const addUTCFormat = (date) => {
        return date.endsWith("Z") ? date : date + "Z";
    }

    if (isLoading) { 
        return(
            <ReportsLoading />
        )
    } 

    return (
        <React.Fragment>
            
            <Container fluid>
                <div className="page-title-box">
                    <Row className="align-items-center">
                        <Col sm="6">
                            <h4 className="page-title">CAMPAIGN DETAILS</h4>
                        </Col>
                    </Row>
                </div>

                <Row>                        
                    <Col lg="12" md="12">
                        <div>
                            <div>

                                <Nav tabs className="nav-tabs">
                                    <NavItem>
                                        <NavLink className={classnames({ active: activeTab_border1 === '13' })}
                                            onClick={() => { t_border1('13'); }}>
                                            <span className="d-block d-sm-none"><i className="fas fa-home"></i></span>
                                            <span className="d-none d-sm-block">Overview</span>
                                        </NavLink>
                                    </NavItem>

                                    <NavItem>
                                        <NavLink className={classnames({ active: activeTab_border1 === '14' })}
                                            onClick={() => { t_border1('14'); }}>
                                            <span className="d-block d-sm-none"><i className="fas fa-user"></i></span>
                                            <span className="d-none d-sm-block">Recipents</span>
                                        </NavLink>
                                    </NavItem>
                                </Nav>


                                <TabContent activeTab={activeTab_border1}>
                                    <TabPane className="tab-panel-border bg-white p-3" tabId="13">
                                        <Row>
                                            <Col xl="3" md="3">
                                                <Card className="mini-stat bg-info text-white">
                                                    <CardBody>
                                                        <div className="mb-4">
                                                            <div className="float-left mini-stat-img mr-4">
                                                                <img src={img1} alt="..." />
                                                            </div>
                                                            <h5 style={{fontSize: 14}} className="text-uppercase mt-0 text-white">Recipients</h5>
                                                            <h4 className="font-500 text-white">{recipents}</h4>
                        
                                                        </div>
                                                        
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            <Col xl="3" md="3">
                                                <Card className="mini-stat bg-success text-white">
                                                    <CardBody>
                                                        <div className="mb-4">
                                                            <div className="float-left mini-stat-img mr-4">
                                                                <img src='/static/media/Quick SMS.7566ca06.png' alt="..." />
                                                            </div>
                                                            <h5 style={{fontSize: 14}} className="text-uppercase mt-0 text-white"> Delivered</h5>
                                                            <h4 className="font-500 text-white">{delivered}</h4>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            <Col xl="3" md="3">
                                                <Card className="mini-stat bg-warning text-white">
                                                    <CardBody>
                                                        <div className="mb-4">
                                                            <div className="float-left mini-stat-img mr-4">
                                                                <img src={img4} alt="images" />
                                                            </div>
                                                            <h5 style={{fontSize: 14}} className="text-uppercase mt-0 text-white">Pending</h5>
                                                            <h4 className="font-500 text-white">{pending}</h4>
                                                            
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            <Col xl="3" md="3">
                                                <Card className="mini-stat bg-red text-white">
                                                    <CardBody>
                                                        <div className="mb-4">
                                                            <div className="float-left mini-stat-img mr-4">
                                                                <img src={img3} alt="..." />
                                                            </div>
                                                            <h5 style={{fontSize: 14}} className="text-uppercase mt-0 text-white">Rejected</h5>
                                                            <h4 className="font-500 text-white">{rejected}</h4>
                                                            
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col xl="3" md="3">
                                                <Card className="mini-stat bg-primary text-white">
                                                    <CardBody>
                                                        <div className="mb-4">
                                                            <div className="float-left mini-stat-img mr-4">
                                                                <img src={img2} alt="..." />
                                                            </div>
                                                            <h5 style={{fontSize: 14}} className="text-uppercase mt-0 text-white">Submitted</h5>
                                                            <h4 className="font-500 text-white">{submitted}</h4>
                                                        </div>
                                                        
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            <Col xl="3" md="3">
                                                <Card className="mini-stat bg-danger text-white">
                                                    <CardBody>
                                                        <div className="mb-4">
                                                            <div className="float-left mini-stat-img mr-4">
                                                                <img src={img3} alt="..." />
                                                            </div>
                                                            <h5 style={{fontSize: 12}} className="text-uppercase mt-0 text-white">Undelivered</h5>
                                                            <h4 className="font-500 text-white">{undelivered}</h4>
                                                        </div>
                                                        
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            <Col xl="3" md="3">
                                                <Card className="mini-stat bg-orange text-white">
                                                    <CardBody>
                                                        <div className="mb-4">
                                                            <div className="float-left mini-stat-img mr-4">
                                                                <img src={img3} alt="..." />
                                                            </div>
                                                            <h5 style={{fontSize: 14}} className="text-uppercase mt-0 text-white">Expired</h5>
                                                            <h4 className="font-500 text-white">{expired}</h4>
                                                        </div>
                                                        
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            <Col xl="3" md="3">
                                                <Card className="mini-stat bg-brown text-white">
                                                    <CardBody>
                                                        <div className="mb-4">
                                                            <div className="float-left mini-stat-img mr-4">
                                                                <img src={img3} alt="..." />
                                                            </div>
                                                            <h5 style={{fontSize: 14}} className="text-uppercase mt-0 text-white">DND</h5>
                                                            <h4 className="font-500 text-white">{dnd}</h4>
                                                        </div>
                                                        
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col sm="12" lg="6">
                                                <Row>
                                                    <Col className="text-center" sm="12" lg="6">
                                                        <p><b>CAMPAIGN DETAILS</b></p>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col xs="4" sm="4" md="4">
                                                        <p>CREATED BY </p>
                                                    </Col>
                                                    <Col xs="1" sm="1" md="1">
                                                        <p> : </p>
                                                    </Col>
                                                    <Col xs="6" sm="6" md="6">
                                                        <p className="float-left">{location.state.createdByName}</p>
                                                    </Col>
                                                </Row>
                                                {/* <Row>
                                                    <Col xs="4" sm="4" md="4">
                                                        <p>CREDIT PER SMS </p>
                                                    </Col>
                                                    <Col xs="1" sm="1" md="1">
                                                        <p> : </p>
                                                    </Col>
                                                    <Col xs="6" sm="6" md="6">
                                                        <p className="float-left">{recipents/location.state.credits}</p>
                                                    </Col>
                                                </Row> */}
                                                <Row>
                                                    <Col xs="4" sm="4" md="4">
                                                        <p>CAMPAIGN ID </p>
                                                    </Col>
                                                    <Col xs="1" sm="1" md="1">
                                                        <p> : </p>
                                                    </Col>
                                                    <Col xs="6" sm="6" md="6">
                                                        <p className="float-left">{location.state.id}</p>
                                                    </Col>
                                                </Row>
                                                {/*<Row>
                                                    <Col xs="4" sm="4" md="4">
                                                        <p>CAMPAIGN TYPE </p>
                                                    </Col>
                                                    <Col xs="1" sm="1" md="1">
                                                        <p> : </p>
                                                    </Col>
                                                    <Col xs="6" sm="6" md="6">
                                                        <p className="float-left">{'Regular'}</p>
                                                    </Col>
                                                </Row>*/}
                                                <Row>
                                                    <Col xs="4" sm="4" md="4">
                                                        <p>SMS TYPE </p>
                                                    </Col>
                                                    <Col xs="1" sm="1" md="1">
                                                        <p> : </p>
                                                    </Col>
                                                    <Col xs="6" sm="6" md="6">
                                                        <p className="float-left">{String(location.state.messageType)}</p>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col xs="4" sm="4" md="4">
                                                        <p>STATUS </p>
                                                    </Col>
                                                    <Col xs="1" sm="1" md="1">
                                                        <p> : </p>
                                                    </Col>
                                                    <Col xs="6" sm="6" md="6">
                                                        <p className="float-left">
                                                            <Tag color={(location.state.status === 'DELIV')?'green':(location.state.status === 'C')?'blue':(location.state.status === 'UNDEL')?'orange':'red'}>
                                                                {(location.state.status === 'C')?'COMPLETED':(location.state.status === 'REJEC')?'REJECTED':(location.state.status === 'UNDEL')?'UNDELIVERED':(location.state.status==='EXPIR')?'EXPIRED':(location.state.status === 'DELIV')?'DELIVERED':location.state.status}
                                                            </Tag>
                                                        </p>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col xs="4" sm="4" md="4">
                                                        <p>SENDER ID </p>
                                                    </Col>
                                                    <Col xs="1" sm="1" md="1">
                                                        <p> : </p>
                                                    </Col>
                                                    <Col xs="6" sm="6" md="6">
                                                        <p className="float-left">{location.state.senderId}</p>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col xs="4" sm="4" md="4">
                                                        <p>RUN AT </p>
                                                    </Col>
                                                    <Col xs="1" sm="1" md="1">
                                                        <p> : </p>
                                                    </Col>
                                                    <Col xs="6" sm="6" md="6">
                                                        <p className="float-left">{new Date(addUTCFormat(location.state.runTime)).toLocaleString('en-US', { hour12: true })}</p>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col xs="4" sm="4" md="4">
                                                        <p>DELIVERED AT </p>
                                                    </Col>
                                                    <Col xs="1" sm="1" md="1">
                                                        <p> : </p>
                                                    </Col>
                                                    <Col xs="6" sm="6" md="6">
                                                        <p className="float-left">{new Date(addUTCFormat(location.state.endTime)).toLocaleString('en-US', { hour12: true })}</p>
                                                    </Col>
                                                </Row>
                                            </Col>

                                            <Col sm="12" lg="6">
                                                <Row>
                                                    <Col className="text-center" sm="12" lg="12">
                                                        <p className="text-center"><b>CAMPAIGN STATUS</b></p>
                                                    </Col>
                                                </Row>

                                                <SmsReport graphData={[delivered, undelivered, submitted, rejected, dnd, expired, pending]} />
                                            
                                            </Col>

                                        </Row>
                                        
                                    </TabPane>


                                    <TabPane className="tab-panel-border bg-white p-3" tabId="14">
                                        <MDBDataTable
                                            sortable
                                            responsive
                                            striped
                                            hover
                                            small
                                            data={dataModal}
                                            footer={false}
                                            foot={false}
                                        />
                                    </TabPane>
                                </TabContent>

                            </div>
                        </div>
                    </Col>
                </Row>

            </Container>
        </React.Fragment>
    );
}

// export default withRouter(connect(null, { activateAuthLayout, updateSmsBalance })(ManageReport));