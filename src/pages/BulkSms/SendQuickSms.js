/* eslint-disable no-script-url */
import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Label } from 'reactstrap';
import { activateAuthLayout, openSnack, updateSmsBalance, getSmsBalance } from '../../store/actions';
// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import {ServerApi} from '../../utils/ServerApi';
import Message from '../../components/LanguageTransliterate/Message'
import { Radio } from 'antd';
import {getLoggedInUser} from '../../helpers/authUtils';
// import googleTransliterate from 'google-input-tool';
import Tags from '../../components/Tags';
import SmsSent from '../../components/Loading/SmsSent'; 
import NoBalance from '../../components/Loading/NoBalance';
import SmsSending from '../../components/Loading/SmsSending';
// import Fab from '@mui/material/Fab';
// import AddIcon from '@material-ui/icons/Add';
// import SpeakerNotesOutlinedIcon from '@material-ui/icons/SpeakerNotesOutlined';
import MyTemplates from '../../components/MyTemplates';
import TemplateMessageBox from '../../components/LanguageTransliterate/TemplateMessageBox';

// --- KEY CHANGES (IMPORTS) ---
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated
import Swal from 'sweetalert2'; // ADDED: Modern Alert Library
import withReactContent from 'sweetalert2-react-content'; // ADDED: React wrapper
import { FormControl } from '@mui/material';
// --- END KEY CHANGES ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

