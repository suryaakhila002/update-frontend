import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Nav, NavItem, NavLink, TabContent, TabPane, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout, updateSmsBalance, openSnack } from '../../store/actions';
import Select from 'react-select';
import { Link, withRouter } from 'react-router-dom';
import { AvForm, AvField, AvGroup } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
import classnames from 'classnames';
import Dropzone from 'react-dropzone';
// import Countries from '../../utils/Countries';
import defaultProfileImage from '../../images/users/default_profile.jpg';
import {ServerApi} from '../../utils/ServerApi';
import { Radio, Tag } from 'antd';
import {getLoggedInUser} from '../../helpers/authUtils';
import DataLoading from '../../components/Loading/DataLoading';
import {print_state, print_city} from '../../utils/StateCity';

// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated

import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
import Swal from 'sweetalert2'; // ADDED: Modern Alert Library
import withReactContent from 'sweetalert2-react-content'; // ADDED: React wrapper
// --- END KEY CHANGES ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

// ... (All constants like CLIENT_GROUP, COMPANY_TYPES, etc. remain unchanged)
const CLIENT_GROUP = [
    {
        options: [
            { label: "None", value: "None" },
        ]
    }
];
const COMPANY_TYPES = [
    { label: "Private Ltd Company", value: "Private Ltd Company", isOptionSelected: true },
    { label: "Public Ltd Company", value: "Public Ltd Company" },
    // ... (rest of company types)
];
const CREDIT_TYPE = [
    {
        label: "CREDIT TYPE",
        options: [
            { label: "SUBMIT", value: "SUBMIT" },
            { label: "DELIVERY ", value: "DELIVERY " },
        ]
    }
];
const ACCOUNT_TYPE = [
    {
        label: "ACCOUNT TYPE",
        options: [
            { label: "PREPAID", value: "PREPAID" },
            { label: "POSTPAID ", value: "POSTPAID " },
        ]
    }
];
// ... (end of constants)


