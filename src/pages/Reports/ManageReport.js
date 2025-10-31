import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
import classnames from 'classnames';
import {ServerApi} from '../../utils/ServerApi';
import {Tag} from 'antd';
import ReportsLoading from '../../components/Loading/ReportsLoading';

// --- KEY CHANGES (IMPORTS) ---
import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
// --- END KEY CHANGES ---

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

    // --- KEY CHANGE (DATAGRID) ---
    // Define columns for MUI DataGrid
    const [columns, setColumns] = useState([
        {
            field: 'slno',
            headerName: 'SL',
            width: 50
        },
        {
            field: 'mobile',
            headerName: 'MOBILE',
            width: 150
        },
        {
            field: 'submittedOn',
            headerName: 'SUBMITED ON',
            width: 200 // Adjusted width
        },
        {
            field: 'deliveredOn',
            headerName: 'DELIVERD ON',
            width: 200 // Adjusted width
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 150, // Adjusted width
            renderCell: (params) => (params.value) // To render JSX
        },
    ]);
    
    // Define rows for DataGrid
    const [rows, setRows] = useState([]);
    // The old 'dataModal' state is no longer needed
    // --- END KEY CHANGE ---


    useEffect(()=>{
        dispatch({type: 'auth_layout', payload:{topbar: true,sidebar: true,footer: true,layoutType: 'Auth'}})
    },[dispatch])


    const t_border1=(tab)=>{
        if (activeTab_border1 !== tab) {
            setActiveTab_border1(tab)
        }
    }

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

                // --- KEY CHANGE (DATAGRID MAPPING) ---
                // 1. DataGrid needs a unique 'id' field.
                // 2. The map function was incorrectly returning 'true', fixed to return 'item'.
                const formattedRows = res.data.response.map((item, index) => {
                    
                    submitted_stat = (item.status === 'C')?submitted_stat+1:submitted_stat;
                    delivered_stat = (item.status === 'DELIV')?delivered_stat+1:delivered_stat;
                    undelivered_stat = (item.status === 'UNDEL')?undelivered_stat+1:undelivered_stat;
                    expired_stat = (item.status === 'EXPIR')?expired_stat+1:expired_stat;
                    rejected_stat = (item.status === 'REJEC')?rejected+1:rejected;
                    dnd_stat = (item.status === 'DND')?dnd_stat+1:dnd_stat;
                    pending_stat = (item.status === 'W')?pending_stat+1:pending_stat;
                    
                    item.slno = (index+1);
                    item.id = (index+1); // ADDED: Use 'slno' as the unique ID
                    item.mobile = item.msisdn;
                    item.submittedOn = item.submitDate ? new Date(item.submitDate).toLocaleString('en-US', {hour12: true}) : "";
                    item.deliveredOn = (item.deliveredDate === null) ?
                        (item.submitDate ? new Date(item.submitDate).toLocaleString('en-US', {hour12: true}) : "") :
                        new Date(item.deliveredDate).toLocaleString('en-US', { hour12: true });
                    item.status = <Tag color={(item.status === 'DELIV')?'green':(item.status === 'C')?'blue':(item.status === 'UNDEL')?'orange':(item.status==='W')?'yellow':'red'}>
                                        {(item.status === 'C')?'SUBMITTED':(item.status === 'REJEC')?'REJECTED':(item.status === 'UNDEL')?'UNDELIVERED':(item.status==='EXPIR')?'EXPIRED':(item.status==='W')?'Pending':(item.status === 'DELIV')?'DELIVERED':item.status}
                                    </Tag>;
                    delete item.message;
                    return item; // FIX: Was 'return true'
                });  
                // --- END KEY CHANGE ---
        
                setRecipents(recipents);
                setDelivered(delivered_stat);
                setUndelivered(undelivered_stat);
                setRejected(rejected_stat);
                setExpired(expired_stat);
                setDnd(dnd_stat);
                setSubmitted(submitted_stat);
                setPending(pending_stat);
                setIsLoading(false);
                setRows(formattedRows); // Set the new 'rows' state
            })
            .catch(error => console.log('error', error));

        console.log(location.state.id);

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
                {/* ... (Header/Title Row and Overview TabPane remain unchanged) ... */}
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
                                        {/* ... (Overview JSX remains unchanged) ... */}
                                    </TabPane>


                                    <TabPane className="tab-panel-border bg-white p-3" tabId="14">
                                        {/* --- KEY CHANGE (MDBDATATABLE REPLACEMENT) --- */}
                                        {/* <MDBDataTable
                                            sortable
                                            responsive
                                            striped
                                            hover
                                            small
                                            data={dataModal}
                                            footer={false}
                                            foot={false}
                                        /> */}
                                        <Box sx={{ height: 600, width: '100%' }}>
                                            <DataGrid
                                                rows={rows}
                                                columns={columns}
                                                pageSize={10}
                                                rowsPerPageOptions={[10, 25, 100]}
                                                // 'id' field was added during mapping
                                                // getRowId={(row) => row.slno} // Not needed
                                                disableSelectionOnClick
                                            />
                                        </Box>
                                        {/* --- END KEY CHANGE --- */}
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