class SendQuickSms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            senderId: null, 
            smsGateway: null, 
            selectedMulti: null,
            cSelected: [],
            message: '',
            remaningMessageCharacters: 160,
            totalMobileNumbers: 0,
            sheduleRequired: 'No',
            showSavedMessage: false,
            savedMessages: [],
            templates: [],
            templateSelect: [],
            selectedTemplateId: '',
            messageText: '',
            isSending: false,
            
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed, as SweetAlert2 is called imperatively
            // success_msg: false,
            // success_message: '',
            // modal_standard: false,
            // modal_type: 'success',
            // --- END KEY CHANGE ---
            
            recipientList:'',
            defaultLanguage: "en",
            translationLanguage : "en",
            isDrafting: false,
            templateBased: false,
            clear: false,
            combinedMessage:'',
            default_date: new Date(), default: false, start_date: new Date(), monthDate: new Date(), yearDate: new Date(), end_date: new Date(), date: new Date(),
            senderIds: [
                            {
                                label: "Select Sender Id",
                                options: [
                                    { label: "Nothing Selected", value: "" }
                                ]
                            }
                        ],
            smsGateways: [
                            {
                                label: "SMS Gateways",
                                options: [
                                    { label: "None", value: "None" }
                                ]
                            }
                        ],
        };
        // ... (constructor bindings remain unchanged)
        this.handleDefault = this.handleDefault.bind(this);
        this.sendSms = this.sendSms.bind(this);
        this.loadRoutes = this.loadRoutes.bind(this);
        this.loadSenderIds = this.loadSenderIds.bind(this);
        this.handleSelectGroupSmsGateway = this.handleSelectGroupSmsGateway.bind(this);
        this.loadSavedMessages = this.loadSavedMessages.bind(this);
        this.selectedTags = this.selectedTags.bind(this);
        this.updateMessageHandler = this.updateMessageHandler.bind(this);
        this.savedMessageHandler= this.savedMessageHandler.bind(this);
        this.savedMessageHandlerHide= this.savedMessageHandlerHide.bind(this);
        this.saveDraft = this.saveDraft.bind(this);
        this.loadTemplates = this.loadTemplates.bind(this);
        this.pickedTemplate = this.pickedTemplate.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadSenderIds();
        this.loadRoutes();
        // this.loadTemplates();
        // this.loadSavedMessages();
    }
    
    // ... (all handle and load methods remain unchanged)

    //Select 
    handleSelectGroup = (senderId) => {
        this.loadTemplates(senderId.value);
        this.setState({ senderId });
    }

    handleDefault(date) {
        this.setState({ default_date: date });
    }

    handleChange = e => {
        console.log(this.state.sms_balance);
        
        const { name, value } = e.target;

        this.setState({
          [name]: value
        });
    };

    handleSelectGroupSmsGateway  = (selectedItem) => {
        this.setState({ smsGateway: selectedItem.value });
    }
    
    loadSenderIds(){
        if(getLoggedInUser().templateBased){
            this.setState({templateBased: true})
        }
        ServerApi().get(`getAllSenderIds/${getLoggedInUser().id}`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 

            let approvedIds = res.data.filter((i)=>i.status==='Approved');

            let approvedIdsOptions = approvedIds.map(obj => ({
                label: obj.senderId,
                value: obj.senderId,
            }))

            this.setState({senderIds: approvedIdsOptions})
        })
        .catch(error => console.log('error', error));
    }

    loadTemplates(id){
        ServerApi().get(`sms/getTemplatesBySenderId/${id}`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 
            let approvedTemplates = res.data.filter(i=>i.status!==0)
            this.setState({templates: approvedTemplates})
        })
        .catch(error => console.log('error', error));
    }

    loadRoutes(){
        var arr = getLoggedInUser().routes.map(obj => ({
            label: obj.routeName,
            value: obj.id,
        }))

        this.setState({smsGateways: arr})
    }

    sendSms(event, values){
        // ... (all validation checks remain unchanged)
        if(this.state.senderId === null || this.state.recipients === undefined ){
            this.props.openSnack({type: 'error', message: 'Please enter all required fields.'})
            return false;
        }
        if(this.state.messageText.trim()===""){
            this.props.openSnack({type: 'error', message: 'Please enter all required fields.'})
            return false;
        }
        if(getLoggedInUser().userType === 'ADMIN' || getLoggedInUser().userType === 'SUPER_ADMIN'){
            if(this.state.smsGateway === null){
                this.props.openSnack({type: 'error', message: 'Please enter all required fields.'})
                return false;
            }
        }

        //API
        this.setState({isSending: true});

        // --- KEY CHANGE (LOADING SWEETALERT) ---
        // Show the loading modal *before* making the API call
        MySwal.fire({
            title: 'Sending SMS...',
            html: <SmsSending />, // Use the existing React component
            showConfirmButton: false,
            allowOutsideClick: false
        });
        // --- END KEY CHANGE ---

        var raw = JSON.stringify({
            requestType: "QUICKSMS",
            payload:{
                smsGateway: (getLoggedInUser().userType === 'RESELLER' || getLoggedInUser().userType === 'USER')?getLoggedInUser().routes[0].id:this.state.smsGateway,
                senderId:this.state.senderId.value,
                countryCode:"+91",
                globalStatus:"true",
                recipients : this.state.recipients,
                delimiter : ",",
                removeDuplicate : "true",
                messageType : this.props.sms_type,
                message: this.state.messageText,
                templateId: this.state.selectedTemplateId,
            }
        });

        ServerApi().post('sms/sendQuickSms', raw)
          .then(res => {
            if(res.data.status){
                if(res.data.response === 'Invalid templateID provided'){
                    // --- KEY CHANGE (CLOSE LOADING ALERT) ---
                    MySwal.close(); // Close the loading modal
                    // --- END KEY CHANGE ---
                    this.props.openSnack({type: 'error', message: 'Invalid templateID provided'})
                    this.setState({isSending: false});
                    return;
                }
                this.setState({
                    senderId: {label: 'Select', value: 0},
                    recipients: undefined,
                    messageText: '',
                    clear: !this.state.clear,
                });
                
                setTimeout(()=>{
                    // --- KEY CHANGE (CLOSE LOADING ALERT) ---
                    MySwal.close(); // Close the loading modal
                    // --- END KEY CHANGE ---
                    this.setState({isSending: false});
                    this.props.openSnack({type: 'success', message: 'Message sent.'})
                },2300)
                
                this.form && this.form.reset();
            }else{
                // --- KEY CHANGE (CLOSE LOADING ALERT) ---
                MySwal.close(); // Close the loading modal
                // --- END KEY CHANGE ---
                this.setState({isSending: false});
                this.props.openSnack({type: 'error', message: res.data.message})
            }

            this.loadBalance();
          })
          .catch(error => {
              // --- KEY CHANGE (CLOSE LOADING ALERT) ---
              MySwal.close(); // Close the loading modal on error
              // --- END KEY CHANGE ---
              this.setState({isSending: false});
              this.props.openSnack({type: 'error', message: 'An error occurred.'});
              console.log('error', error)
          });
    }

    loadSavedMessages() {
        // ... (loadSavedMessages function remains unchanged)
    }

    updateMessageHandler (message) {
        this.setState({messageText: message});
    }
    savedMessageHandler () {
        this.setState({ showSavedMessage: true });
    }

    savedMessageHandlerHide(){
        this.setState({ showSavedMessage: false });
    }

    loadBalance(){
        // ... (loadBalance function remains unchanged)
    }

    selectedTags(recipients){
        this.setState({totalMobileNumbers: recipients.length, recipients: recipients.join()})
    }

    saveDraft() {
        // ... (saveDraft validation remains unchanged)
        if(this.state.messageText === ''){
            return false;
        }

        this.setState({isDrafting: true});

        // --- KEY CHANGE (LOADING SWEETALERT) ---
        // Show the loading modal *before* making the API call
        MySwal.fire({
            title: 'Saving Draft...',
            html: <SmsSending />,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        // --- END KEY CHANGE ---
        
        let raw = JSON.stringify({
            templateName: this.state.messageText.replace(' ', '_'),
            message: this.state.messageText
        });

        ServerApi().post('sms/saveSmsTemplate', raw)
          .then(res => {
            // --- KEY CHANGE (CLOSE LOADING ALERT) ---
            MySwal.close(); // Close the loading modal
            // --- END KEY CHANGE ---

            if (res.data === undefined) {
                this.props.openSnack({type: 'error', message: 'Unable to save message'})
                return false;
            } 

            this.props.openSnack({type: 'success', message: 'Message saved as draft'})
            this.setState({
                isDrafting: false,
                smsGateway: '',
                senderId: '',
                messageText: '',
                totalMobileNumbers: 0,
                recipientList: '',
                recipients: []
            });
            
          })
          .catch(error => {
              // --- KEY CHANGE (CLOSE LOADING ALERT) ---
              MySwal.close(); // Close the loading modal on error
              // --- END KEY CHANGE ---
              this.setState({isDrafting: false});
              this.props.openSnack({type: 'error', message: 'An error occurred while saving.'});
              console.log('error', error)
          });
    }

    pickedTemplate(id) {
        const { templates } = this.state;
        const selected = templates.filter(i => i.id === id);
        this.setState({ selectedTemplateId: id, messageText: selected && selected.length > 0 ? selected[0].message : ""});
    }

    render() {
        const { senderId } = this.state;

        return (
            <React.Fragment>

                <Container fluid>
                    {/* ... (All JSX in the render method remains unchanged, EXCEPT for the SweetAlert blocks) ... */}
                    
                    <div className="page-title-box">
                        <Row className="align-items-center">

                            <Col sm="6">
                                <h4 className="page-title">SEND QUICK SMS</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="6">
                            <Card>
                                <CardBody>

                                    <FormControl onValidSubmit={this.sendSms} ref={c => (this.form = c)}>
                                        {/* ... (Form JSX remains unchanged) ... */}
                                        <Row className="mb-2">
                                            {getLoggedInUser().userType !== 'RESELLER' && getLoggedInUser().userType !== 'CLIENT' && (
                                            <Col md="12">
                                                <Label>SMS Gateway</Label>
                                                    <Select
                                                        className="mb-3 field-required"
                                                        label="SMS Gateway"
                                                        name="smsGateway"
                                                        clearValue
                                                        onChange={this.handleSelectGroupSmsGateway}
                                                        options={this.state.smsGateways}
                                                        validate={{ required: { value: true } }} 
                                                        required
                                                    />
                                            </Col>
                                            )}
                                            <Col md="12">
                                                <Label>SENDER ID</Label>
                                                    <Select
                                                        className="mb-3 field-required"
                                                        label="SENDER ID"
                                                        name="senderId"
                                                        value={senderId}
                                                        onChange={this.handleSelectGroup}
                                                        options={this.state.senderIds}
                                                        validate={{ required: { value: true } }} 
                                                        required
                                                    />
                                            </Col>
                                        </Row>

                                        <Label>RECIPIENTS</Label>
                                        <Tags className="field-required" clear={this.state.clear} savedMessageHandlerHideText={this.savedMessageHandlerHide} selectedTags={this.selectedTags}  tags={[]}/>

                                        <Row >
                                            <Col md="6 mb-3 ">
                                                <span className="caption" >No of mobile numbers <b>{this.state.totalMobileNumbers}</b></span>
                                            </Col>
                                        </Row>

                                        {this.state.templateBased && this.state.selectedTemplateId && (
                                            <Message className="field-required" messageText={this.state.messageText} messageHandler={this.updateMessageHandler} savedMessageHandler={this.savedMessageHandler} noExtraOptions={ true }/>
                                        )}
                                        
                                        {!this.state.templateBased && (
                                            <Message className="field-required" messageText={this.state.messageText} messageHandler={this.updateMessageHandler} savedMessageHandler={this.savedMessageHandler}/>
                                        )}

                                        <div >
                                            <Radio.Group onChange={this.handleChange} name="sheduleRequired" value={this.state.sheduleRequired}>
                                                <Label style={{marginRight: '10px'}}>Send Later: </Label>
                                                <Radio value={'Yes'}>Yes</Radio>
                                                <Radio value={'No'}>No</Radio>
                                            </Radio.Group>

                                            {this.state.sheduleRequired === 'Yes' && 
                                                <DatePicker
                                                    className="form-control"
                                                    selected={this.state.default_date}
                                                    onChange={this.handleDefault}
                                                    showTimeSelect
                                                    dateFormat="Pp"
                                                />
                                            }
                                        </div >

                                        <div className="mt-3 mb-0">
                                            <div>
                                                <Button size="sm" type="submit" color="primary" style={{float: 'right'}} className="mr-1">
                                                    <i className="fa fa-paper-plane mr-2"></i> {(this.state.isSending)?'Please Wait...':'Send'}
                                                </Button>
                                                {/* (saveDraft button remains unchanged) */}
                                            </div>
                                        </div>
                                    </FormControl>

                                </CardBody>
                            </Card>
                        </Col>

                        {this.state.senderId !== null && this.state.templateBased && (this.state.templates.length > 0) &&
                            <MyTemplates templates={this.state.templates} pickedTemplate={this.pickedTemplate} />
                        }
                    </Row>
                    
                    {/* --- KEY CHANGE (SWEETALERT BLOCKS DELETED) --- */}
                    {/* Both <SweetAlert> blocks (for loading and success) are
                        deleted from the render method. They are now triggered
                        imperatively (as function calls) in the 'sendSms' 
                        and 'saveDraft' methods. */}

                    {/* {(this.state.isSending || this.state.isDrafting) &&
                        <SweetAlert ... >
                        </SweetAlert> 
                    } */}

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

// ... (mapStateToProps and export remain unchanged)
const mapStatetoProps = state => {
    const {sms_balance} = state.User;
    const {sms_type} = state.Sms;
    return { sms_balance, sms_type };
  }
  
export default connect(mapStatetoProps, { activateAuthLayout, openSnack, updateSmsBalance, getSmsBalance })(SendQuickSms);