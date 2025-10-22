import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label, Table } from 'reactstrap';
import { activateAuthLayout, openSnack, updateSmsBalance, getSmsBalance } from '../../store/actions';
import { AvForm} from 'availity-reactstrap-validation';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import SweetAlert from 'react-bootstrap-sweetalert';
import Dropzone from 'react-dropzone';
import {ServerApi} from '../../utils/ServerApi';
import Message from '../../components/LanguageTransliterate/Message'
import {Radio} from 'antd'
import {getLoggedInUser} from '../../helpers/authUtils';
import Uploading from '../../components/Loading/Uploading';
import SmsSent from '../../components/Loading/SmsSent';
import NoBalance from '../../components/Loading/NoBalance';
import MyTemplates from '../../components/MyTemplates';
import TemplateMessageBox from '../../components/LanguageTransliterate/TemplateMessageBox';
import SmsSending from '../../components/Loading/SmsSending';

class SendSmsFile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: null, 
            selectedMulti: null,
            cSelected: [],
            sheduleRequired: 'No',
            success_msg: false,
            showSavedMessage: false,
            fileDetailModal: false,
            uploadingModal: false,
            isSending: false,
            fileContentResponse: {},
            messageText: '',
            defaultLanguage: "en",
            translationLanguage : "en",
            senderId: '',
            selectedUploadFile: [],
            savedMessage: [],
            templateBased: false,
            selectedTemplateId: '',
            combinedMessage:'',
            templates: [],
            selectedSenderId: null,
            default_date: new Date(), default: false, start_date: new Date(), monthDate: new Date(), yearDate: new Date(), end_date: new Date(), date: new Date(),
        };
        this.onCheckboxBtnClick = this.onCheckboxBtnClick.bind(this);
        this.handleDefault = this.handleDefault.bind(this);
        this.loadRoutes = this.loadRoutes.bind(this);
        this.handleSelectGroupSmsGateway = this.handleSelectGroupSmsGateway.bind(this);
        this.sendSms = this.sendSms.bind(this);
        this.handleSelectSenderId = this.handleSelectSenderId.bind(this);
        this.updateMessageHandler = this.updateMessageHandler.bind(this);
        this.savedMessageHandler= this.savedMessageHandler.bind(this);
        this.loadSavedMessages = this.loadSavedMessages.bind(this);
        this.saveDraft = this.saveDraft.bind(this);
        this.loadTemplates = this.loadTemplates.bind(this);
        this.pickedTemplate = this.pickedTemplate.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadSenderIds();
        this.loadSavedMessages();
        this.loadRoutes();
        // this.loadTemplates();
    }

    //Select 
    handleSelectGroup = (selectedGroup) => {
        this.setState({ selectedGroup });
    }

    handleDefault(date) {
        this.setState({ default_date: date });
    }

    handleChange = e => {
        const { name, value } = e.target;

        this.setState({
          [name]: value
        });
    };

    setMessageText(value) {
        console.log(value)
        if(value != null) { 
            this.setState({ messageText: value });
        }
    }

    updateMessageHandler (message) {
        this.setState({messageText: message})
    }
    savedMessageHandler () {
        this.setState({ showSavedMessage: true });
    }

    handleSelectGroupSmsGateway  = (selectedItem) => {
        this.setState({ smsGateway: selectedItem.value });
    }
    handleSelectSenderId = (selectedSenderId) => {
        this.loadTemplates(selectedSenderId.value);
        this.setState({ selectedSenderId });
    }

    loadRoutes(){

        var arr = getLoggedInUser().routes.map(obj => ({
            label: obj.routeName,
            value: obj.id,
        }))

        this.setState({smsGateways: arr})
    }

    loadSenderIds() {
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

    onCheckboxBtnClick(selected) {
        const index = this.state.cSelected.indexOf(selected);
        if (index < 0) {
            this.state.cSelected.push(selected);
        } else {
            this.state.cSelected.splice(index, 1);
        }
        this.setState({ cSelected: [...this.state.cSelected] });
    }

    handleUploadFile = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        this.setState({ selectedUploadFile: files });

        this.fetchFileDetails();
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

    fetchFileDetails(){
        this.setState({uploadingModal: true});

        var formdata = new FormData();
        formdata.append("numbers", this.state.selectedUploadFile[0]);

        ServerApi().post('sms/checkFileContents', formdata)
          .then(res => {
            if (res.data.status !== undefined && res.data.status === true) {
                this.setState({uploadingModal: false, fileDetailModal: true, fileContentResponse: res.data.response});
            }else{
                this.setState({uploadingModal: false, selectedUploadFile: [], modalType:'error' ,success_msg: true, success_message:'Invalid file.', isAdding: false});
            }
          })
          .catch(error => console.log('error', error));
    }


    sendSms(event, values){
        if(this.state.selectedSenderId === null || this.state.selectedUploadFile[0] === undefined){
            this.props.openSnack({type: 'error', message: 'Please enter all required fields.'})
            return false;
        }
        //if(!this.state.templateBased){
            if (this.state.messageText.trim() === "") {
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

        console.log(values);
        //API
        this.setState({isSending: true});

        var raw = {
            requestType: "BULKSMS",
            payload:{
                smsGateway: (getLoggedInUser().userType === 'RESELLER' || getLoggedInUser().userType === 'USER')?getLoggedInUser().routes[0].id:this.state.smsGateway,
                senderId: this.state.selectedSenderId.value,
                countryCode: "+91",
                globalStatus: "true",
                removeDuplicate : "true",
                messageType : this.props.sms_type,
                //message : (this.state.templateBased)?this.state.combinedMessage:values.unicodeMessage,
                message: this.state.messageText,
                templateId: this.state.selectedTemplateId,
            }
        };

        var formdata = new FormData();
        formdata.append("requestType", "BULKSMS");
        formdata.append("request", JSON.stringify(raw));
        formdata.append("numbers", this.state.selectedUploadFile[0]);

        ServerApi().post('sms/bulkSmsRequest', formdata)
          .then(res => {
            this.setState({
                selectedSenderId: {label: 'Select', value: 0},
                combinedMessage: '',
                selectedUploadFile: undefined,
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

        ServerApi().get(`client/getBalance/${getLoggedInUser().id}`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 

            this.props.updateSmsBalance(Math.round((parseFloat(res.data.response) + Number.EPSILON) * 1000000) / 1000000);
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
        this.setState({ variableValues: {}, selectedTemplateId: id, messageText: selected && selected.length > 0 ? selected[0].message : ""})
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
                                <h4 className="page-title">SEND SMS FROM FILE</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="6">
                            <Card>
                                <CardBody>

                                    <AvForm onValidSubmit={this.sendSms} ref={c => (this.form = c)}>

                                        {/*<FormGroup className="mb-0">
                                            <div>
                                                <Button type="button" color="primary" className="mr-1 mb-2">
                                                    <i className="mdi mdi-download mr-2"></i> Download Sample File
                                                </Button>
                                            </div>
                                        </FormGroup>*/}

                                        <FormGroup className="mb-3">
                                            {/*<AvField name="title" label="Import Numbers"
                                                type="file" errorMessage="Select file" 
                                                validate={{ required: { value: true } }} />
                                            <span className="small" color="primary">Upload TXT/XLS/CSV files only</span>*/}

                                            <Dropzone onDrop={acceptedFiles => this.handleUploadFile(acceptedFiles)}>
                                                {({ getRootProps, getInputProps }) => (
                                                    <div className="dropzone">
                                                        <div className="dz-message needsclick" {...getRootProps()}>
                                                            <input {...getInputProps()} />
                                                            <h6 className="font-12">Import Numbers *</h6>
                                                        </div>
                                                    </div>
                                                )}
                                            </Dropzone>

                                            <a download href="/samples/numbers.xlsx" >Download Sample File</a>

                                            <div className="dropzone-previews mt-3" id="file-previews">
                                                {this.state.selectedUploadFile!==undefined && (
                                                    <>{this.state.selectedUploadFile.map((f, i) => {
                                                        return <Card className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete" key={i + "-file"}>
                                                        <div className="p-2">
                                                        <Row className="align-items-center">
                                                        <Col className="ml- 3 pl-3">
                                                        <Link to="#" className="text-muted font-weight-bold">{f.name}</Link>
                                                        <p className="mb-0"><strong>{f.formattedSize}</strong></p>
                                                        </Col>
                                                        </Row>
                                                        </div>
                                                        </Card>
                                                    })}</>
                                                )}
                                            </div>

                                        </FormGroup>

                                        {/*<FormGroup>
                                            <Label>SMS GATEWAY</Label>
                                                <Select
                                                    label="SMS GATEWAY"
                                                    value={selectedGroup}
                                                    onChange={this.handleSelectGroup}
                                                    options={SMS_GATEWAY}
                                                />
                                        </FormGroup>*/}
                                            <Row className="mb-2">
                                            {getLoggedInUser().userType !== 'RESELLER' && getLoggedInUser().userType !== 'USER' && (
                                                <Col md="12">
                                                    <Label>SMS Gateway</Label>
                                                    <Select
                                                        className="mb-3 field-required"
                                                        label="ROUTE"
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
                                                        value={selectedSenderId}
                                                        onChange={this.handleSelectSenderId}
                                                        options={this.state.senderIds}
                                                        validate={{ required: { value: true } }} 
                                                        required
                                                    />
                                                </Col>
                                            </Row>

                                        {/*<FormGroup>
                                        <AvField name="keyboard_name" label="RECIPIENTS"
                                            type="textarea" rows={3} errorMessage="Enter Keyboard Name"
                                            validate={{ required: { value: true } }} />
                                        <Row>
                                            <Col md="6">
                                                <span >No of mobile numbers {this.state.totalMobileNumbers}</span>
                                            </Col>
                                            <Col md="6">
                                                <AvField tag={CustomInput} name="form_as_header" label="REMOVE DUPLICATE"
                                                    type="checkbox" 
                                                    validate={{ required: { value: false } }} />
                                            </Col>
                                        </Row>
                                        </FormGroup>*/}

                                        {this.state.templateBased && this.state.selectedTemplateId && (
                                            //<TemplateMessageBox setCombinedMessage={(combinedMessage)=>this.setState({combinedMessage})} selectedTemplateId={this.state.selectedTemplateId} templates={this.state.templates} />
                                            <Message className="field-required" messageText={this.state.messageText} messageHandler={this.updateMessageHandler} savedMessageHandler={this.savedMessageHandler} noExtraOptions={true} />
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

                                        <div className="mb-0">
                                            <div>
                                                <Button size="sm" style={{float: 'right'}} disabled={this.state.isSending} type="submit" color="primary" className="mr-1">
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

                        {this.state.selectedSenderId !== null &&  this.state.templateBased && (this.state.templates.length > 0) &&
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

                    {this.state.uploadingModal &&
                        <SweetAlert
                            showConfirm={false}
                            allowEscape={false}
                            
                            style={{margin: 'inherit'}}
                             >
                            <div>
                                <Uploading />
                            </div>

                        </SweetAlert> 
                    }

                    {this.state.fileDetailModal &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title='Numbers Uploaded'
                            type='success'
                            confirmBtnBsStyle="success"
                            onConfirm={() => this.setState({ fileDetailModal: false })} >

                            <Table responsive className="mb-0">
                                <thead>
                                    <tr>
                                        <th>Total</th>
                                        <th>Dupilcate</th>
                                        <th>Invalid</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{(this.state.fileContentResponse.Total === "0")?"N/A":this.state.fileContentResponse.Total}</td>
                                        <td>{(this.state.fileContentResponse.Dupilcate === "0")?"N/A":this.state.fileContentResponse.Dupilcate}</td>
                                        <td>{(this.state.fileContentResponse.Invalid === "0")?"N/A":this.state.fileContentResponse.Invalid}</td>
                                    </tr>
                                </tbody>
                            </Table>

                        </SweetAlert> 
                    }

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
  
export default withRouter(connect(mapStatetoProps, { activateAuthLayout, openSnack, updateSmsBalance, getSmsBalance })(SendSmsFile));