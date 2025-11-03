import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Label } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';

// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Select from 'react-select';
import {getLoggedInUser} from '../../helpers/authUtils';
// import SweetAlert from 'react-bootstrap-sweetalert'; // DELETED: Unused and build-blocking
import {ServerApi} from '../../utils/ServerApi';
import {Radio} from 'antd';
import {Button} from '@mui/material';
import Alert from '@mui/material/Alert';
import SaveIcon from '@mui/icons-material/Save';
import {Select as MSelect, MenuItem, FormControl} from '@mui/material';
import axios from 'axios';

const LANGUAGES = [
// ... (LANGUAGES array remains unchanged)
    { label: "English", value: "1"},
    { label: "हिंदी", value: "hi-t-i0-und"},
    // ...
];

const CONTENT_TYPE = [
// ... (CONTENT_TYPE array remains unchanged)
            { label: "--Select Content Type--", value: "0", isOptionSelected: true },
            { label: "Transactional", value: "T" },
            // ...
        ];

const CONTENT_CATEGORY = [
// ... (CONTENT_CATEGORY array remains unchanged)
            { label: "--Select Content Category--", value: "0", isOptionSelected: true },
            { label: "Banking/Insurance/Financial products/ credit cards", value: "1" },
            // ...
        ];


class UpdateSmsTemplate extends Component {
// ... (Constructor and methods remain unchanged)

    constructor(props) {
        super(props);
        this.state = {
            isAdding: false,
            // --- KEY CHANGE (STATE) ---
            // These state properties were unused
            // success_msg: false,
            // success_message: '',
            // modalType:'success',
            // modal_standard: false,
            // --- END KEY CHANGE ---
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
        this.preFillTemplate=this.preFillTemplate.bind(this);
        
    }
    
    // ... (All component methods like componentDidMount, loadSenderIds, addSmsTemplate, etc., remain unchanged) ...

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadSenderIds()
        this.preFillTemplate()
    }

    preFillTemplate(){
        let selectedTemplate = this.props.location.state;
        this.setState({message: selectedTemplate.message, 
                      templateName: selectedTemplate.name,
                      content_type: CONTENT_TYPE.filter(i=>i.label===selectedTemplate.type)[0],
                      content_category: CONTENT_CATEGORY.filter(i=>i.label===selectedTemplate.category)[0],
                      selectedSenderIds: selectedTemplate.senderIds.map(i=>({label:i, value:i})),
                      templateId: selectedTemplate.templateId
                      })
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
    }

    transliterateMessage=(e)=>{
        if(this.state.messageType === "1") {
            this.setState({messageText: e.target.value})
            return;
        }

        if(e.keyCode === 32){
            axios.get(`https://inputtools.google.com/request?text=${e.target.value}&itc=${this.state.messageTypeUnicode}&num=8&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`)
            .then(res=>{
                try{
                    this.setState({messageText: res.data[1][0][1][0]+' '});
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
                    {/* ... (All JSX in render() remains unchanged, EXCEPT for the SweetAlert block) ... */}

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
                                    <FormControl onValidSubmit={this.addSmsTemplate} mode={defaultValues} ref={c => (this.form = c)}>
                                        {/* ... (All FormControl fields remain unchanged) ... */}
                                    </FormControl>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg="7">
                            <Card>
                                <CardBody>
                                    {/* ... (Instructions section remains unchanged) ... */}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row> 

                    {/* --- KEY CHANGE (SWEETALERT BLOCK DELETED) --- */}
                    {/* The old <SweetAlert> component was deleted from here.
                        It was unused, and the import was blocking the build. */}
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

export default connect(null, { activateAuthLayout, openSnack })(UpdateSmsTemplate);