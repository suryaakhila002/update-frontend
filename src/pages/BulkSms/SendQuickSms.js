/* eslint-disable no-script-url */
import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Label } from 'reactstrap';
import { activateAuthLayout, openSnack, updateSmsBalance, getSmsBalance } from '../../store/actions';
import { AvForm } from 'availity-reactstrap-validation';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import SweetAlert from 'react-bootstrap-sweetalert';
import {ServerApi} from '../../utils/ServerApi';
import Message from '../../components/LanguageTransliterate/Message'
import { Radio } from 'antd';
import {getLoggedInUser} from '../../helpers/authUtils';
// import googleTransliterate from 'google-input-tool';
import Tags from '../../components/Tags';
import SmsSent from '../../components/Loading/SmsSent'; 
import NoBalance from '../../components/Loading/NoBalance';
import SmsSending from '../../components/Loading/SmsSending';
// import Fab from '@material-ui/core/Fab';
// import AddIcon from '@material-ui/icons/Add';
// import { AvField } from 'availity-reactstrap-validation';
// import SpeakerNotesOutlinedIcon from '@material-ui/icons/SpeakerNotesOutlined';
import MyTemplates from '../../components/MyTemplates';
import TemplateMessageBox from '../../components/LanguageTransliterate/TemplateMessageBox';

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
            success_msg: false,
            success_message: '',
            recipientList:'',
            defaultLanguage: "en",
            translationLanguage : "en",
            modal_standard: false,
            modal_type: 'success',
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
        if(this.state.senderId === null || this.state.recipients === undefined ){
            this.props.openSnack({type: 'error', message: 'Please enter all required fields.'})
            return false;
        }
        //if(!this.state.templateBased){
            if(this.state.messageText.trim()===""){
                this.props.openSnack({type: 'error', message: 'Please enter all required fields.'})
                return false;
            }
        //}

        if(getLoggedInUser().userType === 'ADMIN' || getLoggedInUser().userType === 'SUPER_ADMIN'){
            if(this.state.smsGateway === null){
                this.props.openSnack({type: 'error', message: 'Please enter all required fields.'})
                return false;
            }
        }

        //API
        this.setState({isSending: true});

        var raw = JSON.stringify({
            requestType: "QUICKSMS",
            payload:{
                smsGateway: (getLoggedInUser().userType === 'RESELLER' || getLoggedInUser().userType === 'USER')?getLoggedInUser().routes[0].id:this.state.smsGateway,
                // smsGateway: (this.state.smsGateway !== null)?this.state.smsGateway:'',
                senderId:this.state.senderId.value,
                countryCode:"+91",
                globalStatus:"true",
                recipients : this.state.recipients,
                delimiter : ",",
                removeDuplicate : "true",
                messageType : this.props.sms_type,
                //message : (this.state.templateBased)?this.state.combinedMessage:this.state.messageText,
                message: this.state.messageText,
                templateId: this.state.selectedTemplateId,
            }
        });

        ServerApi().post('sms/sendQuickSms', raw)
          .then(res => {
            if(res.data.status){
                if(res.data.response === 'Invalid templateID provided'){
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
                    this.setState({isSending: false});
                    this.props.openSnack({type: 'success', message: 'Message sent.'})
                },2300)
                
                this.form && this.form.reset();
            }else{
                this.setState({isSending: false});
                this.props.openSnack({type: 'error', message: res.data.message})
            }

            this.loadBalance();
            // updateLoggeedInUserSmsBalance(res.data);
          })
          .catch(error => console.log('error', error));
    }

    loadSavedMessages() {
        ServerApi().get('sms/getAllSmsTemplates')
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 

            this.setState({savedMessages: res.data})
        })
        .catch(error => console.log('error', error));
    }

    updateMessageHandler (message) {
        this.setState({messageText: message});
        // console.log("onMessageChange - parent - quick")
        // this.setState({messageText: message.split(/[ ,]+/).join(',')})
        // console.log(message.split(/[ ,]+/).join(','));
    }
    savedMessageHandler () {
        this.setState({ showSavedMessage: true });
    }

    savedMessageHandlerHide(){
        this.setState({ showSavedMessage: false });
    }

    // for user
    loadBalance(){
        if(getLoggedInUser().userType === 'SUPER_ADMIN'){return false;}
        
        ServerApi().get(`client/getBalance/${getLoggedInUser().id}`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 

            console.log(res.data.response);

            this.props.updateSmsBalance(Math.round((parseFloat(res.data.response) + Number.EPSILON) * 1000000) / 1000000);
        }) 
        .catch(error => console.log('error', error));
    }

    selectedTags(recipients){
        // console.log('tags');
        // console.log(tags);

        this.setState({totalMobileNumbers: recipients.length, recipients: recipients.join()})
    }

    saveDraft() {
        console.log('saveDraft')
        console.log(this.state.messageText)
        if(this.state.messageText === ''){
            return false;
        }

        this.setState({isDrafting: true});
        
        let raw = JSON.stringify({
            templateName: this.state.messageText.replace(' ', '_'),
            message: this.state.messageText
        });

        ServerApi().post('sms/saveSmsTemplate', raw)
          .then(res => {
            if (res.data === undefined) {
                this.props.openSnack({type: 'error', message: 'Unable to save message'})
                return false;
            } 

            // this.setState({savedMessages: res.data})
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
            
            // setTimeout(()=>{
            //     window.location.reload()
            //     // this.setState({isSending: false, success_msg: false});
            // },1500);
        })
        .catch(error => console.log('error', error));
    }

    // handleTemplateVarInput(e) {
    //     const value = e.target.value;
    //     this.setState({variableValues:{...this.state.variableValues, [e.target.name]: value}});
    // }

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

                                    <AvForm onValidSubmit={this.sendSms} ref={c => (this.form = c)}>

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

                                        {/* <AvField placeholder="Numbers must be separated by comma" 
                                            label ="RECIPIENTS"
                                            name="recipients"
                                            // onChange={(e)=> this.setState({totalMobileNumbers: e.target.value.split(",").length - 1})}
                                            onChange={this.}
                                            value={this.state.recipientList}
                                            type="textarea" rows={3} 
                                            errorMessage="Enter recipients."
                                            validate={{ required: { value: true } }} 
                                            onFocus={ () => this.setState({showSavedMessage: false})}
                                            style={{marginBottom: 0}} /> */}
                                        <Row >
                                            {/* <Col md="6">
                                                <AvField className="fixedHeight" inline tag={CustomInput} name="form_as_header" label="REMOVE DUPLICATE"
                                                    type="checkbox" 
                                                    validate={{ required: { value: false } }} />
                                            </Col> */}
                                            <Col md="6 mb-3 ">
                                                <span className="caption" >No of mobile numbers <b>{this.state.totalMobileNumbers}</b></span>
                                            </Col>

                                        </Row>

                                        {this.state.templateBased && this.state.selectedTemplateId && (
                                            // <TemplateMessageBox setCombinedMessage={(combinedMessage)=>this.setState({combinedMessage})} selectedTemplateId={this.state.selectedTemplateId} templates={this.state.templates} />
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

                                                {/* {!this.state.templateBased && (
                                                <Button onClick={()=>this.saveDraft()} size="sm" disabled={this.state.isDrafting} type="button" color="secondary" style={{float: 'right'}} className="mr-1">
                                                    <i className="fa fa-save mr-2"></i> {(this.state.isDrafting)?'Please Wait...':'Save Draft'}
                                                </Button>
                                                )} */}

                                            </div>
                                        </div>

                                    </AvForm>

                                </CardBody>
                            </Card>
                        </Col>

                        {this.state.senderId !== null && this.state.templateBased && (this.state.templates.length > 0) &&
                            <MyTemplates templates={this.state.templates} pickedTemplate={this.pickedTemplate} />
                        }


                    </Row>

                    {(this.state.isSending || this.state.isDrafting) &&
                        <SweetAlert
                            showConfirm={false}
                            style={{margin: 'inherit', backgroundColor: 'none'}}
                        >
                            <SmsSending />
                        </SweetAlert> 
                    }

                    {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            showConfirm={false}
                            // title={this.state.success_message}
                            // confirmBtnBsStyle={this.state.modal_type}
                            // onConfirm={() => window.location.reload()} 
                            // type={this.state.modal_type} 
                        >
                            {this.state.success_message === 'Insufficient credits' && (
                                <NoBalance />
                            )}
                            {this.state.success_message !== 'Insufficient credits' && (
                                <SmsSent />
                            )}
                            <h6>{this.state.success_message}</h6>
                        </SweetAlert> 
                    }

                    {/* <Fab onClick={()=>this.setState({templateBased: !this.state.templateBased})} style={{position: 'fixed',right: '20px', bottom: '20px'}} variant="extended">
                        <SpeakerNotesOutlinedIcon className="mr-1" />
                        Template Based
                    </Fab> */}

                </Container>
            </React.Fragment>
        );
    }
}


const mapStatetoProps = state => {
    const {sms_balance} = state.User;
    const {sms_type} = state.Sms;
    return { sms_balance, sms_type };
  }
  
// export default withRouter(connect(mapStatetoProps)(Layout));

export default withRouter(connect(mapStatetoProps, { activateAuthLayout, openSnack, updateSmsBalance, getSmsBalance })(SendQuickSms));