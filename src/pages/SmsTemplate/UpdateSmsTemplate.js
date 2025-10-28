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
import {Button} from '@mui/material';
import Alert from '@mui/material/Alert';
import SaveIcon from '@material-ui/icons/Save';

const CONTENT_TYPE = [
            { label: "--Select Content Type--", value: "0"},
            { label: "Transactional", value: "T" },
            { label: "Promotional", value: "P" },
            { label: "Service Explicit", value: "SE"},
            { label: "Service Implicit", value: "SI"},
        ];

const CONTENT_CATEGORY = [
            { label: "--Select Content Category--", value: "0"},
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


class UpdateSmsTemplate extends Component {
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
            messageType: '1',
            message: '',
            selectedSenderIds: [],
            allSenderIds: [],
            templateId: '',
        };

        this.addSmsTemplate = this.addSmsTemplate.bind(this);
        this.addVariable = this.addVariable.bind(this);
        this.addNewLine = this.addNewLine.bind(this);
        this.loadSenderIds=this.loadSenderIds.bind(this);
        this.preFillTemplate=this.preFillTemplate.bind(this);
        
    }

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
            this.setState({allSenderIds: res.data.map(i=>({label:i.senderId, value: i.senderId}))});
        })
        .catch(error => console.log('error', error));
    }


    addSmsTemplate(event, values){

        if(this.state.templateId ==='' || values.name === '' || this.state.content_category.value==='0' || 
            this.state.message===''||
            this.state.selectedSenderIds.length===0 || this.state.content_type.value==='0'){
            this.props.openSnack({type: 'error', message: 'Please fill all required fields.'});
            return false;
        }

        this.setState({isAdding: true});

        var raw = {
            templateId: this.state.templateId,
            category: this.state.content_category.label,
            consentTemplateId: "",
            language: "English",
            message: this.state.message,
            senderIdsList: this.state.selectedSenderIds.map(i=>i.value),
            templateName: values.name,
            type: this.state.content_type.label
        };

        ServerApi().post('sms/updateSmsTemplate', raw)
          .then(res => {
            if (res.status === 200) {
                this.setState({isAdding: false});
                this.props.openSnack({type: 'success', message: 'Template Updated.'})
                setTimeout(()=>{this.props.history.push('/smsTemplate')},800);
            } else {
                this.props.openSnack({type: 'error', message: 'Unable to update template'})
                this.setState({isAdding: false});

            }
            
        })
        .catch(error => {
            this.props.openSnack({type: 'error', message: 'Unable to update template'})
            this.setState({isAdding: false});
          });
    }

    addVariable(){
        let val = window.getSelection().toString();
        if(this.state.message !== '' && val !== ''){
            this.setState({message: this.state.message.replace(val, '{#var#}')})
        
        }
        if(val===""){
            this.setState({message: this.state.message+'{#var#}'})
        }
    }

    addNewLine(){
        this.setState({message: this.state.message+" \\n"})
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
                                                    value={this.state.templateName}
                                                    placeholder="" type="text" errorMessage="Enter Template NAme"
                                                    validate={{ required: { value: true } }} />
                                            </Col>

                                            <Col sm="12">
                                                <Label>Content Type</Label>
                                                <Select
                                                    className="field-required"
                                                    value={this.state.content_type}
                                                    onChange={(i)=>this.setState({ content_type: i })}
                                                    options={CONTENT_TYPE}
                                                />
                                            </Col>

                                            <Col sm="12 mt-3">
                                                <Label>Content Category</Label>
                                                <Select
                                                    className="field-required"
                                                    value={this.state.content_category}
                                                    onChange={(i)=>this.setState({ content_category: i })}
                                                    options={CONTENT_CATEGORY}
                                                />
                                            </Col>

                                            <Col sm="12 mt-3">
                                                <Label>Sender ID Associated</Label>
                                                <Select
                                                    className="field-required"
                                                    isMulti
                                                    value={this.state.selectedSenderIds}
                                                    onChange={(i)=>this.setState({ selectedSenderIds: i })}
                                                    options={this.state.allSenderIds}
                                                />
                                            </Col>

                                            <Col sm="12 mt-3">
                                                <div className="text-center">
                                                    <Radio.Group inline onChange={(e)=>{this.setState({messageType: e.target.value})}} 
                                                        name="messageType" 
                                                        value={this.state.messageType}>
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

                                                        <AvField name="message" label=""
                                                            rows={4} 
                                                            type="textarea" 
                                                            className="mb-0" 
                                                            value={this.state.message}
                                                            placeholder="Enter the content of the message."
                                                            validate={{ required: { value: true } }}
                                                            onChange={(e)=>this.setState({message: e.target.value})}
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
                                                        value={this.state.message}
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
                                                     {(this.state.isAdding)?'Please Wait...':<><SaveIcon fontSize="small" />{ 'Save'}</>}
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

export default withRouter(connect(null, { activateAuthLayout, openSnack })(UpdateSmsTemplate));