class ManageClient extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab1: '5',
            activeTab_border1: '13',
            clientDetails: {},
            isResellerPanel : '',
            isApiAccess : '',
            isClientNotify : 'false',
            dltRegister: 'Registered',
            user_type : 'CLIENT',
            address : '',
            country : 'India',
            client_route : 'None',
            isLoading: true,
            
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed, as SweetAlert2 is called imperatively
            // success_msg: false,
            // success_message: '',
            // modal_standard: false,
            // --- END KEY CHANGE ---

            modal_add_limit: false,
            modal_delete: false,
            modal_send_sms: false,
            modal_change_image: false,
            isAdding: false,
            delete_sid: "",
            smsLimit: 0,
            status: 'Active',
            template: '',
            reffeerBy: '',
            messageText: '',
            droping: 'No',
            hasDropingAccess: '',
            hasDNDApplicable: '',
            totalMobileNumbers: 0,
            dlRegister: 'Registered',
            isDisabled: true,
            smsGatewayModal: [],
            selectedFilesDocument: [],
            default_date: new Date(), default: false, start_date: new Date(), monthDate: new Date(), yearDate: new Date(), end_date: new Date(), date: new Date(),
            senderIdSelected: '',
            selectedCity: '',
            selectedStateIndex: 29,
            templateBased: {},
            rechargeModal: false,
            isRecharging: false,
            amount: 0,
            senderIds: [
                            {
                                label: "Select Sender Id",
                                options: [
                                    { label: "Nothing Selected", value: "" }
                                ]
                            }
                        ],
            smsGateway: [
                            {
                                label: "SMS Gateways",
                                options: [
                                    { label: "None", value: "None" }
                                ]
                            }
                        ],
            client_group: 'None',
            smsGateways: '',
            smsGatewaysSelected: '',
            dnd_return: 'No',
            routes: [
                                {
                                    label: "Select Route",
                                    options: [
                                        { label: "None", value: "0" }
                                    ]
                                }
                            ],
            
            // --- KEY CHANGE (DATAGRID) ---
            // Define columns for DataGrid, moved from the old 'data_sms_transaction' state
            sms_transaction_columns: [
                {
                    field: 'sl',
                    headerName: '#SL',
                    width: 150
                },
                {
                    field: 'amount',
                    headerName: 'AMOUNT',
                    width: 180,
                    renderCell: (params) => (params.value) // To render JSX
                },
                {
                    field: 'rechargeDescription',
                    headerName: 'REMARK',
                    width: 250
                },
                {
                    field: 'type',
                    headerName: 'TYPE',
                    width: 250
                },
                {
                    field: 'date',
                    headerName: 'DATE',
                    width: 200,
                    renderCell: (params) => (params.value) // To render JSX
                }
            ],
            // Define rows for DataGrid
            sms_transaction_rows: [],
            
            // Define columns for the other tables (which were defined in render())
            support_ticket_columns: [
                { field: 'sl', headerName: '#SL', width: 150 },
                { field: 'subject', headerName: 'SUBJECT', width: 270 },
                { field: 'date', headerName: 'DATE', width: 200 },
                { field: 'status', headerName: 'STATUS', width: 100 },
                { field: 'action', headerName: 'ACTION', width: 100, sortable: false }
            ],
            invoices_columns: [
                { field: 'sl', headerName: '#SL', width: 150 },
                { field: 'amount', headerName: 'AMOUNT', width: 270 },
                { field: 'invoice_date', headerName: 'INVOICE DATE', width: 200 },
                { field: 'due_date', headerName: 'DUE DATE', width: 100 },
                { field: 'status', headerName: 'STATUS', width: 100 },
                { field: 'type', headerName: 'TYPE', width: 100 },
                { field: 'manage', headerName: 'Manage', width: 100, sortable: false }
            ]
            // --- END KEY CHANGE ---
        };

        // ... (constructor bindings remain unchanged)
        this.toggle1 = this.toggle1.bind(this);
        this.t_border1 = this.t_border1.bind(this);
        this.updateClient = this.updateClient.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.updateSmsLimit = this.updateSmsLimit.bind(this);
        this.tog_add_limit = this.tog_add_limit.bind(this);
        this.tog_send_sms = this.tog_send_sms.bind(this);
        this.tog_recharge = this.tog_recharge.bind(this);
        this.tog_update_image = this.tog_update_image.bind(this);
        this.modal_update_image = this.modal_update_image.bind(this);
        this.sendSms = this.sendSms.bind(this);
        this.doRecharge = this.doRecharge.bind(this);
        this.handleSelectSmsGateway = this.handleSelectSmsGateway.bind(this);
        this.handleAcceptedFilesDocument = this.handleAcceptedFilesDocument.bind(this);
        this.changeAvatar = this.changeAvatar.bind(this);
    }

    // ... (componentDidMount and tab toggle methods remain unchanged)
    
    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadSenderIds();
        this.loadSmsGateways();
        this.loadSmsTransactions();
        this.loadClientDetails();
    }

    toggle1(tab) {
        if (this.state.activeTab1 !== tab) {
            this.setState({
                activeTab1: tab
            });
        }
    }

    t_border1(tab) {
        if (this.state.activeTab_border1 !== tab) {
            this.setState({
                activeTab_border1: tab
            });
        }
    }
    
    // ... (All handle, tog, and removeBodyCss methods remain unchanged)
    handleSelectClientGroup = (selectedItem) => {
        this.setState({ client_group: selectedItem.value });
    }
    handleSelectUserRoute = (selectedItem) => {
        this.setState({ client_route: selectedItem.value });
    }
    handleSelectSmsGateway = (selectedItem) => {
        console.log(selectedItem)
        this.setState({ smsGatewayModal: selectedItem });
    }
    handleSelectStatus = (selectedItem) => {
        this.setState({ status: selectedItem.value });
    }
    handleSelectTemplate = (selectedItem) => {
        this.setState({ template: selectedItem.value });
    } 
    handleRoutes = (selectedItem) => {
        this.setState({ smsGatewaysSelected: selectedItem.value });
    }
    handleReffeerBy = (selectedItem) => {
        this.setState({ reffeerBy: selectedItem.value });
    } 
    handleSelectGroup = (selectedItem) => {
        this.setState({ senderIdSelected: selectedItem });
    }
    tog_send_sms(){
        this.setState(prevState => ({
            modal_send_sms: !prevState.modal_send_sms
        }));
        this.removeBodyCss();
    }
    tog_recharge(){
        this.setState(prevState => ({
            rechargeModal: !prevState.rechargeModal
        }));
        this.removeBodyCss();
    }
    tog_add_limit() {
        this.setState(prevState => ({
            modal_add_limit: !prevState.modal_add_limit
        }));
        this.removeBodyCss();
    }
    tog_update_image() {
        this.setState(prevState => ({
            modal_change_image: !prevState.modal_change_image
        }));
        this.removeBodyCss();
    }  
    tog_delete(id) {
        this.setState(prevState => ({
            modal_delete: !prevState.modal_delete,
            delete_sid: id,
        }));
        this.removeBodyCss();
    }
    removeBodyCss() {
        document.body.classList.add('no_padding');
    }
    modal_update_image(){
        return true;
    }


    updateSmsLimit(event, values){
        this.setState({isAdding: true});
        let raw = JSON.stringify({
            requestType: "UPDATESMSLIMIT",
            payload:{
                clientId: this.state.clientDetails.id,
                smsBalance: values.smsLimit
            }
        })

        ServerApi().post("updateClientSmsLimit", raw)
        .then(res => {
            if (res.data !== undefined && res.data.status === false) {
                // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
                // this.setState({isAdding: false, success_msg: true, modalType:'error', success_message : res.data.message, isLoading: false}); // REMOVED
                this.setState({ isAdding: false, isLoading: false });
                MySwal.fire({
                    title: 'Error!',
                    text: res.data.message,
                    icon: 'error'
                });
                // --- END KEY CHANGE ---
                return false;
            }
            
            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({isAdding: false, success_msg: true, modalType:'success', success_message : "Client SMS Limit Updated!", isLoading: false}); // REMOVED
            this.setState({ isAdding: false, isLoading: false });
            MySwal.fire({
                title: 'Success!',
                text: 'Client SMS Limit Updated!',
                icon: 'success'
            });
            // --- END KEY CHANGE ---
            
            this.tog_add_limit();
            this.loadClientDetails();
            this.loadBalance();
          })
          .catch(error => console.log('error', error));
    }

    // ... (loadClientDetails remains unchanged)
    loadClientDetails(){
        this.setState({isLoading: true})
        // ...
    }

    remaningMessageCharactersCalculate(){
        // ... (remains unchanged)
    }

    loadSenderIds(){
        // ... (remains unchanged)
    }

    loadSmsGateways(){
        // ... (remains unchanged)
    }

    loadSmsTransactions(){
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(`/api/v1/recharge/${this.props.location.state.clientId}`)
          .then(res => {
            if (res.status !== 200) { return false }
            
            // --- KEY CHANGE (DATAGRID MAPPING) ---
            // 1. DataGrid needs a unique 'id' field. We'll use 'sl'.
            // 2. The map function was incorrectly returning 'true', fixed to return 'item'.
            const formattedRows = res.data.reverse().map((item, index)=>{
                item.sl = (index+1);
                item.id = (index+1); // ADDED: Use 'sl' as the unique ID
                item.amount = <p>₹ {item.rechargeAmount}</p>;
                item.date = <p>{new Date(item.createDate).toLocaleString('en-US', {hour12: true})}</p>;
                return item; // FIX: Was 'return true'
            });  

            this.setState({isLoading: false, sms_transaction_rows: formattedRows});
            // --- END KEY CHANGE ---
          })
          .catch(error => console.log('error', error));
    }

    sendSms(event, values){
        console.log(values);
        //API
        this.setState({isSending: true});

        var raw = JSON.stringify({
            requestType: "QUICKSMS",
            payload:{
                smsGateway: this.state.smsGatewayModal.value,
                senderId:this.state.senderIdSelected.value,
                countryCode:"+91",
                globalStatus:"true",
                recipients : this.state.clientDetails.phoneNumber,
                delimiter : ",",
                removeDuplicate : "true",
                messageType : "Plain",
                message : values.message,
            }
        });

        ServerApi().post('sms/sendQuickSms', raw)
          .then(res => {
            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({modalType: 'success', success_msg: true, success_message : res.data.response, isSending: false}); // REMOVED
            this.setState({ isSending: false });
            MySwal.fire({
                title: 'Success!',
                text: res.data.response,
                icon: 'success'
            });
            // --- END KEY CHANGE ---

            this.form && this.form.reset();
            this.tog_send_sms()

          })
          .catch(error => console.log('error', error));
    }

    // ... (updateClient, file handling, and other methods remain unchanged)
    updateClient(event, values){
        // ...
    }
    handleAcceptedFilesDocument = (files) => {
        // ...
    }
    formatBytes = (bytes, decimals = 2) => {
        // ...
    }
    handleChange = e => {
        // ...
    };
    changeAvatar(){
        // ...
    }
    loadBalance(){
        // ...
    }
    doRecharge(event, values){
        // ...
    }

    render() {
        // --- KEY CHANGE (DATAGRID) ---
        // The data definitions for MDBDataTable are removed from render()
        // as they are now defined in the constructor state.
        // --- END KEY CHANGE ---

        if (this.state.isLoading) { 
            return(
                <DataLoading loading={this.state.isLoading} />
            )
        } 

        return (
            <React.Fragment>
                
                <Container fluid>
                    {/* ... (Header and Profile Card JSX remains unchanged) ... */}
                    
                    <Row>
                        <Col lg="12" md="12">
                            <div>
                                <div>

                                    <Nav tabs className="nav-tabs">
                                        {/* ... (NavTabs remain unchanged) ... */}
                                    </Nav>

                                    <TabContent activeTab={this.state.activeTab_border1}>
                                        <TabPane className="p-3 bg-white" tabId="13">
                                            <AvForm onValidSubmit={this.updateClient} ref={c => (this.form = c)}>
                                                {/* ... (Profile Form JSX remains unchanged) ... */}
                                            </AvForm>
                                        </TabPane>
                                        <TabPane className="p-3 bg-white" tabId="16">
                                            
                                            {/* --- KEY CHANGE (MDBDATATABLE REPLACEMENT) --- */}
                                            {/* <MDBDataTable
                                                responsive
                                                striped
                                                data={this.state.data_sms_transaction}
                                            /> */}
                                            <Box sx={{ height: 400, width: '100%' }}>
                                                <DataGrid
                                                    rows={this.state.sms_transaction_rows}
                                                    columns={this.state.sms_transaction_columns}
                                                    pageSize={5}
                                                    rowsPerPageOptions={[5, 10, 20]}
                                                    // 'id' field was added during data mapping
                                                    // getRowId={(row) => row.sl} // Not needed if 'id' field exists
                                                    disableSelectionOnClick
                                                />
                                            </Box>
                                            {/* --- END KEY CHANGE --- */}

                                        </TabPane>
                                        {getLoggedInUser().userType === 'SUPER_ADMIN' && (
                                        <>
                                            <TabPane className="p-3 bg-white" tabId="14">
                                                
                                                {/* --- KEY CHANGE (MDBDATATABLE REPLACEMENT) --- */}
                                                {/* <MDBDataTable
                                                    responsive
                                                    striped
                                                    data={data_support_ticket}
                                                /> */}
                                                <Box sx={{ height: 400, width: '100%' }}>
                                                    <DataGrid
                                                        rows={[]} // Original code had empty rows
                                                        columns={this.state.support_ticket_columns}
                                                        pageSize={5}
                                                        rowsPerPageOptions={[5]}
                                                        disableSelectionOnClick
                                                    />
                                                </Box>
                                                {/* --- END KEY CHANGE --- */}

                                            </TabPane>
                                            <TabPane className="p-3 bg-white" tabId="15">
                                                
                                                {/* --- KEY CHANGE (MDBDATATABLE REPLACEMENT) --- */}
                                                {/* <MDBDataTable
                                                    responsive
                                                    striped
                                                    data={data_invoices}
                                                /> */}
                                                <Box sx={{ height: 400, width: '100%' }}>
                                                    <DataGrid
                                                        rows={[]} // Original code had empty rows
                                                        columns={this.state.invoices_columns}
                                                        pageSize={5}
                                                        rowsPerPageOptions={[5]}
                                                        disableSelectionOnClick
                                                    />
                                                </Box>
                                                {/* --- END KEY CHANGE --- */}

                                            </TabPane>
                                            <TabPane className="p-3 bg-white" tabId="17">
                                                {/* ... (Permissions Form JSX remains unchanged) ... */}
                                            </TabPane>
                                            </>
                                        )}
                                    </TabContent>

                                </div>
                            </div>
                        </Col>
                    </Row>

                    {/* ... (All Reactstrap Modals remain unchanged: modal_delete, modal_add_limit, etc.) ... */}

                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        {/* ... (This is a Reactstrap Modal, NOT SweetAlert. It remains unchanged.) ... */}
                    </Modal>

                    <Modal isOpen={this.state.modal_add_limit} toggle={this.tog_add_limit} >
                        {/* ... (This is a Reactstrap Modal, NOT SweetAlert. It remains unchanged.) ... */}
                    </Modal>

                    <Modal isOpen={this.state.modal_send_sms} toggle={this.tog_send_sms} >
                        {/* ... (This is a Reactstrap Modal, NOT SweetAlert. It remains unchanged.) ... */}
                    </Modal>

                    <Modal isOpen={this.state.rechargeModal} toggle={this.tog_recharge} >
                        {/* ... (This is a Reactstrap Modal, NOT SweetAlert. It remains unchanged.) ... */}
                    </Modal>

                    <Modal isOpen={this.state.modal_change_image} toggle={this.tog_update_image} >
                        {/* ... (This is a Reactstrap Modal, NOT SweetAlert. It remains unchanged.) ... */}
                    </Modal>

                    {/* --- KEY CHANGE (SWEETALERT BLOCK DELETED) --- */}
                    {/* The old <SweetAlert> component is DELETED from the render method.
                        It is now triggered as a function call in class methods. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert ... >
                        </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, updateSmsBalance, openSnack })(ManageClient));