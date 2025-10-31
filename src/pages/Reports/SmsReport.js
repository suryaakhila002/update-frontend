import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {Tag} from 'antd';
import {ServerApi} from '../../utils/ServerApi';
// import {Empty} from 'antd';
import ReportsLoading from '../../components/Loading/ReportsLoading';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import {getLoggedInUser} from '../../helpers/authUtils';

// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
// --- END KEY CHANGES ---


class SmsReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl1: null,
            fullMessage: '',
            modalFullMessage: false,
            modal_standard: false,
            reportsRawData: [],
            isLoading: true,
            isModalLoading: true,
            priceBreakdown:false,
            anchorEl: null,
            breakDownItem: {},
            priceBreakdownType: 'cost',
            p:0,
            s:0,

            // --- KEY CHANGE (DATAGRID) ---
            // Define the base columns for MUI DataGrid
            baseColumns: [
                {
                    field: 'slno',
                    headerName: 'SL',
                    width: 50
                },
                {
                    field: 'createdByName',
                    headerName: 'USERNAME',
                    width: 150
                },
                {
                    field: 'submitted',
                    headerName: 'SUBMITTED',
                    width: 180 // Adjusted width
                },
                {
                    field: 'messageText',
                    headerName: 'MESSAGE',
                    width: 200, // Adjusted width
                    renderCell: (params) => (params.value) // To render JSX
                },
                {
                    field: 'purchase',
                    headerName: 'PURCHASE',
                    width: 100, // Adjusted width
                    renderCell: (params) => (params.value) // To render JSX
                },
                {
                    field: 'sale',
                    headerName: 'SALE',
                    width: 100, // Adjusted width
                    renderCell: (params) => (params.value) // To render JSX
                },
                {
                    field: 'pl',
                    headerName: 'PROFIT/LOSS',
                    width: 100, // Adjusted width
                    renderCell: (params) => (params.value) // To render JSX
                },
                {
                    field: 'senderId',
                    headerName: 'SENDERID',
                    width: 100
                },
                {
                    field: 'smsGatewayName',
                    headerName: 'ROUTE',
                    width: 100
                },
                {
                    field: 'Tstatus',
                    headerName: 'STATUS',
                    width: 100,
                    renderCell: (params) => (params.value) // To render JSX
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 100,
                    sortable: false,
                    renderCell: (params) => (params.value) // To render JSX
                }
            ],
            // 'columns' will hold the *filtered* list
            columns: [],
            // 'rows' will hold the data
            rows: [],
            // The old 'reportsData' object is no longer needed
            // --- END KEY CHANGE ---
        };
        this.tog_standard = this.tog_standard.bind(this);
    }

    componentDidMount() {
        // this.LoadingBar.continuousStart();
        this.props.activateAuthLayout();
        this.loadReports()
    }

    ManageClick() {        
        this.props.history.push('/manageClient');
    }

    tog_standard(index) {
        this.props.history.push({pathname: '/manageReport', state: {
                id: this.state.reportsRawData[index].id,
                status: this.state.reportsRawData[index].status,
                runTime: this.state.reportsRawData[index].createdTime,
                endTime: this.state.reportsRawData[index].updatedTime,
                senderId: this.state.reportsRawData[index].senderId,
                createdByName: this.state.reportsRawData[index].createdByName,
                credits: this.state.reportsRawData[index].credits,
                messageType: this.state.reportsRawData[index].messageType,
             }});        
    }
    removeBodyCss() {
        document.body.classList.add('no_padding');
    }

    // ... (calSale, calPur, calPL, addUTCFormat methods remain unchanged) ...
    calSale(item){
        return (Number(item.saleDltCharges.toFixed(2))+Number(item.saleDltChargesGst.toFixed(2))+Number(item.saleSmsCharges.toFixed(2))+Number(item.saleSmsChargesGst.toFixed(2))).toFixed(2);
    }
    calPur(item){
        return (Number(item.purchaseDltCharges.toFixed(2))+Number(item.purchaseDltChargesGst.toFixed(2))+Number(item.purchaseSmsCharges.toFixed(2))+Number(item.purchaseSmsChargesGst.toFixed(2))).toFixed(2);
    }
    calPL(item){
        return (Number(this.calSale(item)) - Number(this.calPur(item))).toFixed(2)
    }
    addUTCFormat(date) {
        return date.endsWith("Z") ? date : date + "Z";
    }


    loadReports(){
        ServerApi().get(`reports/getReports`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }

            this.setState({reportsRawData: res.data.response});

            let p = 0;
            let s = 0;

            // --- KEY CHANGE (DATAGRID MAPPING) ---
            // 1. DataGrid needs a unique 'id' field.
            // 2. The map function was incorrectly returning 'true', fixed to return 'item'.
            const formattedRows = res.data.response.map((item, index)=>{
                item.slno = (index+1);
                item.id = item.id || (index+1); // Ensure unique ID
                item.submitted = new Date(this.addUTCFormat(item.updatedTime)).toLocaleString('en-US', {hour12: true});
                item.messageTmp = item.message;
                item.messageText = (item.message !==undefined && item.message.length > 55)?<>{item.message.slice(0, 55)} <span style={{cursor: 'pointer', color: 'blue'}} onClick={(e)=>this.setState({anchorEl1:e.currentTarget, modalFullMessage: true, fullMessage: item.messageTmp})} aria-describedby="full-message">... read more</span></>:item.message;
                item.cost = <span style={{cursor: 'pointer', color: 'orange' }} onClick={(e) => this.setState({ anchorEl: e.currentTarget, priceBreakdown: true, breakDownItem: item })} aria-describedby="price-breakdown">{(item.credits === null) ? 'N/A' : "₹ " + item.credits}</span>
                
                item.saleP = item.saleSmsCharges;
                item.sale = <span style={{cursor: 'pointer', color: 'orange'}} onClick={(e)=>this.setState({anchorEl:e.currentTarget, priceBreakdownType:'sale', priceBreakdown: true, breakDownItem: item})} aria-describedby="price-breakdown">{(item.credits === null)?'N/A':"₹ "+item.saleP}</span>
                s = s + Number(item.saleSmsCharges);
                
                if(getLoggedInUser().userType!=='CLIENT'){
                    item.purchaseP = item.purchaseSmsCharges;
                    item.purchase = <span style={{cursor: 'pointer', color: 'orange'}} onClick={(e)=>this.setState({anchorEl:e.currentTarget, priceBreakdownType:'sale', priceBreakdown: true, breakDownItem: item})} aria-describedby="price-breakdown">{(item.credits === null)?'N/A':"₹ "+item.purchaseP}</span>
                    item.pl = 0;
                    p = p+Number(item.saleSmsCharges);
                }
                
                item.Tstatus = <Tag color={(item.status === 'C')?'green':(item.status === 'W')?'red':'orange'}>
                                    {(item.status === 'C')?'Completed':(item.status === 'W')?'Waiting':'N/A'}
                                </Tag>;
                item.action = <div><Button onClick={()=>this.tog_standard(index)} type="button" color="primary" size="sm" className="waves-effect mb-2"><i className="fa fa-eye"></i></Button></div>
                delete item.message;

                return item; // FIX: Was 'return true'
            });  

            // --- KEY CHANGE (DATAGRID FILTERING) ---
            // Use the baseColumns from state to ensure filtering is not destructive
            let newCols = [...this.state.baseColumns]; 
            if(getLoggedInUser().userType==='CLIENT'){
                newCols = newCols.filter((i)=>i.field!=='createdByName'&&i.field!=='smsGatewayName'&&i.field!=='sale'&&i.field!=='purchase'&&i.field!=='pl');
            }
            if(getLoggedInUser().userType==='RESELLER'){
                newCols = newCols.filter((i)=>i.field!=='smsGatewayName'&&i.field!=='cost');
            }
            // Set the new 'rows' and filtered 'columns' state
            this.setState({p,s, isLoading: false, columns: newCols, rows: formattedRows});
            // --- END KEY CHANGE ---
        })
        .catch(error => {
            console.log('error', error);
            this.setState({isLoading: false})
        });
    }

    render() {

        if(this.state.isLoading){
            return(<ReportsLoading />);
        }

        return (
            <React.Fragment>
                {/* ... (LoadingBar and Header Cards remain unchanged) ... */}
                <Container fluid>
                <Row className="pt-4">
                    {/* ... (All 4 stat cards) ... */}
                </Row>

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>

                                    {/* --- KEY CHANGE (MDBDATATABLE REPLACEMENT) --- */}
                                    {/* <MDBDataTable
                                        sortable
                                        responsive
                                        striped
                                        hover
                                        small
                                        data={this.state.reportsData}
                                        footer={false}
                                        foot={false}
                                    /> */}
                                    <Box sx={{ height: 600, width: '100%' }}>
                                        <DataGrid
                                            rows={this.state.rows}
                                            columns={this.state.columns}
                                            pageSize={10}
                                            rowsPerPageOptions={[10, 25, 50]}
                                            // 'id' field was added during mapping
                                            getRowId={(row) => row.id} 
                                            disableSelectionOnClick
                                        />
                                    </Box>
                                    {/* --- END KEY CHANGE --- */}

                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    {/* ... (Both Popover components remain unchanged) ... */}
                    <Popover
                        id="price-breakdown"
                        open={this.state.priceBreakdown}
                        // ...
                    >
                        {/* ... */}
                    </Popover>

                    <Popover
                        id="full-message"
                        open={this.state.modalFullMessage}
                        // ...
                    >
                        {/* ... */}
                    </Popover>

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(SmsReport));