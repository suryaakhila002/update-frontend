import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Label } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Select from 'react-select';
import {getLoggedInUser} from '../../helpers/authUtils';
import SweetAlert from 'react-bootstrap-sweetalert';
import {ServerApi} from '../../utils/ServerApi';
import {Radio} from 'antd';
import {Button} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import AddIcon from '@material-ui/icons/Add';
import {Select as MSelect, MenuItem, FormControl} from '@material-ui/core';
import axios from 'axios';

const LANGUAGES = [
    { label: "English", value: "1"},
    { label: "हिंदी", value: "hi-t-i0-und"},
    { label: "తెలుగు", value: "te-t-i0-und"},
    { label: "தமிழ்", value: "ta-t-i0-und"},
    { label: "বাঙ্গালী", value: "bn-t-i0-und"},
    { label: "ગુજરાતી", value: "gu-t-i0-und"},
    { label: "ಕನ್ನಡ", value: "kn-t-i0-und"},
    { label: "മലയാളം", value: "ml-t-i0-und"},
    { label: "मराठी", value: "mr-t-i0-und"},
    { label: "नेपाली", value: "ne-t-i0-und"},
    { label: "ନୀୟ", value: "or-t-i0-und"},
    { label: "ارسیان", value: "fa-t-i0-und"},
    { label: "ਪੰਜਾਬੀ", value: "pu-t-i0-und"},
    { label: "षन्स्क्रित्", value: "sa-t-i0-und"},
    { label: "اردو", value: "ur-t-i0-und"},
];

const CONTENT_TYPE = [
            { label: "--Select Content Type--", value: "0", isOptionSelected: true },
            { label: "Transactional", value: "T" },
            { label: "Promotional", value: "P" },
            { label: "Service Explicit", value: "SE"},
            { label: "Service Implicit", value: "SI"},
        ];

const CONTENT_CATEGORY = [
            { label: "--Select Content Category--", value: "0", isOptionSelected: true },
            { label: "Banking/Insurance/Financial products/ credit cards", value: "1" },
            { label: "Real Estate", value: "2" },
            { label: "Education", value: "3" },
            { label: "Health", value: "4" },
            { label: "Consumer goods and automobiles", value: "5" },
            { label: "Communication/Broadcasting/Entertainment/IT", value: "6" },
            { label: "Tourism and Leisure", value: "7" },
            { label: "Food and Beverages", value: "8" },
            { label: "Others", value: "9" },
        ];


class AddSmsTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAdding: false,
            success_msg: false,
            success_message: '',
            modalType:'success',
            modal_standard: false,
            content_type: {label: 'Select', value:'0'},
            content_category: {label: 'Select', value:'0'},
            copyPaste: '1',
            message: '',
            messageText: '',
            selectedSenderIds: [],
            allSenderIds: [],
            messageType: 'Plain',
            messageTypeUnicode: '',
            messageTypeStr: '1',
        };

        this.addSmsTemplate = this.addSmsTemplate.bind(this);
        this.addVariable = this.addVariable.bind(this);
        this.addNewLine = this.addNewLine.bind(this);
        this.loadSenderIds=this.loadSenderIds.bind(this);
        
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadSenderIds()
    }

    loadSenderIds(){
        ServerApi().get(`getAllSenderIds/${getLoggedInUser().id}`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }
            console.log(res.data)
            this.setState({allSenderIds: res.data.map(i=>({label:i.senderId, value: i.senderId, type: i.type}))});
        })
        .catch(error => console.log('error', error));
    }


    addSmsTemplate(event, values){

        if(values.name === '' || this.state.content_category.value==='0' || this.state.messageText===''||
            this.state.selectedSenderIds.length===0 || this.state.content_type.value==='0'){
            this.props.openSnack({type: 'error', message: 'Please fill all required fields.'});
            return false;
        }

        this.setState({isAdding: true});

        var raw = {
            category: this.state.content_category.label,
            consentTemplateId: "",
            language: this.state.messageType,
            message: this.state.messageText,
            senderIdsList: this.state.selectedSenderIds.map(i=>i.value),
            templateName: values.name,
            type: this.state.content_type.label
        };

        ServerApi().post('sms/saveSmsTemplate', raw)
          .then(res => {
            if (res.status === 200) {
                this.setState({isAdding: false});
                this.props.openSnack({type: 'success', message: 'Template Added.'})
                setTimeout(()=>{this.props.history.push('/smsTemplate')},800);
            } else {
                this.props.openSnack({type: 'error', message: 'Unable to create template'})
                this.setState({isAdding: false});

            }
            
        })
        .catch(error => {
            this.props.openSnack({type: 'error', message: 'Unable to create template'})
            this.setState({isAdding: false});
          });
    }

    addVariable(){
        let val = window.getSelection().toString();
        if(this.state.messageText !== '' && val !== ''){
            this.setState({messageText: this.state.messageText.replace(val, '{#var#}')})
        
        }
        if(val===""){
            this.setState({messageText: this.state.messageText+'{#var#}'})
        }
    }

    addNewLine(){
        this.setState({messageText: this.state.messageText+" \\n"})
    }

    handleSelectLanguage(event){
        let language = 'Plain';
        if(event.target.value !== "1"){
            language = 'Unicode';
        }

        this.setState({messageTypeUnicode: event.target.value, messageType: language, messageTypeStr: event.target.value})
        // dispatch({type: 'update_sms_type', payload: language});
    }

    transliterateMessage=(e)=>{
        if(this.state.messageType === "1") {
            this.setState({messageText: e.target.value})
            // setMessageText(e.target.value);
            // props.messageHandler(e.target.value);
            return;
        }

        if(e.keyCode === 32){
            axios.get(`https://inputtools.google.com/request?text=${e.target.value}&itc=${this.state.messageTypeUnicode}&num=8&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`)
            .then(res=>{
                // console.log('res------')
                // console.log(res.data[1][0][1][0])
                try{
                    // setMessageText(res.data[1][0][1][0]+' ');
                    this.setState({messageText: res.data[1][0][1][0]+' '});
                    // props.messageHandler(res.data[1][0][1][0]+' ');
                }catch(e){
                    console.log(e);
                }
            })
        }
    }
    


    render() {
        const defaultValues = { isResellerPanel: {label: 'Yes', value:'Yes'}, isClientNotify: 1, isApiAccess: 'Yes' };

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">

                            <Col sm="6">
                                <h4 className="page-title">Add Template</h4>
                            </Col>
                        </Row>
                    </div>


                    <Row>
                        <Col lg="7">

                            <Card>
                                <CardBody>
                                    <AvForm onValidSubmit={this.addSmsTemplate} mode={defaultValues} ref={c => (this.form = c)}>
                                        <Row className="align-items-center">

                                            <Col sm='12'>
                                                
                                                <AvField name="name" label='Template Name'
                                                    className="mt-2"
                                                    placeholder="" type="text" errorMessage="Enter Template NAme"
                                                    validate={{ required: { value: true } }} />
                                            </Col>

                                            <Col sm="12">
                                                <Label>Content Type</Label>
                                                <Select
                                                    className="field-required"
                                                    onChange={(i)=>this.setState({ content_type: i })}
                                                    options={CONTENT_TYPE}
                                                />
                                            </Col>

                                            <Col sm="12 mt-3">
                                                <Label>Content Category</Label>
                                                <Select
                                                    className="field-required"
                                                    onChange={(i)=>this.setState({ content_category: i })}
                                                    options={CONTENT_CATEGORY}
                                                />
                                            </Col>

                                            <Col sm="12 mt-3">
                                                <Label>Sender ID Associated</Label>
                                                <Select
                                                    className="field-required"
                                                    isMulti
                                                    onChange={(i)=>this.setState({ selectedSenderIds: i })}
                                                    options={(this.state.content_type.value==='P')?this.state.allSenderIds.filter(i=>i.type==='PROMOTINAL'):this.state.allSenderIds.filter(i=>i.type!=='PROMOTINAL')}
                                                />
                                            </Col>

                                            <Col sm="12 mt-3">
                                                <div className="text-center">
                                                    <Radio.Group inline onChange={(e)=>{this.setState({copyPaste: e.target.value})}} 
                                                        name="copyPaste" 
                                                        value={this.state.copyPaste}>
                                                        <Radio value={'1'}> Copy/Paste Message </Radio>
                                                        <Radio value={'2'}> Create New Message</Radio>
                                                    </Radio.Group>
                                                </div>
                                            </Col>

                                            <Col sm="12 mt-2">
                                                <Card>
                                                    <CardBody>
                                                        <div className="float-right pb-3">
                                                            <Button 
                                                                type="button"
                                                                size="small" 
                                                                variant="contained" 
                                                                color="primary" 
                                                                onClick={(e)=>this.addVariable()}
                                                                >
                                                                Add Variable
                                                            </Button>

                                                            <Button 
                                                                type="button"
                                                                size="small" 
                                                                className="ml-2"
                                                                variant="contained" 
                                                                onClick={(e)=>this.addNewLine()}
                                                                >
                                                                Add New Line
                                                            </Button>
                                                        </div>

                                                        <div className="languageSelection mb-2 float-left"> 
                                                            <FormControl>
                                                                <MSelect
                                                                    id="language-select"
                                                                    labelId="language-select-label"
                                                                    placeholder="English"
                                                                    label="English"
                                                                    value={this.state.messageTypeStr}
                                                                    onChange={(e)=>this.handleSelectLanguage(e)}
                                                                    >
                                                                    {LANGUAGES.map((i)=>{
                                                                        return <MenuItem value={i.value}>{i.label}</MenuItem>
                                                                    })}
                                                                </MSelect>
                                                            </FormControl>
                                                        </div>

                                                        <AvField name="message" label=""
                                                            rows={4} 
                                                            type="textarea" 
                                                            className="mb-0" 
                                                            value={this.state.messageText}
                                                            placeholder="Enter the content of the message."
                                                            validate={{ required: { value: true } }}
                                                            onChange={(e)=>this.setState({messageText: e.target.value})}
                                                            onKeyUp = {(e)=>this.transliterateMessage(e)} 
                                                            // value={messageText}
                                                            // onKeyUp = { transliterateMessage }  
                                                            // onFocus={ props.savedMessageHandler } 
                                                            // validate={{ required: { value: this.state.messageType === "2"  ? true : false } }} 
                                                        />
                                                    </CardBody>
                                                </Card>

                                                <Col sm="12 mt-3">
                                                    <Label>Message</Label>
                                                    <AvField name="messageDisplay" label=""
                                                        rows={4} 
                                                        type="textarea" 
                                                        className="mb-0" 
                                                        disabled={true}
                                                        // value={this.state.message}
                                                        value={this.state.messageText} 
                                                        // onKeyUp = { transliterateMessage }  
                                                        // onFocus={ props.savedMessageHandler } 
                                                        // validate={{ required: { value: this.state.messageType === "2"  ? true : false } }} 
                                                    />

                                                    <small><b>Disclaimer:</b> You have used <b>{this.state.message.length}</b> characters. This is only estimated counts, as variable fileds may vary in length.</small>
                                                </Col>

                                            </Col>

                                        </Row>

                                        
                                        <div className="mb-0 mt-3">
                                            <div className="text-center">

                                                <Button 
                                                    type="submit"
                                                    size="small" 
                                                    variant="contained" 
                                                    disabled={(this.state.isAdding)?true:false}
                                                    color="primary" 
                                                    >
                                                     {(this.state.isAdding)?'Please Wait...':<><AddIcon /> {" Submit"}</>}
                                                </Button>
                                                
                                            </div>
                                        </div>

                                    </AvForm>

                                </CardBody>

                                

                            </Card>
                        </Col>

                    </Row>

                    <Row>
                        <Col lg="7">

                            <Card>
                                <CardBody>

                                <Alert className="mb-2" severity="info">Click here to view <a rel="noopener noreferrer" target="_blank" download href="https://smartping.live/template_guidelines.pdf">Guidelines For Template Registration</a></Alert>

                                    <div  class="row mt-1">
                                        <div  class="col-md-12">
                                            <p  class="text-info ins_head">Instructions:</p>
                                            <p  class="text-info ins_subhead">a) Copy/Paste Option:</p>
                                            <ul  class="regstyle2">
                                                <li >1. Copy your desired message for content template and paste it in the message box area.</li>
                                                <li >2. Select the word(s) which you want to convert into a variable.</li>
                                                <li >3. Click on the variable button.</li>
                                                <li >4. Once the variable(s) entered from the top variable button, it should not be modified manually in the message box.</li>
                                                <li >5. Click the "Submit" button for submission of the Content Template request.</li>
                                            </ul>
                                        </div>
                                        <div  class="col-md-12 mt-4">
                                            <p  class="text-info  ins_subhead">b) Create New Message Option:</p>
                                            <ul  class="regstyle2">
                                                <li >1. Type the desired message for the content template in the message box.</li>
                                                <li >2. To add variables, click on “Add Variable” button.</li>
                                                <li >3. In case you wish add variable after typing the text messages, place the cursor wherever the variable(s) need to to be added and click on “Add Variable” button.</li>
                                                <li >.4 Once the variable(s) entered, it should not be modified manually in the message box.</li>
                                                <li >5. Click the "Submit" button for submission of the Content Template request.</li>
                                                <li ><strong  class="text-info">Note:-</strong> To create Template in Regional language, please use "Copy/Paste Message option".</li>
                                            </ul>
                                        </div>
                                    </div>

                                </CardBody>
                            </Card>
                        </Col>
                    </Row> 

                    {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            type={this.state.modalType}
                            confirmBtnBsStyle={this.state.modalType}
                            onCancel={()=>this.setState({success_msg:false})}
                            showCloseButton={(this.state.modalType === 'success')?false:true}
                            showConfirm={(this.state.modalType === 'success')?true:false}
                            onConfirm={() => this.props.history.push('/senderIdManage')} >
                        </SweetAlert> 
                    }

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, openSnack })(AddSmsTemplate));