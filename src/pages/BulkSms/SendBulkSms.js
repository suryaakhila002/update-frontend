import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label, Alert, Table } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { AvForm, AvField, AvRadioGroup, AvRadio } from 'availity-reactstrap-validation';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import SweetAlert from 'react-bootstrap-sweetalert';
import Dropzone from 'react-dropzone';
import {ServerApi} from '../../utils/ServerApi';

class SendBulkSms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            senderId: null, 
            selectedMulti: null,
            cSelected: [],
            message: '',
            remaningMessageCharacters: 160,
            totalMobileNumbers: 0,
            sheduleRequired: 'No',
            showSavedMessage: false,
            alert1: true,
            alert2: true,
            messageText: '',
            isSending: false,
            success_msg: false,
            success_message: '',
            modal_standard: false,
            renderForm: false,
            modal_type: 'success',
            selectedFile: [],
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
            mobileColumn: [
                        {
                            label: "Mobile Column",
                            options: [
                                { label: "A", value: "A" },
                                { label: "B", value: "B" },
                                { label: "C", value: "C" },
                            ]
                        }
                    ],
                                    
        };
        this.onCheckboxBtnClick = this.onCheckboxBtnClick.bind(this);
        this.handleDefault = this.handleDefault.bind(this);
        this.sendSms = this.sendSms.bind(this);
        this.loadSenderIds = this.loadSenderIds.bind(this);
        this.loadRoutes = this.loadRoutes.bind(this);
        this.handleSelectGroupSmsGAteway = this.handleSelectGroupSmsGAteway.bind(this);
        this.handleSelectMobileColumn = this.handleSelectMobileColumn.bind(this);

    }

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadSenderIds();
        this.loadRoutes();
    }

    //Select 
    handleSelectGroup = (senderId) => {
        this.setState({ senderId });
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

    handleAcceptedFiles = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        this.setState({ renderForm: true, selectedFile: files });
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

    onCheckboxBtnClick(selected) {
        const index = this.state.cSelected.indexOf(selected);
        if (index < 0) {
            this.state.cSelected.push(selected);
        } else {
            this.state.cSelected.splice(index, 1);
        }
        this.setState({ cSelected: [...this.state.cSelected] });
    }

    remaningMessageCharactersCalculate(){
        // var count = message.length;
        console.log(this.state.message);
        // if (count === 160) {return false;}
        // var remaning = 160 - count; 
        // this.setState({message:message, remaningMessageCharacters: remaning});
    }

    handleSelectGroupSmsGAteway  = (selectedItem) => {
        this.setState({ smsGateway: selectedItem.value });
    }
    handleSelectMobileColumn  = (selectedItem) => {
        this.setState({ mobileColumn: selectedItem.value });
    }

    loadSenderIds(){
        ServerApi().get('getActiveSenderIds')
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 

            var arr = res.data.map(obj => ({
                label: obj.senderId,
                value: obj,
            }))

            console.log(arr);

            this.setState({senderIds: arr})
        })
        .catch(error => console.log('error', error));
    }

    loadRoutes(){
        ServerApi().get('routes/fetch-active-routes')
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 

            var arr = res.data.response.map(obj => ({
                label: obj.systemId,
                value: obj.routeName,
            }))

            this.setState({smsGateways: arr})
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
                smsGateway: this.state.smsGateway,
                senderId:this.state.senderId.value,
                countryCode:"+91",
                globalStatus:"true",
                recipients : values.recipients,
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
            this.setState({modal_type: 'success', success_msg: true, success_message : res.data.response, isSending: false});

            this.form && this.form.reset();

          })
          .catch(error => console.log('error', error));
    }

    renderForm(){
        return(
            <Row>
            <Col sm="12">
                <Table responsive className="mb-0">
                    <thead>
                        <tr>
                            <th>A</th>
                            <th>B</th>
                            <th>C</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">Mark</th>
                            <td>426246</td>
                            <td>Otto</td>
                        </tr>
                        <tr>
                            <th scope="row">Jacob</th>
                            <td>24362346</td>
                            <td>Thornton</td>
                        </tr>
                        <tr>
                            <th scope="row">Larry</th>
                            <td>23463246</td>
                            <td>the Bird</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>

            <Col sm="12">

            <AvForm onValidSubmit={this.sendSms} ref={c => (this.form = c)}>
                <Label>SMS Gateway</Label>
                    <Select
                        className="mb-3"
                        label="SMS Gateway"
                        name="smsGateway"
                        onChange={this.handleSelectGroupSmsGAteway}
                        options={this.state.smsGateways}
                        validate={{ required: { value: true } }} 
                        required
                    />

                <Label>SENDER ID</Label>
                    <Select
                        className="mb-3"
                        label="SENDER ID"
                        name="senderId"
                        value={this.state.senderId}
                        onChange={this.handleSelectGroup}
                        options={this.state.senderIds}
                        validate={{ required: { value: true } }} 
                        required
                    />

                <Label>Mobile Column</Label>
                    <Select
                        className="mb-3"
                        label="Mobile Column"
                        name="mobileColumn"
                        onChange={this.handleSelectMobileColumn}
                        options={this.state.mobileColumn}
                        validate={{ required: { value: true } }} 
                        required
                    />
                <Label>Message Type</Label>
                    <Select
                        className="mb-3"
                        label="Message Type"
                        name="messageType"
                        onChange={this.handleSelectMessageType}
                        options={this.state.messageType}
                        validate={{ required: { value: true } }} 
                        required
                    />
                <Label>Select Template</Label>
                    <Select
                        className="mb-3"
                        label="Select Template"
                        name="selectTemplate"
                        onChange={this.handleSelectTemplate}
                        options={this.state.selectTemplate}
                        validate={{ required: { value: true } }} 
                        required
                    />

                {/*<FormGroup >
                
                <AvField placeholder="Numbers must be separated by comma" 
                    label ="RECIPIENTS"
                    name="recipients"
                    onChange={(e)=> this.setState({totalMobileNumbers: e.target.value.split(",").length - 1})}
                    type="textarea" rows={3} errorMessage="Enter Keyboard Name"
                    validate={{ required: { value: true } }} 
                    onFocus={ () => this.setState({showSavedMessage: false}) }
                    style={{marginBottom: 0}} />
                <Row>
                    <Col md="6">
                        <span >No of mobile numbers {this.state.totalMobileNumbers}</span>
                    </Col>
                    <Col md="6">
                        <AvField tag={CustomInput} name="removeDuplicate" label="REMOVE DUPLICATE"
                            type="checkbox" 
                            validate={{ required: { value: false } }} />
                    </Col>
                </Row>
                </FormGroup>*/}


                <FormGroup >
                <AvField name="message" label="MESSAGE"
                    rows={4} type="textarea" 
                    className="mb-0" 
                    value={this.state.messageText}
                    onChange={ (e) => this.setState({messageText: e.target.value}) } 
                    onFocus={ () => this.setState({showSavedMessage: true}) } 
                    validate={{ required: { value: true } }} />

                <Row className="mb-2">
                    <Col md="12">
                        <span className="mt-0 ml-3">{160 - this.state.messageText.length} CHARACTERS REMAINING <span className="text-success">1 Message (s)</span></span>
                    </Col>
                </Row>
                </FormGroup>

                <AvRadioGroup inline value='No' name="sheduleRequired" required>
                  <Label style={{marginRight: '10px'}}>Schedule Requried: </Label>
                  <AvRadio onChange={this.handleChange} customInput label="Yes" value="Yes" />
                  <AvRadio onChange={this.handleChange} customInput label="No" value="No" active />
                </AvRadioGroup>

                {this.state.sheduleRequired === 'Yes' && 
                    <FormGroup >
                    <DatePicker
                        className="form-control"
                        selected={this.state.default_date}
                        onChange={this.handleDefault}
                        showTimeSelect
                        dateFormat="Pp"
                    />
                    </FormGroup >
                }

                <FormGroup className="mt-3 mb-0">
                    <div>
                        <Button size="sm" type="submit" color="primary" className="mr-1">
                            <i className="fa fa-paper-plane mr-2"></i> {(this.state.isSending)?'Please Wait...':'Send'}
                        </Button>
                        <Button size="sm" type="button" color="secondary" className="mr-1">
                            <i className="fa fa-save mr-2"></i> Save Draft
                        </Button>

                    </div>
                </FormGroup>

            </AvForm>
            </Col>
            </Row>
        )
    }

    render() {

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">

                            <Col sm="6">
                                <h4 className="page-title">SEND CUSTOM SMS</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="6">
                            <Card>
                                <CardBody>

                                    <Row>
                                        <Col sm="12">
                                            <Dropzone onDrop={acceptedFiles => this.handleAcceptedFiles(acceptedFiles)}>
                                                {({ getRootProps, getInputProps }) => (
                                                    <div className="dropzone">
                                                        <div className="dz-message needsclick" {...getRootProps()}>
                                                            <input {...getInputProps()} />
                                                            <h6 className="font-12">Upload File *</h6>
                                                        </div>
                                                    </div>
                                                )}
                                            </Dropzone>
                                            <div className="dropzone-previews mt-3" id="file-previews">
                                                

                                                {this.state.selectedFile.map((f, i) => {
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
                                        </Col>

                                    </Row>
                                    
                                    {this.state.renderForm && 
                                        this.renderForm()
                                    }

                                </CardBody>
                            </Card>
                        </Col>

                        {this.state.showSavedMessage &&
                        <Col lg="6" >
                            <h4 className="mt-0 header-title">Saved Messages</h4>
                                <div className="">
                                    <Alert color="success" className="mb-2" isOpen={this.state.alert1} >
                                        <p className="mb-0">Whenever to Bulk SMS. 
                                        </p>
                                        <p> 
                                            <Link to="#"><i className="ti ti-close float-right danger mr-2"></i> </Link>
                                            <Link to="#"><i className="ti ti-check float-right success mr-2"></i></Link> 
                                        </p>

                                    </Alert>
                                </div>

                                <div className="">
                                    <Alert color="success" className="mb-0" isOpen={this.state.alert2} >
                                        <p className="mb-0">Whenever to Bulk SMS. 
                                        </p>
                                        <p> 
                                            <Link onPress={()=>this.setState({alert2:false})}><i className="ti ti-close float-right danger mr-2"></i> </Link>
                                            <Link onPress={()=>this.setState({messageText:'Whenever to Bulk SMS'})}><i className="ti ti-check float-right success mr-2"></i></Link> 
                                        </p>

                                    </Alert>
                                </div>
                        </Col>
                        }

                    </Row>

                    {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            confirmBtnBsStyle={this.state.modal_type}
                            onConfirm={() => this.setState({ success_msg: false })} 
                            type={this.state.modal_type} >
                        </SweetAlert> 
                    }

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(SendBulkSms));