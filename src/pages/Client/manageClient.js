import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Nav, NavItem, NavLink, TabContent, TabPane, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout, updateSmsBalance, openSnack } from '../../store/actions';
import Select from 'react-select';
import { Link, withRouter } from 'react-router-dom';
import { AvForm, AvField, AvGroup } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';
import classnames from 'classnames';
import Dropzone from 'react-dropzone';
// import Countries from '../../utils/Countries';
import defaultProfileImage from '../../images/users/default_profile.jpg';
import SweetAlert from 'react-bootstrap-sweetalert';
import {ServerApi} from '../../utils/ServerApi';
import { Radio, Tag } from 'antd';
import {getLoggedInUser} from '../../helpers/authUtils';
import DataLoading from '../../components/Loading/DataLoading';
import {print_state, print_city} from '../../utils/StateCity';

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
    { label: "Unlimited Company", value: "Unlimited Company" },
    { label: "Sole proprietorship", value: "Sole proprietorship" },
    { label: "Joint Hindu Family business ", value: "Joint Hindu Family business " },
    { label: "Partnership Cooperatives ", value: "Partnership Cooperatives " },
    { label: "Limited Liability Partnership(LLP) ", value: "Limited Liability Partnership(LLP) " },
    { label: "Liaison Office ", value: "Liaison Office " },
    { label: "Branch Office ", value: "Branch Office " },
    { label: "Project Office ", value: "Project Office " },
    { label: "Subsidiary Company", value: "Subsidiary Company" },
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
            success_msg: false,
            success_message: '',
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
            data_sms_transaction: {
                columns: [
                    {
                        label: '#SL',
                        field: 'sl',
                        sort: 'asc',
                        width: 150
                    },
                    {
                        label: 'AMOUNT',
                        field: 'amount',
                        sort: 'asc',
                        width: 180
                    },
                    {
                        label: 'REMARK',
                        field: 'rechargeDescription',
                        sort: 'asc',
                        width: 250
                    },
                    {
                        label: 'TYPE',
                        field: 'type',
                        sort: 'asc',
                        width: 250
                    },
                    {
                        label: 'DATE',
                        field: 'date',
                        sort: 'asc',
                        width: 200
                    }
                ],
                rows: []
            }
        };

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
    
    //Select 
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
        // this.refs.form.getDOMNode().dispatchEvent(new Event("submit"));
        // this.form && this.form.submit();
        let raw = JSON.stringify({
            requestType: "UPDATESMSLIMIT",
            payload:{
                clientId: this.state.clientDetails.id,
                smsBalance: values.smsLimit
            }
        })

        ServerApi().post("updateClientSmsLimit", raw)
        .then(res => {
            // console.log(data);
            if (res.data !== undefined && res.data.status === false) {
                this.setState({isAdding: false, success_msg: true, modalType:'error', success_message : res.data.message, isLoading: false});
                return false;
            }
            
            this.setState({isAdding: false, success_msg: true, modalType:'success', success_message : "Client SMS Limit Updated!", isLoading: false});
            // alert(data.response);
            // this.form && this.form.reset();
            this.tog_add_limit();
            this.loadClientDetails();
            this.loadBalance();
          })
          .catch(error => console.log('error', error));
    }

    loadClientDetails(){
        this.setState({isLoading: true})

        if(this.props.location.state.user !== undefined && this.props.location.state.user === true){
            var fetchUrl = 'getClientDetails/';
            ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(fetchUrl+this.props.location.state.clientId)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }

            this.setState({clientDetails: res.data, 
                smsType: res.data.smsType, 
                consumptionType: res.data.billingType,
                creditType: res.data.creditType,
                smsGatewaysSelected: res.data.routes, 
                smsGatewayModal: res.data.routes, 
                hasDropingAccess: (res.data.applyDropping)?"Yes":"No",
                hasDNDApplicable: (res.data.applyDndReturn)?"Yes":"No",
                templateBased: (res.data.templateBased)?{label: 'Yes', value: true}:{label: 'No', value: false},
                isLoading: false})
            })
            .catch(error => console.log('error', error));
        }else{
            var fetchUrl2 = 'getClientDetails/';
            ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(fetchUrl2+this.props.location.state.clientId)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }

            this.setState({clientDetails: res.data, 
                smsType: res.data.smsType, 
                consumptionType: res.data.billingType,
                creditType: res.data.creditType,
                smsGatewaysSelected: res.data.assignRoute, 
                smsGatewayModal: res.data.routes,
                hasDropingAccess: (res.data.applyDropping)?"Yes":"No",
                hasDNDApplicable: (res.data.applyDndReturn)?"Yes":"No",
                isLoading: false})
            })
            .catch(error => console.log('error', error));
        }
    }

    remaningMessageCharactersCalculate(){
        // var count = message.length;
        console.log(this.state.message);
        // if (count === 160) {return false;}
        // var remaning = 160 - count; 
        // this.setState({message:message, remaningMessageCharacters: remaning});
    }

    loadSenderIds(){
        ServerApi().get('getActiveSenderIds')
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 

            var arr = res.data.map(obj => ({
                label: obj.senderId,
                value: obj.senderId,
            }))

            console.log(arr);

            this.setState({senderIds: arr})
        })
        .catch(error => console.log('error', error));
    }

    loadSmsGateways(){
        ServerApi().get('routes')
          .then(res => {
            if (res.status !== 200) { return false } 

            // var arr = res.data.map(obj => ({
            //     label: obj.systemId,
            //     value: obj.routeName,
            // }))

            this.setState({smsGateways: res.data})
        })
        .catch(error => console.log('error', error));
    }

    loadSmsTransactions(){
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(`/api/v1/recharge/${this.props.location.state.clientId}`)
          .then(res => {
            if (res.status !== 200) { return false }
            
            res.data.reverse().map((item, index)=>{
                item.sl = (index+1);
                item.amount = <p>₹ {item.rechargeAmount}</p>;
                item.date = <p>{new Date(item.createDate).toLocaleString('en-US', {hour12: true})}</p>;
                return true;
            });  

            let newTableDataRows = [...this.state.data_sms_transaction.rows];
            newTableDataRows = res.data;
            this.setState({isLoading: false, data_sms_transaction: {...this.state.data_sms_transaction, rows: newTableDataRows}})
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
            // console.log(data);
            // alert(data.response)
            this.setState({modalType: 'success', success_msg: true, success_message : res.data.response, isSending: false});

            this.form && this.form.reset();

            this.tog_send_sms()

          })
          .catch(error => console.log('error', error));
    }


    updateClient(event, values){
        // if(this.state.selectedState===undefined || this.state.selectedCity==="" || 
        //    this.state.selectedRoutes.length===0 || this.state.admin_dropping===undefined || 
        //    this.state.admin_droping_access===undefined){

        //     this.props.openSnack({type: 'error', message: 'Please fill all required fields.'})
        //     return false;
        // }

        //API
        this.setState({isLoading: true});

        var raw = {
            clientId: this.state.clientDetails.id,
            state: this.state.selectedState,
            city: this.state.selectedCity,
            gstNo: values.gstno,
            name: values.name,
            address: this.state.address,
            company: values.company,
            companyType: (this.state.selectedCompanyType===undefined)?this.state.clientDetails.companyType:this.state.selectedCompanyType,
            country: "India",
            templateBased: this.state.templateBased.value,
            dltRegNo: values.dltRegNo,
            entityName: values.entityName,
            accountType : (this.state.accountType===undefined)?this.state.clientDetails.accountType:this.state.accountType,
            username : values.username,
            routeIdList: (this.state.routeList===undefined)?this.state.clientDetails.routes.map(i=>i.id):this.state.routeList.map(i=>i.value),
            email: values.email,
            creditDeductionType : (this.state.creditDeductionType===undefined)?this.state.clientDetails.creditDeductionType:this.state.creditDeductionType
        };

        // var formdata = new FormData();
        // formdata.append("request", JSON.stringify(raw));
        //avatar
        // if(this.state.selectedFilesDocument[0] !== undefined){
        //     formdata.append("avatar", this.state.selectedFilesDocument[0]);
        // }

        ServerApi().put('updateClient', raw)
          .then(res => {
            // console.log(data);
            if (res.data !== undefined && res.data.status === false) {
                this.props.openSnack({type: 'error', message: res.data.message})
                return false;
            }

            this.props.openSnack({type: 'success', message: 'Client Updated!'})
            
            this.setState({isDisabled: !this.state.isDisabled, isLoading: false});
            // alert(data.response);
            // this.form && this.form.reset();
            this.loadClientDetails();
          })
          .catch(error => console.log('error', error));
    }

    handleAcceptedFilesDocument = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        // console.log(files);

        this.setState({ selectedFilesDocument: files });
    }
    

    /**
    * Formats the size
    */
    formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    handleChange = e => {
        const { name, value } = e.target;

        this.setState({
          [name]: value
        });
    };

    changeAvatar(){
        // this.refs.form.getDOMNode().dispatchEvent(new Event("submit"));
        this.form && this.form.submit();

        this.tog_update_image();
    }

    loadBalance(){
        if(getLoggedInUser().userType === 'SUPER_ADMIN'){return false;}

        ServerApi().get(`client/getBalance/${getLoggedInUser().id}`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 

            this.props.updateSmsBalance(res.data.response);
        })
        .catch(error => console.log('error', error));
    }
    

    doRecharge(event, values){
        this.setState({isRecharging: true})
        let raw = {
            rechargeAmount: values.amount,
            rechargeDescription: values.remark,
            rechargeGateway: "",
            refNo: "",
            transactionId: "",
            transactionStatus: "",
            type: "",
            userId: this.state.clientDetails.id
        }
        
        ServerApi().post(`/api/v1/recharge`, raw)
        .then(res => {
            this.props.openSnack({type: 'success', message: 'Recharge done successfully!'})
            this.setState({isRecharging: false})
            this.loadClientDetails();
            this.loadSmsTransactions();
            this.tog_recharge();
        })
        .catch(error => {
            this.props.openSnack({type: 'error', message: 'Unable to recharge'})
            this.setState({isRecharging: false})
            console.log('error', error)
        });
    }

    render() {
        const data_support_ticket = {
            columns: [
                {
                    label: '#SL',
                    field: 'sl',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'SUBJECT',
                    field: 'subject',
                    sort: 'asc',
                    width: 270
                },
                {
                    label: 'DATE',
                    field: 'date',
                    sort: 'asc',
                    width: 200
                },
                {
                    label: 'STATUS',
                    field: 'status',
                    sort: 'asc',
                    width: 100
                },
                {
                    label: 'ACTION',
                    field: 'action',
                    sort: 'asc',
                    width: 100
                }
            ],
            rows: []
        };

        const data_invoices = {
            columns: [
                {
                    label: '#SL',
                    field: 'sl',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'AMOUNT',
                    field: 'amount',
                    sort: 'asc',
                    width: 270
                },
                {
                    label: 'INVOICE DATE',
                    field: 'invoice_date',
                    sort: 'asc',
                    width: 200
                },
                {
                    label: 'DUE DATE',
                    field: 'due_date',
                    sort: 'asc',
                    width: 100
                },
                {
                    label: 'STATUS',
                    field: 'status',
                    sort: 'asc',
                    width: 100
                },
                {
                    label: 'TYPE',
                    field: 'type',
                    sort: 'asc',
                    width: 100
                },
                {
                    label: 'Manage',
                    field: 'manage',
                    sort: 'asc',
                    width: 100
                }
            ],
            rows: []
        };

        if (this.state.isLoading) { 
            return(
                <DataLoading loading={this.state.isLoading} />
            )
        } 

        return (
            <React.Fragment>
                
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">MANAGE CLIENT</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="12">
                            <Card>
                                <CardBody>
                                    <Row>
                                        <Col sm="12" lg="2">
                                            <div className="p-2 mt-3 image-border">
                                                <img src={(this.state.clientDetails.avatar !== undefined)?'data:'+this.state.clientDetails.avatarFileType+';base64,'+this.state.clientDetails.avatar.data:defaultProfileImage} className="img-fluid" alt="Avatar" />
                                            </div>
                                        </Col>
                                        <Col sm="12" lg="10">
                                            <h3>{this.state.clientDetails.name} {'  '} <Tag color="green">{this.state.clientDetails.userType}</Tag></h3>

                                            <Row>
                                                <Col xs="3" sm="3" md="2">
                                                    <p>Email </p>
                                                </Col>
                                                <Col xs="1" sm="1" md="1">
                                                    <p> : </p>
                                                </Col>
                                                <Col xs="8" sm="8" md="9">
                                                    <p className="float-left">{this.state.clientDetails.email}</p>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs="3" sm="3" md="2">
                                                    <p>Phone </p>
                                                </Col>
                                                <Col xs="1" sm="1" md="1">
                                                    <p> : </p>
                                                </Col>
                                                <Col xs="8" sm="8" md="9">
                                                    <p className="float-left">{this.state.clientDetails.phoneNumber}</p>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs="3" sm="3" md="2">
                                                    <p>Wallet Balance </p>
                                                </Col>
                                                <Col xs="1" sm="1" md="1">
                                                    <p> : </p>
                                                </Col>
                                                <Col xs="8" sm="8" md="9">
                                                    <p className="float-left">{Math.round((this.state.clientDetails.wallet)?this.state.clientDetails.wallet.closingCredit:0)}</p>
                                                </Col>

                                                <Col xs="3" sm="3" md="2">
                                                    <p>SMS Plan </p>
                                                </Col>
                                                <Col xs="1" sm="1" md="1">
                                                    <p> : </p>
                                                </Col>
                                                <Col xs="8" sm="8" md="9">
                                                    <p className="float-left">{Math.round((this.state.clientDetails.pricing)?this.state.clientDetails.pricing.netPrice:'N/A')+' p/sms'}</p>
                                                </Col>

                                                {/* <Col xs="3" sm="3" md="2">
                                                    <p>Used Credits </p>
                                                </Col>
                                                <Col xs="1" sm="1" md="1">
                                                    <p> : </p>
                                                </Col>
                                                <Col xs="8" sm="8" md="9">
                                                    <p className="float-left">{this.state.clientDetails.wallet.usedCredit}</p>
                                                </Col> */}
                                                
                                                <Col sm="12">
                                                    <div className="float-left d-none d-md-block">
                                                        {getLoggedInUser().userType === 'SUPER_ADMIN' && (
                                                            <Button type="button" onClick={this.tog_send_sms} color="success" size="sm" className="waves-effect mr-2"><i className="fa fa-paper-plane mr-2"></i> Send SMS</Button>
                                                        )}
                                                        {/* <Button type="button" onClick={this.tog_add_limit} color="primary" size="sm" className="waves-effect mr-2"><i className="ti ti-exchange-vertical mr-2"></i> Update Limit</Button> */}
                                                        <Button type="button" onClick={this.tog_update_image} color="info" size="sm" className="waves-effect mr-2"><i className="fa fa-image mr-2"></i> Change Image</Button>
                                                        <Button type="button" onClick={this.tog_recharge} color="info" size="sm" className="waves-effect mr-2"><i className="fa fa-money mr-2"></i> Recharge</Button>
                                                    </div>
                                                </Col>

                                                {/* <Col sm="12">
                                                    <div className="float-left d-none d-md-block">
                                                        <Button type="button" onClick={this.tog_send_sms} color="success" size="sm" className="waves-effect mr-2"><i className="fa fa-paper-plane mr-2"></i> Send SMS</Button>
                                                        <Button type="button" onClick={this.tog_add_limit} color="primary" size="sm" className="waves-effect mr-2"><i className="ti ti-exchange-vertical mr-2"></i> Update Limit</Button>
                                                        <Button type="button" onClick={this.tog_update_image} color="info" size="sm" className="waves-effect mr-2"><i className="fa fa-image mr-2"></i> Change Image</Button>
                                                        <Button type="button" onClick={this.tog_recharge} color="info" size="sm" className="waves-effect mr-2"><i className="fa fa-money mr-2"></i> Recharge</Button>
                                                    </div>
                                                </Col> */}

                                            </Row>
                                        </Col>

                                    </Row>

                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg="12" md="12">
                            <div>
                                <div>

                                    <Nav tabs className="nav-tabs">
                                        <NavItem>
                                            <NavLink className={classnames({ active: this.state.activeTab_border1 === '13' })}
                                                onClick={() => { this.t_border1('13'); }}>
                                                <span className="d-block d-sm-none"><i className="fas fa-home"></i></span>
                                                <span className="d-none d-sm-block">Profile</span>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink className={classnames({ active: this.state.activeTab_border1 === '16' })}
                                                onClick={() => { this.t_border1('16'); }}>
                                                <span className="d-block d-sm-none"><i className="fas fa-cog"></i></span>
                                                <span className="d-none d-sm-block">Transaction</span>
                                            </NavLink>
                                        </NavItem>

                                        {getLoggedInUser().userType === 'SUPER_ADMIN' && (
                                        <>
                                        <NavItem>
                                            <NavLink className={classnames({ active: this.state.activeTab_border1 === '14' })}
                                                onClick={() => { this.t_border1('14'); }}>
                                                <span className="d-block d-sm-none"><i className="fas fa-user"></i></span>
                                                <span className="d-none d-sm-block">Support Tickets</span>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink className={classnames({ active: this.state.activeTab_border1 === '15' })}
                                                onClick={() => { this.t_border1('15'); }}>
                                                <span className="d-block d-sm-none"><i className="fas fa-envelope"></i></span>
                                                <span className="d-none d-sm-block">Invoices</span>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink className={classnames({ active: this.state.activeTab_border1 === '17' })}
                                                onClick={() => { this.t_border1('17'); }}>
                                                <span className="d-block d-sm-none"><i className="fas fa-cog"></i></span>
                                                <span className="d-none d-sm-block">Permissions</span>
                                            </NavLink>
                                        </NavItem>
                                        {/* <NavItem>
                                            <NavLink className={classnames({ active: this.state.activeTab_border1 === '18' })}
                                                onClick={() => { this.t_border1('18'); }}>
                                                <span className="d-block d-sm-none"><i className="fas fa-cog"></i></span>
                                                <span className="d-none d-sm-block">Entity</span>
                                            </NavLink>
                                        </NavItem> */}
                                        </>
                                        )}
                                    </Nav>

                                    <TabContent activeTab={this.state.activeTab_border1}>
                                        <TabPane className="p-3 bg-white" tabId="13">
                                            <AvForm onValidSubmit={this.updateClient} ref={c => (this.form = c)}>
                                                <Row className="align-items-center">
                                                    <Col md="12">
                                                        <div className="float-right">
                                                            {this.state.isDisabled && (
                                                                <Button
                                                                type="button" 
                                                                onClick={()=>this.setState({isDisabled: !this.state.isDisabled})} 
                                                                color="danger" 
                                                                size="sm" 
                                                                className="waves-effect mr-2">
                                                                    <i className="fa fa-edit mr-2"></i> 
                                                                    Edit
                                                            </Button>
                                                            )}
                                                            {!this.state.isDisabled && (
                                                            <Button
                                                                type="button" 
                                                                onClick={()=>this.setState({isDisabled: !this.state.isDisabled})} 
                                                                color="info" 
                                                                size="sm" 
                                                                className="waves-effect mr-2">
                                                                    <i className="fa fa-eye mr-2"></i> 
                                                                    View
                                                            </Button>
                                                            )}
                                                        </div>                                                   
                                                    </Col>
                                                </Row>

                                                <Row className="align-items-center">
                                                    <Col sm="4">
                                                        <AvField name="name" label="NAME"
                                                            disabled={this.state.isDisabled}
                                                            value={this.state.clientDetails.name}
                                                            type="text" errorMessage="Enter First Name"
                                                            validate={{ required: { value: true } }} />
                                                    </Col>
                                                    <Col sm="4">
                                                        <AvField name="phone" label="PHONE" 
                                                            disabled={this.state.isDisabled}
                                                            value={this.state.clientDetails.phoneNumber}
                                                            errorMessage="Enter Phone no."
                                                            validate={{ required: { value: true },
                                                                        minLength: {value: 10},
                                                                        maxLength: {value: 10} }} />

                                                    </Col>

                                                    <Col sm="4">
                                                         <AvField name="email" label="EMAIL"
                                                            disabled={this.state.isDisabled}
                                                            type="email" errorMessage="Enter Email"
                                                            value={this.state.clientDetails.email}
                                                            validate={{ required: { value: true } }} />
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm="4">
                                                        <AvField name="company" label="COMPANY"
                                                            disabled={this.state.isDisabled}
                                                            type="text" errorMessage="Enter Company"
                                                            value={this.state.clientDetails.company}
                                                            validate={{ required: { value: true } }} />
                                                    </Col>
                                                    <Col sm="4">
                                                        {!this.state.isDisabled && (
                                                            <><Label>COMPANY TYPE</Label>
                                                            <Select
                                                                className="mb-3 field-required"
                                                                value={(this.state.selectedCompanyType===undefined)?{label: this.state.clientDetails.companyType, value: this.state.clientDetails.companyType}:{label: this.state.selectedCompanyType, value: this.state.selectedCompanyType}}
                                                                onChange={e=>this.setState({selectedCompanyType: e.value})}
                                                                options={COMPANY_TYPES}
                                                            /></>
                                                        )}
                                                        {this.state.isDisabled && (
                                                            <AvField name="companyType" label="COMPANY TYPE"
                                                                disabled={true}
                                                                type="text" errorMessage="Enter Company"
                                                                value={this.state.clientDetails.companyType}
                                                                validate={{ required: { value: true } }} />
                                                        )}
                                                    </Col>
                                                    <Col sm="4">
                                                        <AvField name="gstno" label="GST NO"
                                                            disabled={this.state.isDisabled}
                                                            type="text" errorMessage="Enter Company"
                                                            value={this.state.clientDetails.gstNo}
                                                            validate={{ required: { value: false } }} />
                                                    </Col>
                                                </Row>

                                                <Row className="align-items-center">
                                                    <Col sm="4">
                                                        <AvField name="username" label="USER NAME"
                                                            disabled={this.state.isDisabled}
                                                            value={this.state.clientDetails.userName}
                                                            type="text" errorMessage="Enter User Name"
                                                            validate={{ required: { value: true } }} />
                                                    </Col>
                                                    <Col sm="4">
                                                        {!this.state.isDisabled && (
                                                            <><Label>Credit Deduction Type</Label>
                                                            <Select
                                                                className="mb-3 field-required"
                                                                value={(this.state.creditDeductionType===undefined)?{label: this.state.clientDetails.creditDeductionType, value: this.state.clientDetails.creditDeductionType}:{label: this.state.creditDeductionType, value: this.state.creditDeductionType}}
                                                                onChange={e=>this.setState({creditDeductionType: e.value})}
                                                                options={CREDIT_TYPE}
                                                            /></>
                                                        )}
                                                        {this.state.isDisabled && (
                                                            <AvField name="creditDeductionType" label="Credit Deduction Type"
                                                                disabled={true}
                                                                type="text" errorMessage="Enter Credit Deduction Type"
                                                                value={this.state.clientDetails.creditDeductionType}
                                                                validate={{ required: { value: true } }} />
                                                        )}
                                                        {/* <Label className="d-block mt-3">Billing Based On</Label>
                                                        <Radio.Group inline onChange={this.handleChange} 
                                                            name="consumptionType" 
                                                            value={this.state.consumptionType}>
                                                            
                                                            <Radio value={'Submit'}>Submitted</Radio>
                                                            <Radio value={'Delivery'}>Delivery</Radio>
                                                        </Radio.Group> */}

                                                        
                                                    </Col>
                                                    <Col sm="4">
                                                        {!this.state.isDisabled && (
                                                            <><Label>Account Type</Label>
                                                            <Select
                                                                className="mb-3 field-required"
                                                                value={(this.state.accountType===undefined)?{label: this.state.clientDetails.accountType, value: this.state.clientDetails.accountType}:{label: this.state.accountType, value: this.state.accountType}}
                                                                onChange={e=>this.setState({accountType: e.value})}
                                                                options={ACCOUNT_TYPE}
                                                            /></>
                                                        )}
                                                        {this.state.isDisabled && (
                                                            <AvField name="accountType" label="Account Type"
                                                                disabled={true}
                                                                type="text" errorMessage="Enter Account Type"
                                                                value={this.state.clientDetails.accountType}
                                                                validate={{ required: { value: true } }} />
                                                        )}
                                                    </Col>
                                                </Row>

                                                <Row className="align-items-center">
                                                    <Col sm="4">
                                                        <AvGroup>
                                                            <Label>Billing Address</Label>
                                                            <textarea
                                                                disabled={this.state.isDisabled}
                                                                name="address" 
                                                                className="form-control"
                                                                defaultValue={(this.state.clientDetails.address)?this.state.clientDetails.address.address:''}
                                                                validate={{ required: { value: true } }}
                                                                onChange={(event) => this.setState({address: event.target.value})}
                                                                rows="2"
                                                                errorMessage="Address is required!"
                                                            />
                                                        </AvGroup>
                                                    </Col>
                                                    <Col sm="4">
                                                        {!this.state.isDisabled && (
                                                            <><Label>STATE</Label>
                                                            <Select
                                                                className="mb-3 field-required"
                                                                value={(this.state.selectedState===undefined)?{label: (this.state.clientDetails.address)?this.state.clientDetails.address.state:'', value: (this.state.clientDetails.address)?this.state.clientDetails.address.state:''}:{label: this.state.selectedState, value: this.state.selectedState}}
                                                                // defaultValue={Countries[0].options[99]}
                                                                onChange={e=>this.setState({selectedState: e.value, selectedStateIndex: e.index, selectedCity: ''})}
                                                                options={print_state()}
                                                            /></>
                                                        )}

                                                        {this.state.isDisabled && (
                                                            <AvField name="state" label="STATE"
                                                                disabled={true}
                                                                value={(this.state.clientDetails.address)?this.state.clientDetails.address.state:''}
                                                                type="text" errorMessage="Enter state"
                                                                validate={{ required: { value: true } }} />
                                                        )}
                                                    </Col>
                                                    <Col sm="4">
                                                        {!this.state.isDisabled && (
                                                            <><Label>CITY</Label>
                                                                <Select
                                                                className="mb-3 field-required"
                                                                label="CITY"
                                                                value={(this.state.selectedCity===undefined)?{label: (this.state.clientDetails.address)?this.state.clientDetails.address.city:'', value: (this.state.clientDetails.address)?this.state.clientDetails.address.city:''}:{label: this.state.selectedCity, value: this.state.selectedCity}}
                                                                // defaultValue={Countries[0].options[99]}
                                                                onChange={i=>this.setState({selectedCity: i.value})}
                                                                options={print_city(this.state.selectedStateIndex)}>
                                                            </Select></>
                                                        )}

                                                        {this.state.isDisabled && (
                                                            <AvField name="city" label="CITY"
                                                                disabled={true}
                                                                value={(this.state.clientDetails.address)?this.state.clientDetails.address.city:''}
                                                                type="text" errorMessage="Enter city"
                                                                validate={{ required: { value: true } }} />
                                                        )}
                                                    </Col>
                                                </Row>

                                                <Row className="align-items-center">
                                                    {/* <Col sm="4">
                                                        <Label>COUNTRY</Label>
                                                        <Select
                                                            className="mb-3"
                                                            label="COUNTRY"
                                                            value={Countries[0].options[99]}
                                                            defaultValue={Countries[0].options[99]}
                                                            onChange={this.handleSelectCountry}
                                                            options={Countries}
                                                        />
                                                    </Col> */}

                                                    {/* <Col sm="4">
                                                        <AvField name="website" label="WEBSITE"
                                                            disabled={this.state.isDisabled}
                                                            type="url" errorMessage="Enter Website"
                                                            value={this.state.clientDetails.website}
                                                            validate={{ required: { value: false } }} />
                                                    </Col> */}

                                                
                                                    
                                                    <Col sm="4">
                                                        {!this.state.isDisabled && (
                                                            <><Label>ROUTES</Label>
                                                            <Select
                                                                className="mb-3"
                                                                isMulti
                                                                // value={{label: this.state.accountType, value: this.state.accountType}}
                                                                value={(this.state.routeList===undefined)?this.state.clientDetails.routes.map((i)=>({label: i.routeName, value: i.id})):this.state.routeList}
                                                                // defaultValue={{label: this.state.clientDetails.companyType, value: this.state.clientDetails.companyType}}
                                                                onChange={(i)=>this.setState({routeList: (i)})}
                                                                options={this.state.smsGateways.map((i)=>({label: i.routeName, value: i.id}))}
                                                            /></>
                                                        )}
                                                        {this.state.isDisabled && (
                                                            <AvField name="routes" label="ROUTES"
                                                                disabled={true}
                                                                type="text" errorMessage="Enter ROUTES"
                                                                value={this.state.smsGatewayModal.map((i)=>i.routeName+', ')}
                                                                validate={{ required: { value: true } }} />
                                                        )}
                                                    </Col>

                                                    <Col sm="4">
                                                        <AvField name="entityName" label="Entity Name"
                                                            disabled={this.state.isDisabled}
                                                            type="text" errorMessage="Enter Entity Name"
                                                            value={this.state.clientDetails.entityName}
                                                            validate={{ required: { value: true } }} />
                                                    </Col>

                                                    <Col sm="4">
                                                        <AvField name="dltRegNo" label="DLT No."
                                                            disabled={this.state.isDisabled}
                                                            type="text" errorMessage="Enter DLT No."
                                                            value={this.state.clientDetails.dltRegNo}
                                                            validate={{ required: { value: true } }} />
                                                    </Col>

                                                    <Col sm="4">
                                                        {!this.state.isDisabled && (
                                                            <><Label>TEMPLATE BASED</Label>
                                                            <Select
                                                                className="mb-3"
                                                                value={this.state.templateBased}
                                                                onChange={(i)=>this.setState({templateBased: i})}
                                                                options={[{label: 'Yes', value: true}, {label: 'No', value: false}]}
                                                            /></>
                                                        )}
                                                        {this.state.isDisabled && (
                                                            <AvField name="templateBased" label="Template Based"
                                                                disabled={true}
                                                                type="text"
                                                                value={(this.state.clientDetails.templateBased)?'Yes':'No'}
                                                                validate={{ required: { value: true } }} />
                                                        )}
                                                    </Col>

                                                </Row>

                                                <Row className="align-items-center">
                                                    <Col sm="4">
                                                    </Col>
                                                    <Col sm="4">
                                                    </Col>
                                                    <Col sm="4">
                                                    </Col>
                                                </Row>

                                                {!this.state.isDisabled && (
                                                    <FormGroup className="mb-0">
                                                        <div>
                                                            <Button type="success" color="primary" htmlType="submit" className="mr-1 float-right">
                                                                <i className="fa fa-paper-plane mr-2"></i> 
                                                                {(this.state.isLoading)?'Please Wait...':'Update'}
                                                            </Button>
                                                        </div>
                                                    </FormGroup>
                                                )}


                                            </AvForm>
                                        </TabPane>
                                        <TabPane className="p-3 bg-white" tabId="16">
                                            <MDBDataTable
                                                responsive
                                                striped
                                                data={this.state.data_sms_transaction}
                                            />
                                        </TabPane>
                                        {getLoggedInUser().userType === 'SUPER_ADMIN' && (
                                        <>
                                        <TabPane className="p-3 bg-white" tabId="14">
                                            <MDBDataTable
                                                responsive
                                                striped
                                                data={data_support_ticket}
                                            />
                                        </TabPane>
                                        <TabPane className="p-3 bg-white" tabId="15">
                                            <MDBDataTable
                                                responsive
                                                striped
                                                data={data_invoices}
                                            />
                                        </TabPane>
                                        <TabPane className="p-3 bg-white" tabId="17">
                                            <AvForm>

                                                <Row className="align-items-center">
                                                    <Col sm="4">
                                                        <FormGroup>
                                                            <Label className="d-block mb-2">DND Return</Label>

                                                            <Radio.Group inline onChange={(e)=>this.setState({hasDNDApplicable: e.target.value})} 
                                                                name="dnd_return" 
                                                                value={this.state.hasDNDApplicable}>                                                                
                                                                <Radio value={'Yes'}>Yes</Radio>
                                                                <Radio value={'No'}>No</Radio>
                                                            </Radio.Group>

                                                        </FormGroup>
                                                    </Col>

                                                    <Col sm="4">
                                                        <FormGroup>
                                                            <Label className="d-block mt-3">Droping </Label>

                                                            <Radio.Group inline onChange={(e)=>{this.setState({hasDropingAccess: e.target.value})}} 
                                                                name="droping" 
                                                                value={this.state.hasDropingAccess}>
                                                                <Radio value={'Yes'}>Yes</Radio>
                                                                <Radio value={'No'}>No</Radio>
                                                            </Radio.Group>
                                                        </FormGroup>
                                                    </Col>

                                                    {(this.state.hasDropingAccess === "Yes") &&
                                                        <Col sm="4">
                                                            <AvField name="registration_id" label="Droping percentage (%)"
                                                                // disabled={this.state.isDisabled}
                                                                // placeholder="Droping percentage (%)" 
                                                                type="text" 
                                                                value={this.state.clientDetails.droppingPercentage}
                                                                errorMessage="Enter Droping percentage (%)"
                                                                validate={{ required: { value: true } }} />
                                                        </Col>
                                                    }

                                                </Row>

                                                <FormGroup className="mb-0">
                                                    <div className="float-right">
                                                        <Button type="submit" onClick={this.tog_send_sms} color="success" size="sm" className="waves-effect mr-1 float-right">
                                                            <i className="fa fa-paper-plane mr-2"></i> Update
                                                        </Button>
                                                    </div>
                                                </FormGroup>

                                            </AvForm>
                                        </TabPane>
                                        <TabPane className="p-3 bg-white" tabId="18">
                                            <AvForm onValidSubmit={this.updateClient} ref={c => (this.form1 = c)}>
                                                <Row className="align-items-center">
                                                    <Col sm="6">
                                                        <Label>Entity Type *</Label>
                                                        <Select
                                                            className="mb-3"
                                                            label="Entity Type *"
                                                            defaultValue={CLIENT_GROUP[0].options[99]}
                                                            onChange={this.handleSelectClientGroup}
                                                            options={CLIENT_GROUP}
                                                        />
                                                    </Col>
                                                    <Col sm="6">
                                                        <Label>Category of Organization *</Label>
                                                        <Select
                                                            className="mb-3"
                                                            label="Category of Organization *"
                                                            defaultValue={CLIENT_GROUP[0].options[99]}
                                                            onChange={this.handleSelectClientGroup}
                                                            options={CLIENT_GROUP}
                                                        />
                                                    </Col>
                                                    
                                                    <Col sm="6">
                                                        <AvField name="pan_no" label=" PAN Number *"
                                                            disabled={this.state.isDisabled}
                                                            placeholder="eg: AAAAA0000A" type="text" errorMessage="Enter First Name"
                                                            validate={{ required: { value: true } }} />
                                                    </Col>
                                                    <Col sm="6">
                                                        {/*<AvField name="upload_pan" label="Upload PAN *"
                                                            disabled={this.state.isDisabled}
                                                            placeholder="Enter Upload PAN *" type="file" errorMessage="Upload PAN *"
                                                            validate={{ required: { value: true } }} />*/}
                                                        <Link to="#">View / Download</Link>
                                                    </Col>

                                                    <Col sm="6">
                                                        <AvField name="cin" label="CIN/ GST/ TAN"
                                                            disabled={this.state.isDisabled}
                                                            placeholder="Enter CIN/ GST/ TAN" type="text" errorMessage="Enter CIN/ GST/ TAN"
                                                            validate={{ required: { value: true } }} />
                                                    </Col>

                                                    <Col sm="6">
                                                        {/*<AvField name="upload_cin" label="Upload CIN/ GST/ TAN"
                                                            disabled={this.state.isDisabled}
                                                            placeholder="Enter Upload CIN/ GST/ TAN" type="file" errorMessage="Upload CIN/ GST/ TAN"
                                                            validate={{ required: { value: false } }} />*/}
                                                        <Link to="#">View / Download</Link>
                                                    </Col>

                                                    <Col sm="6">
                                                        <Label className="mb-3">Proof Of Identity  </Label>
                                                        <Select
                                                            className="reactselect-invalid mb-3"
                                                            label="Proof Of Identity "
                                                            defaultValue={this.state.routes[0].options[0]}
                                                            required={true}
                                                            onChange={this.handleSelectUserRoute}
                                                            options={this.state.routes}
                                                        />
                                                    </Col>

                                                    <Col sm="6">
                                                        {/*<AvField name="upload_proof_of_identy" label="Proof Of Identity"
                                                            disabled={this.state.isDisabled}
                                                            placeholder="" type="file" errorMessage="Upload Proof Of Identity"
                                                            validate={{ required: { value: false } }} />*/}
                                                        <Link to="#">View / Download</Link>
                                                    </Col>

                                                    <Col sm="6">
                                                        <AvField name="other_documents" label="Other Documents"
                                                            disabled={this.state.isDisabled}
                                                            placeholder="Enter Other Documents" type="email" errorMessage="Enter Other Documents"
                                                            validate={{ required: { value: false } }} />
                                                    </Col>

                                                    <Col sm="6">
                                                        {/*<AvField name="upload_other_documents" label="Upload Other Documents"
                                                            disabled={this.state.isDisabled}
                                                            placeholder="Upload Other Documents" type="file" errorMessage="Upload Other Documents"
                                                            validate={{ required: { value: false } }} />*/}
                                                        <Link to="#">View / Download</Link>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm="12">
                                                        <h6>Authorized Person Information</h6>
                                                    </Col>

                                                    <Col sm="6">
                                                        <AvField name="authorized_name" label="Name"
                                                            disabled={this.state.isDisabled}
                                                            placeholder="Enter Name" type="text" errorMessage="Enter Name"
                                                            validate={{ required: { value: false } }} />
                                                    </Col>

                                                    <Col sm="6">
                                                        {/*<AvField name="upload_other_documents" label="Upload Other Documents"
                                                            disabled={this.state.isDisabled}
                                                            placeholder="Upload Other Documents" type="file" errorMessage="Upload Other Documents"
                                                            validate={{ required: { value: false } }} />*/}
                                                        <Link className="mt-3" to="#">View / Download</Link>
                                                    </Col>

                                                    <Col sm="6">
                                                        <AvField name="authorized_designation" label="Designation"
                                                            disabled={this.state.isDisabled}
                                                            placeholder="Enter Designation" type="text" errorMessage="Enter Designation"
                                                            validate={{ required: { value: false } }} />
                                                    </Col>

                                                    <Col sm="6">
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm="12">
                                                        <h6>Agreement Document</h6>
                                                        {/*<AvField name="upload_other_documents" label="Upload Other Documents"
                                                            disabled={this.state.isDisabled}
                                                            placeholder="Upload Other Documents" type="file" errorMessage="Upload Other Documents"
                                                            validate={{ required: { value: false } }} />*/}
                                                        <Link to="#">View / Download</Link>
                                                    </Col>

                                                </Row>

                                            </AvForm>
                                        </TabPane>
                                        </>
                                        )}
                                    </TabContent>

                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_delete: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h6 className="text-center">Are You Sure You want to delete ?</h6>

                            <FormGroup className="mt-5 text-center">
                                <Button onClick={this.deleteSenderId} type="button" color="danger" className="mr-1">
                                    Delete
                                </Button>
                                <Button type="button" color="secondary" className="mr-1" onClick={() => this.setState({ modal_delete: false })} data-dismiss="modal" aria-label="Close">
                                    Cancel
                                </Button>
                            </FormGroup >

                        </ModalBody>
                    </Modal>

                    <Modal isOpen={this.state.modal_add_limit} toggle={this.tog_add_limit} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_add_limit: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>

                            <AvForm onValidSubmit={this.updateSmsLimit}>
                                {/* <FormGroup >
                                    <AvField name="invoiceNo" label="INVOICE NO :"
                                        disabled={this.state.isDisabled}
                                        placeholder="Enter INVOICE NO" type="text" 
                                        errorMessage="Enter INVOICE NO"
                                        validate={{ required: { value: true } }} />
                                </FormGroup> */}

                                <FormGroup >
                                    <AvField name="smsLimit" label="SMS BALANCE :"
                                        disabled={this.state.isDisabled}
                                        placeholder="Enter SMS LIMIT" type="text" 
                                        value={this.state.clientDetails.smsLimit}
                                        errorMessage="Enter SMS LIMIT"
                                        validate={{ required: { value: true } }} />
                                </FormGroup>
                                <p className="text-muted mb-0 mt-1">Update with previous balance. Enter (-) amount for decrease limit</p>

                                <div className="float-right">
                                    <Button disabled={this.state.isAdding} type="submit" color="success" className="mr-1 mt-2">
                                        {(this.state.isLoading)?'Please Wait...':'Update'}
                                    </Button>
                                </div >
                            </AvForm>

                        </ModalBody>
                    </Modal>

                    <Modal isOpen={this.state.modal_send_sms} toggle={this.tog_send_sms} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_send_sms: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>

                            <AvForm className="p-3" onValidSubmit={this.sendSms} ref={c => (this.form = c)}>
                                        {getLoggedInUser().userType === 'SUPER_ADMIN' && (
                                            <><Label>ROUTES</Label>
                                                <Select
                                                    className="mb-3"
                                                    value={{label: this.state.accountType, value: this.state.accountType}}
                                                    // defaultValue={{label: this.state.clientDetails.companyType, value: this.state.clientDetails.companyType}}
                                                    onChange={this.handleSelectSmsGateway}
                                                    options={getLoggedInUser().routes.map((i)=>({label: i.routeName, value: i.id}))}
                                                />
                                            </>
                                        )}

                                        <Label>SENDER ID</Label>
                                        <Select
                                            className="mb-3"
                                            label="SENDER ID"
                                            name="senderId"
                                            value={this.state.senderIdSelected}
                                            onChange={this.handleSelectGroup}
                                            options={this.state.senderIds}
                                            validate={{ required: { value: true } }} 
                                            required
                                        />


                                        <FormGroup >
                                        <AvField name="message" label="MESSAGE"
                                            // disabled={this.state.isDisabled}
                                            rows={4} type="textarea" 
                                            className="mb-0" 
                                            value={this.state.messageText}
                                            onFocus={ () => this.setState({showSavedMessage: true}) } 
                                            onChange={ (e) => this.setState({messageText: e.target.value}) } 
                                            validate={{ required: { value: true } }} />

                                        <Row>
                                            <Col md="12">
                                                <span style={{marginTop: 0}}>{160 - this.state.messageText.length} CHARACTERS REMAINING <span className="text-success">1 Message (s)</span></span>
                                            </Col>
                                        </Row>
                                        </FormGroup>


                                        <FormGroup className="mt-3 mb-0">
                                            <div className="float-right">
                                                <Button 
                                                    size="sm" 
                                                    type="submit" 
                                                    color="primary"
                                                    disabled={
                                                              this.state.senderIdSelected === '' 
                                                            } 
                                                    className="mr-1">
                                                    <i className="fa fa-paper-plane mr-2"></i> {(this.state.isSending)?'Please Wait...':'Send'}
                                                </Button>

                                            </div>
                                        </FormGroup>

                                    </AvForm>

                        </ModalBody>
                    </Modal>

                    <Modal isOpen={this.state.rechargeModal} toggle={this.tog_recharge} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ rechargeModal: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>

                            <AvForm className="p-3" onValidSubmit={this.doRecharge} ref={c => (this.form = c)}>
                                <h4>Recharge</h4>

                                        <AvField name="amount" label="Credit"
                                        placeholder="Enter Credit Count" type="number" 
                                        errorMessage="Enter Credit Count"
                                        onChange={e=>this.setState({amount: e.target.value})}
                                        validate={{ required: { value: true } }} />

                                        {/* <span>Estimate SMS Count : {(this.state.amount/((this.state.clientDetails.pricing.netPrice+(this.state.clientDetails.pricing.netPrice*0.25)+((this.state.clientDetails.pricing.netPrice+(this.state.clientDetails.pricing.netPrice*0.25)*18)/100))/100)).toFixed(2)}</span> */}

                                        <FormGroup >
                                            <AvField name="remark" label="Remark"
                                                rows={3} type="textarea" 
                                                className="mb-0" 
                                                validate={{ required: { value: true } }} />
                                        </FormGroup>


                                        <div className="float-right">
                                            <Button 
                                                size="sm" 
                                                type="submit" 
                                                color="primary"
                                                disabled={this.state.isRecharging}
                                                className="mr-1">
                                                <i className="fa fa-money mr-2"></i> {(this.state.isRecharging)?'Please Wait...':'Recharge'}
                                            </Button>

                                        </div>

                                    </AvForm>

                        </ModalBody>
                    </Modal>

                    <Modal isOpen={this.state.modal_change_image} toggle={this.tog_update_image} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_change_image: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>

                            <AvForm onValidSubmit={this.updateSmsLimit}>
                                <Label>UPDATE AVATAR</Label>
                                <FormGroup >
                                    <Dropzone onDrop={acceptedFiles => this.handleAcceptedFilesDocument(acceptedFiles)}>
                                        {({ getRootProps, getInputProps }) => (
                                            <div className="dropzone">
                                                <div className="dz-message needsclick" {...getRootProps()}>
                                                    <input {...getInputProps()} />
                                                    <h6 className="font-12">Upload Image</h6>
                                                </div>
                                            </div>
                                        )}
                                    </Dropzone>
                                    <div className="dropzone-previews mt-3" id="file-previews">
                                        {this.state.selectedFilesDocument.map((f, i) => {
                                            return <Card className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete" key={i + "-file"}>
                                                <div className="p-2">
                                                    <Row className="align-items-center">
                                                        <Col className="col-auto">
                                                            <img data-dz-thumbnail="" height="80" className="avatar-sm rounded bg-light" alt={f.name} src={f.preview} />
                                                        </Col>
                                                        <Col className="pl-0">
                                                            <Link to="#" className="text-muted font-weight-bold">{f.name}</Link>
                                                            <p className="mb-0"><strong>{f.formattedSize}</strong></p>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </Card>
                                        })}
                                    </div>
                                </FormGroup>

                                <FormGroup >
                                    <Button 
                                        disabled={this.state.isAdding || this.state.selectedFilesDocument[0] === undefined} 
                                        onClick={this.changeAvatar} color="success" className="mr-1">
                                        {(this.state.isAdding)?'Please Wait...':'Update'}
                                    </Button>
                                </FormGroup >
                            </AvForm>

                        </ModalBody>
                    </Modal>

                    {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            type={this.state.modalType}
                            confirmBtnBsStyle={this.state.modalType}
                            onCancel={()=>this.setState({success_msg:false})}
                            showCloseButton={(this.state.modalType === 'success')?false:true}
                            showConfirm={(this.state.modalType === 'success')?true:false}
                            onConfirm={() => this.setState({success_msg:false})} >
                        </SweetAlert> 
                    }

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, updateSmsBalance, openSnack })(ManageClient));