import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label } from 'reactstrap';
import { activateAuthLayout, updateSmsBalance, getSmsBalance, openSnack } from '../../store/actions';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import {ServerApi} from '../../utils/ServerApi';
import Message from '../../components/LanguageTransliterate/Message'
import SweetAlert from 'react-bootstrap-sweetalert';
import {Radio} from 'antd'
import {getLoggedInUser} from '../../helpers/authUtils';
import ContactsLoading from '../../components/Loading/ContactsLoading';
import SmsSent from '../../components/Loading/SmsSent';
import NoBalance from '../../components/Loading/NoBalance';
import MyTemplates from '../../components/MyTemplates';
import TemplateMessageBox from '../../components/LanguageTransliterate/TemplateMessageBox';
import SmsSending from '../../components/Loading/SmsSending';

class SendGroupSms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedSenderId: null, 
            selectedGroup: null,
            senderId: null, 
            smsGateway: null, 
            isSending: false,
            cSelected: [],
            savedMessages: [],
            message: '',
            modal_type: 'success',
            success_msg: false,
            success_message: '',
            groupLoading: false,
            remaningMessageCharacters: 160,
            totalMobileNumbers: 0,
            sheduleRequired: 'No',
             showSavedMessage: false,
             recipientList:"",
             messageText: '',
             defaultLanguage: "en",
            translationLanguage : "en",
            templateBased: false,
            selectedTemplateId: '',
            combinedMessage:'',
            templates: [],
            default_date: new Date(), default: false, start_date: new Date(), monthDate: new Date(), yearDate: new Date(), end_date: new Date(), date: new Date(),
        };
        this.handleDefault = this.handleDefault.bind(this);
        this.loadRoutes = this.loadRoutes.bind(this);
        this.loadGroups = this.loadGroups.bind(this);
        this.loadSenderIds = this.loadSenderIds.bind(this);
        this.handleSelectGroupSmsGateway = this.handleSelectGroupSmsGateway.bind(this);
        this.handleSelectGroup = this.handleSelectGroup.bind(this);
        this.handleSelectSenderId = this.handleSelectSenderId.bind(this);
        this.loadSavedMessages = this.loadSavedMessages.bind(this);
        this.loadContacts = this.loadContacts.bind(this);
        this.updateMessageHandler = this.updateMessageHandler.bind(this);
        this.savedMessageHandler= this.savedMessageHandler.bind(this);
        this.sendSms = this.sendSms.bind(this);
        this.setMessageText = this.setMessageText.bind(this);
        this.saveDraft = this.saveDraft.bind(this);
        this.loadTemplates = this.loadTemplates.bind(this);
        this.pickedTemplate = this.pickedTemplate.bind(this);
        
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadGroups();
        this.loadSenderIds();
        this.loadSavedMessages();
        // this.loadTemplates();
        this.loadRoutes();
    }

    //Select 
    handleSelectSenderId = (selectedSenderId) => {
        this.loadTemplates(selectedSenderId.value);
        this.setState({ selectedSenderId });
    }
    handleSelectGroup = (selectedGroup) => {
        if(selectedGroup === null){
            this.setState({recipientList: ''})
            return;
        };
        
        this.setState({ selectedGroup });
        //fetch contacts of selected group
        // bind them to group contacts
        this.loadContacts(selectedGroup)
    }

    handleDefault(date) {
        this.setState({ default_date: date });
    }

    handleSelectGroupSmsGateway  = (selectedItem) => {
        this.setState({ smsGateway: selectedItem.value });
    }
    
    updateMessageHandler (message) {
        console.log("onMessageChange - parent - group")
        this.setState({messageText: message})
    }
    savedMessageHandler () {
        this.setState({ showSavedMessage: true });
    }

    setMessageText(value) {
        console.log(value)
        if(value != null) { 
            this.setState({ messageText: value });
        }
    }

    handleChange = e => {
        const { name, value } = e.target;

        this.setState({
          [name]: value
        });
    };

    loadSenderIds(){
        if (getLoggedInUser().templateBased) {
            this.setState({ templateBased: true })
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

    loadRoutes(){

        var arr = getLoggedInUser().routes.map(obj => ({
            label: obj.routeName,
            value: obj.id,
        }))

        this.setState({smsGateways: arr})

        // ServerApi().get('routes')
        //   .then(res => {
        //     if (res.data === undefined) {
        //         return false;
        //     } 

        //     var arr = res.data.map(obj => ({
        //         label: obj.routeName,
        //         value: obj.id,
        //     }))

        //     this.setState({smsGateways: arr})
        // })
        // .catch(error => console.log('error', error));
    }

    loadSavedMessages() {
        ServerApi().get('sms/getAllSmsTemplates')
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 

            this.setState({savedMessages: res.data})
            console.log(this.state.savedMessages);
        })
        .catch(error => console.log('error', error));
    }

    loadGroups() {
        ServerApi().get(`groups/getActiveGroups/${getLoggedInUser().id}`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 

            // console.log(res.data);
            var arr = res.data.map(obj => ({
                label: obj.groupName + "  ("+obj.contactsCount + ")",
                value: obj,
            }))

            this.setState({groups: arr})
        })
        .catch(error => console.log('error', error));
    }

    loadContacts(selectedGroups){

        this.setState({groupLoading: true});

        var raw = [];
        selectedGroups.map((item,index) => {
            raw[index] = item.value.id;
            return true;
        })

        ServerApi().post('groups/getContacts', raw)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }
            
            var numbers = [];
            res.data.map(item=>{
                numbers.push(item.mobile);
                return true;
            });  
            this.setState({groupLoading: false, recipientList: numbers.join(',') })
        })
        .catch(error => console.log('error', error));
    }

    loadTemplates(){
        ServerApi().get(`sms/getAllSmsTemplates`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 
            let approvedTemplates = res.data.filter(i=>i.status!==0)
            this.setState({templates: approvedTemplates})
        })
        .catch(error => console.log('error', error));
    }

    pickedTemplate(id) {
        const { templates } = this.state;
        const selected = templates.filter(i => i.id === id);
        this.setState({ variableValues: {}, selectedTemplateId: id, messageText: selected && selected.length > 0 ? selected[0].message : "" })
    }

    sendSms(event, values){
        if(this.state.selectedSenderId === null || values.recipients === null || values.recipients === ''){
            this.props.openSnack({type: 'error', message: 'Please enter all required fields.'})
            return false;
        }
        //if(!this.state.templateBased){
            if (this.state.messageText.trim()===""){
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
                // smsGateway: (this.state.smsGateway !== null)?this.state.smsGateway:'',
                smsGateway: (getLoggedInUser().userType === 'RESELLER' || getLoggedInUser().userType === 'USER')?getLoggedInUser().routes[0].id:this.state.smsGateway,
                senderId:this.state.selectedSenderId.value,
                countryCode:"+91",
                globalStatus:"true",
                recipients : values.recipients,
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
            // console.log(data);
            // alert(data.response)
            this.setState({
                selectedSenderId: {label: 'Select', value: 0},
                messageText: '',
                recipients: '',
                selectedGroup: null,
            });

            setTimeout(()=>{
                this.setState({isSending: false});
                this.props.openSnack({type: 'success', message: 'SMS sent.'})
            },2300)

            this.form && this.form.reset();
            this.loadBalance();
          })
          .catch(error => {
            this.props.openSnack({type: 'error', message: 'Unable to send SMS'});
            this.setState({isSending: false});
            console.log('error', error);
          });
    }

    // for user
    loadBalance(){
        if(getLoggedInUser().userType === 'SUPER_ADMIN'){return false;}

        // console.log(this.props.getSmsBalance());

        ServerApi().get(`client/getBalance/${getLoggedInUser().id}`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 
            
            this.props.updateSmsBalance(Math.round((parseFloat(res.data.response) + Number.EPSILON) * 1000000) / 1000000);
        })
        .catch(error => console.log('error', error));
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
                return false;
            } 

            // this.setState({savedMessages: res.data})
            this.setState({modal_type: 'success', success_msg: true, success_message : 'Message saved as draft', isDrafting: false});
            
            setTimeout(()=>{
                window.location.reload()
            },750);
        })
        .catch(error => console.log('error', error));
    }

    render() {
        const { selectedSenderId } = this.state;

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">

                            <Col sm="6">
                                <h4 className="page-title">SEND GROUP SMS</h4>
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
                                                    label="ROUTE"
                                                    name="smsGateway"
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
                                                    value={selectedSenderId}
                                                    onChange={this.handleSelectSenderId}
                                                    options={this.state.senderIds}
                                                    validate={{ required: { value: true } }} 
                                                    required
                                                />
                                            </Col>
                                        </Row>

                                        <Label>GROUP</Label>
                                            <Select
                                                className="mb-3 field-required"
                                                isMulti
                                                label="GROUP"
                                                name="groups"
                                                onChange={this.handleSelectGroup}
                                                options={this.state.groups}
                                            />
                                        

                                        {/*<FormGroup>
                                            <Label>CAMPAIGN KEYWORD Only work with two way sms gateway provider</Label>
                                                <Select
                                                    label="CAMPAIGN KEYWORD Only work with two way sms gateway provider"
                                                    value={selectedGroup}
                                                    onChange={this.handleSelectGroup}
                                                    options={SMS_GATEWAY}
                                                />
                                        </FormGroup>
                                        
                                        <FormGroup>
                                            <Label>SMS TEMPLATES</Label>
                                                <Select
                                                    label="SMS TEMPLATES"
                                                    value={selectedGroup}
                                                    onChange={this.handleSelectGroup}
                                                    options={SMS_GATEWAY}
                                                />
                                        </FormGroup>*/}
                                        
                                        {this.state.groupLoading && (
                                            <FormGroup>
                                                <ContactsLoading />
                                            </FormGroup>
                                        )}

                                        <FormGroup className="mb-3">
                                        <AvField 
                                            name="recipients" placeholder="Groups Contacts" 
                                            label ="Groups Contacts"
                                            type="textarea" 
                                            rows={3} 
                                            errorMessage="Enter Groups Contacts"
                                            validate={{ required: { value: true } }} 
                                            style={{marginBottom: 0}} 
                                            value={this.state.recipientList}
                                            />
                                        <Row>
                                            {/* <Col md="6">
                                                <AvField inline tag={CustomInput} name="form_as_header" label="REMOVE DUPLICATE"
                                                    type="checkbox" 
                                                    validate={{ required: { value: false } }} />
                                            </Col> */}
                                            <Col md="6 mb-3 ">
                                                <span className="caption">No of mobile numbers <b>{this.state.totalMobileNumbers}</b></span>
                                            </Col>
                                        </Row>
                                        </FormGroup>

                                        {this.state.templateBased && this.state.selectedTemplateId && (
                                            //<TemplateMessageBox setCombinedMessage={(combinedMessage)=>this.setState({combinedMessage})} selectedTemplateId={this.state.selectedTemplateId} templates={this.state.templates} />
                                            <Message messageText={this.state.messageText} messageHandler={this.updateMessageHandler} savedMessageHandler={this.savedMessageHandler} noExtraOptions={true} />
                                        )}
                                        
                                        {!this.state.templateBased && (
                                            <Message messageText={this.state.messageText} messageHandler={this.updateMessageHandler} savedMessageHandler={this.savedMessageHandler}/>
                                        )}

                                        <div>
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
                                        </div>


                                        <div className="mt-3 mb-0">
                                            <div>
                                                <Button size="sm" style={{float: 'right'}} type="submit" disabled={this.state.isSending} color="primary" className="mr-1">
                                                    <i className="fa fa-paper-plane mr-2"></i> {(this.state.isSending)?'Please Wait...':'Send'}
                                                </Button>
                                                {/* <Button onClick={()=>this.saveDraft()} size="sm" disabled={this.state.isDrafting} type="button" color="secondary" style={{float: 'right'}} className="mr-1">
                                                    <i className="fa fa-save mr-2"></i> {(this.state.isDrafting)?'Please Wait...':'Save Draft'}
                                                </Button> */}

                                            </div>
                                        </div>

                                    </AvForm>

                                </CardBody>
                            </Card>
                        </Col>

                        {this.state.selectedSenderId !== null && this.state.templateBased && (this.state.templates.length > 0) &&
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
                            // title={this.state.success_message}
                            confirmBtnBsStyle={this.state.modal_type}
                            onConfirm={() => window.location.reload()} 
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

                </Container>
            </React.Fragment>
        );
    }
}

// export default withRouter(connect(null, { activateAuthLayout })(SendGroupSms));

const mapStatetoProps = state => {
    const {sms_balance} = state.User;
    const {sms_type} = state.Sms;
    return { sms_balance, sms_type };
  }
  
export default withRouter(connect(mapStatetoProps, { activateAuthLayout, updateSmsBalance, getSmsBalance, openSnack })(SendGroupSms));