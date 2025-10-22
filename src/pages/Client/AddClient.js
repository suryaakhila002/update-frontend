import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, textarea } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { AvForm, AvField, AvGroup } from 'availity-reactstrap-validation';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Select from 'react-select';
import Countries from '../../utils/Countries';
import SweetAlert from 'react-bootstrap-sweetalert';
import Dropzone from 'react-dropzone';
import {ServerApi} from '../../utils/ServerApi';
import { Radio } from 'antd';
import {getLoggedInUser} from '../../helpers/authUtils';

// import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const CLIENT_GROUP = [
    {
        options: [
            { label: "None", value: "None" },
        ]
    }
];

const REFFER_BY = [
    {
        label: "Reffer By",
        options: [
            { label: "Suresh", value: "Suresh" },
            { label: "Nagendra", value: "Nagendra" },
        ]
    }
];

const USER_TYPE = [
    {
        label: "User Type",
        options: [
            { label: "User", value: "User", isOptionSelected: true },
            { label: "Reseller", value: "RESELLER" },
            { label: "Distributor", value: "Distributor" },
            { label: "Admin", value: "Admin" },
        ]
    }
];


const TEMPLATE_TYPE = [
    {
        label: "TEMPLATE TYPE",
        options: [
            { label: "Template", value: "Template", isOptionSelected: true },
            { label: "Non Template ", value: "Non Template " },
        ]
    }
];


class AddClient extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: null, 
            selectedMulti: null,
            isAdding: false,
            country: 'India',
            client_group: 'None',
            client_route: 'None',
            user_type: 'CLIENT',
            status: 'Active',
            isResellerPanel : '',
            isApiAccess : '',
            isClientNotify : 'No',
            success_msg: false,
            success_message: '',
            modalType:'success',
            modal_standard: false,
            address: '',
            template: '',
            smsGateway: '',
            reffeerBy: '',
            dlRegister: 'Registered',
            consumptionType: 'Submitted',
            smsType: 'Promotional',
            creditType: 'Prepaid',
            selectedFilesPan: [],
            selectedFilesCin: [],
            selectedFilesProof: [],
            selectedFilesOther: [],
            selectedFilesAuthorizedDocument: [],
            selectedFilesAuthorizedLetter: [],
            smsGateways: [
                            {
                                label: "SMS Routes",
                                options: [
                                ]
                            }
                        ],
            steps: ['Tab 1', 'Tab 2', 'Tab 3', 'Tab 4'],
            activeStep: 0,

        };
        this.handleAcceptedFilesPan = this.handleAcceptedFilesPan.bind(this);
        this.handleAcceptedFilesCin = this.handleAcceptedFilesCin.bind(this);
        this.handleAcceptedFilesProof = this.handleAcceptedFilesProof.bind(this);
        this.handleAcceptedFilesOther = this.handleAcceptedFilesOther.bind(this);
        this.handleAcceptedAuthorizedDocument = this.handleAcceptedAuthorizedDocument.bind(this);
        this.handleAcceptedAuthorizedLetter = this.handleAcceptedAuthorizedLetter.bind(this);


        this.addNewClient = this.addNewClient.bind(this);
        this.loadRoutes = this.loadRoutes.bind(this);
        this.loadGroups = this.loadGroups.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadRoutes();
        this.loadGroups();
        this.loadSmsGateways();
    }

    goToAllClients(){
        this.props.history.push('/allClients');
    }

    //Select 
    handleSelectCountry = (selectedItem) => {
        this.setState({ country: selectedItem.value });
    }
    handleSelectUserType = (selectedItem) => {
        this.setState({ user_type: selectedItem.value });
    }
    handleSelectStatus = (selectedItem) => {
        this.setState({ status: selectedItem.value });
    }
    handleSelectClientGroup = (selectedItem) => {
        this.setState({ client_group: selectedItem.value });
    }
    handleSelectUserRoute = (selectedItem) => {
        this.setState({ client_route: selectedItem.value });
        console.log(selectedItem);
    }
    handleSelectTemplate = (selectedItem) => {
        this.setState({ template: selectedItem.value });
    } 
    handleSmsGateway = (selectedItem) => {
        this.setState({ smsGateway: selectedItem.value });
    }
    handleReffeerBy = (selectedItem) => {
        this.setState({ reffeerBy: selectedItem.value });
    }     

    loadSmsGateways(){
        ServerApi().get('routes/fetch-active-routes')
          .then(res => {
            if (res.status !== 200) { return false } 

            var arr = res.data.response.map(obj => ({
                // label: obj.routeName,
                // value: obj.routeId,
                label: obj.routeName,
                value: obj.id,
            }))

            this.setState({smsGateways: arr})
        })
        .catch(error => console.log('error', error));
    }

    loadGroups() {
        ServerApi().get('groups/getActiveGroups')
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
        
    
    loadRoutes(){
        ServerApi().get('routes/fetch-active-routes')
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 

            var arr = res.data.map(obj => ({
                label: obj.routeName,
                value: obj.routeName,
            }))

            this.setState({routes: arr})
        })
        .catch(error => console.log('error', error));
    }

    addNewClient(event, values){
        //API
        this.setState({isAdding: true});

        var raw = {
            requestType: "ADDCLIENT",
            payload:{        
                firstName: values.first_name,
                lastName: values.last_name,
                company: values.company,
                website: values.website,
                email: values.email,
                userName:values.username,
                password:values.confirm_password,
                userType: this.state.user_type,
                phoneNumber:values.phone,
                address:this.state.address,
                country: this.state.country,
                state: values.state,
                city: values.city,
                postalCode: values.postalcode,
                isResellerPanel: values.isResellerPanel,
                isApiAccess: values.isApiAccess,
                clientGroup: "",
                groupId: "",
                smsGateway: this.state.client_route,
                assignedCredits: values.assignedCredits,
                consumptionType: values.consumptionType, 
                planType: values.planType,
                dltRegistrationNo: values.dltRegistrationNo,
                gstno: values.gstno,
                smsType: this.state.smsType,
                assignRoute:this.state.client_route,

                billingType : "Submit",
                creditType : values.creditType, 
                isClientNotify : values.isClientNotify,
                smsTemplateType : "Template",//this.state.template,
                referredBy: "Suresh",//this.state.reffeerBy,
                
                entityType : "None",
                orgCategory : "None",
                pan : "",
                cinOrGstOrTan : "",
                idProof : "",
                otherDocName : "",
                authorisedName : "",
                designation : "",

                price: values.price,
            }
        };


        var formdata = new FormData();
        console.log(JSON.stringify(raw));
        formdata.append("request", JSON.stringify(raw));
        // formdata.append("documentFile", this.state.selectedFilesDocument[0]);

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).post("addClient", formdata)
          .then(res => {
            
            if (res.data !== undefined && res.data.status !== true) {
                this.setState({success_msg: true, modalType:'error', success_message : res.data.message, isAdding: false});
                return false;
            }
            
            this.setState({success_msg: true, modalType:'success', success_message : "Client Added!", isAdding: false});

            // setTimeout(
            //     function() {
            //         this.goToAllClients();
            //     }
            //     .bind(this),
            //     2500
            // );

            this.form && this.form.reset();

          })
          .catch(error => console.log('error', error));
    }

    handleAcceptedFilesPan = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        this.setState({ selectedFilesPan: files });
    }

    handleAcceptedFilesCin = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        this.setState({ selectedFilesCin: files });
    }

    handleAcceptedFilesProof = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        this.setState({ selectedFilesProof: files });
    }

    handleAcceptedFilesOther = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        this.setState({ selectedFilesOther: files });
    }
    handleAcceptedAuthorizedDocument = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        this.setState({ selectedFilesAuthorizedDocument: files });
    }
    handleAcceptedAuthorizedLetter = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        this.setState({ selectedFilesAuthorizedLetter: files });
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

    handleNext = () => {
        this.setState({activeStep: this.state.activeStep +1})
        // setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };
    
    handleBack = () => {
        this.setState({activeStep: this.state.activeStep -1})
        // setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    getStepContent(stepIndex) {
        switch (stepIndex) {
          case 0:
            return 'Select campaign settings...';
          case 1:
            return 'What is an ad group anyways?';
          case 2:
            return 'This is the bit I really care about!';
          default:
            return 'Unknown stepIndex';
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
                                <h4 className="page-title">Add New Client</h4>
                            </Col>
                        </Row>
                    </div>


                    <Row>
                        <Col lg="6">
                            <Stepper activeStep={this.state.activeStep} alternativeLabel>
                                {this.state.steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                                ))}
                            </Stepper>

                            <Card>
                                <CardBody>

                                    <AvForm onValidSubmit={this.addNewClient} mode={defaultValues} ref={c => (this.form = c)}>
                                        <Row className="align-items-center">
                                            <Col sm="6">
                                                <AvField name="first_name" label="FIRST NAME"
                                                    placeholder="Enter First Name" type="text" errorMessage="Enter First Name"
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                            <Col sm="6">
                                                <AvField name="last_name" label="LAST NAME"
                                                    placeholder="Enter Last Name" type="text" errorMessage="Enter Last Name"
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                        </Row>
                                        <AvField name="company" label="COMPANY"
                                            placeholder="Enter Company" type="text" errorMessage="Enter Company"
                                            validate={{ required: { value: true } }} />

                                        <Row className="align-items-center">
                                            <Col sm="12">
                                                <FormGroup>
                                                    <Radio.Group inline onChange={(e)=>this.setState({dlRegister: e.target.value})} name="dltRegister" value={this.state.dlRegister}>
                                                        <Label style={{marginRight: '10px'}}>DLT Register </Label>
                                                        <Radio value={'Registered'}>Registered</Radio>
                                                        <Radio value={'New Register'}>New Register</Radio>
                                                    </Radio.Group>

                                                    {/*<Label className="d-block mt-3">DLT Register</Label>
                                                    <AvRadioGroup value={"Registered"} inline name="dltRegister" required>
                                                        <AvRadio onChange={(event) => this.setState({dlRegister: event.target.value})} check customInput label="Registered" value="Registered" />
                                                        <AvRadio onChange={(event) => this.setState({dlRegister: event.target.value})} customInput label="New Register" value="New Register" />
                                                    </AvRadioGroup>*/}
                                                </FormGroup>
                                            </Col>

                                            {this.state.dlRegister === 'Registered' && 
                                                <Col sm="12">
                                                    <AvField name="dltRegistrationNo" label="Registration ID"
                                                        placeholder="Registration ID" type="text" errorMessage="Enter Registration ID"
                                                        validate={{ required: { value: true } }} />
                                                </Col>
                                            }
                                        </Row>

                                        <AvField name="gstno" label="GST NO"
                                            placeholder="eg: 00AAAAA0000AA" type="text" errorMessage="Enter Company"
                                            validate={{ required: { value: false } }} />
                                        <AvField name="website" label="WEBSITE"
                                            placeholder="Enter Website" type="url" errorMessage="Enter Website"
                                            validate={{ required: { value: false } }} />
                                         <AvField name="email" label="EMAIL"
                                            placeholder="Enter email" type="email" errorMessage="Enter Email"
                                            validate={{ required: { value: true } }} />
                                        <AvField name="username" label="USER NAME"
                                            placeholder="Enter User Name" type="text" errorMessage="Enter User Name"
                                            validate={{ required: { value: true } }} />
                                        <Row className="align-items-center">
                                            <Col sm="6">
                                                <label>PASSWORD</label>
                                                <AvField name="password" type="password"
                                                    placeholder="Password" errorMessage="Enter password"
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                            <Col sm="6">
                                                <label>CONFIRM PASSWORD</label>
                                                <AvField name="confirm_password" type="password"
                                                    placeholder="Re-type Password" errorMessage="Enter Re-password"
                                                    validate={{ required: { value: true }, match: { value: 'password' } }} />
                                            </Col>
                                        </Row>
                                        <AvField name="phone" label="PHONE"
                                            placeholder="Enter Phone" type="tel" errorMessage="Enter Phone no."
                                            validate={{ required: { value: true } }} />
                                        {/*<AvField type="text" name="address" label="ADDRESS"
                                            placeholder="Enter address" type="text" errorMessage="Enter address"
                                            validate={{ required: { value: true } }} />*/}
                                        <AvGroup>
                                            <Label for="address">BillingAddress</Label>
                                            <textarea
                                                name="address" 
                                                id="address" 
                                                className="form-control"
                                                validate={{ required: { value: true } }}
                                                onChange={(event) => this.setState({address: event.target.value})}
                                                rows="3"
                                                errorMessage="Address is required!"
                                            />
                                        </AvGroup>

                                        {/*<AvField name="more_address" label="MORE ADDRESS"
                                            placeholder="Enter more address" type="text" errorMessage="Enter more address"
                                            validate={{ required: { value: true } }} /> */}
                                        <Row className="align-items-center">
                                            <Col sm="6">
                                                <Label>COUNTRY</Label>
                                                <Select
                                                    label="COUNTRY"
                                                    defaultValue={Countries[0].options[99]}
                                                    onChange={this.handleSelectCountry}
                                                    options={Countries}
                                                />
                                            </Col>
                                            <Col sm="6">
                                                <AvField name="state" label="STATE"
                                                    placeholder="Enter state" type="text" errorMessage="Enter state"
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                        </Row>
                                        <Row className="align-items-center">
                                            <Col sm="6">
                                                <AvField name="city" label="CITY"
                                                    placeholder="Enter city" type="text" errorMessage="Enter city"
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                            <Col sm="6">
                                                <AvField name="postalcode" label="POSTCODE"
                                                    placeholder="Enter postalcode" type="text" errorMessage="Enter postalcode"
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                        </Row>

                                        <Row className="align-items-center">
                                            {/*<Col sm="6">
                                            <Col sm="6">
                                                <Label className="d-block mt-3">RESELLER PANEL </Label>
                                                <AvRadioGroup inline value={'false'} name="isResellerPanel" required>
                                                    <AvRadio customInput label="Yes" value="true" />
                                                    <AvRadio customInput label="No" value="false" />
                                                </AvRadioGroup>
                                            </Col>
                                                <FormGroup>
                                                    <Label className="d-block mt-3">API ACCESS </Label>
                                                    <AvRadioGroup value={'true'} inline name="isApiAccess" required>
                                                        <AvRadio  customInput label="Yes" value="true" />
                                                        <AvRadio  customInput label="No" value="false" />
                                                    </AvRadioGroup>

                                                </FormGroup>
                                            </Col>*/}
                                        </Row>

                                        {getLoggedInUser().userType === 'superadmin' && (
                                        <>
                                        <Row className="align-items-center">
                                            <Col sm="6">
                                                <AvField name="assignedCredits" label="Credits Assign"
                                                    placeholder="Enter credit" type="number" errorMessage="Enter credit"
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                            <Col sm="6">
                                                <Label>Assign Route </Label>
                                                <Select
                                                    label="Assign Route"
                                                    // defaultValue={this.state.groups[0].options[0]}
                                                    required={true}
                                                    className="reactselect-invalid"
                                                    onChange={this.handleSelectUserRoute}
                                                    options={this.state.smsGateways}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="align-items-center">
                                            <Col sm="6">
                                                <Label style={{marginRight: '10px'}}>Billing Based On </Label>
                                                <Radio.Group onChange={(e)=>this.setState({consumptionType: e.target.value})} name="consumptionType" value={this.state.consumptionType}>
                                                    <Radio value={'Submitted'}>Submitted</Radio>
                                                    <Radio value={'Delivery'}>Delivery</Radio>
                                                </Radio.Group>

                                                {/*<Label className="d-block mt-3">Billing Based On</Label>
                                                <AvRadioGroup inline value={'Submitted'} name="consumptionType" required>
                                                    <AvRadio customInput label="Submitted" value="Submitted" />
                                                    <AvRadio customInput label="Delivery" value="Delivery" />
                                                </AvRadioGroup>*/}
                                            </Col>
                                            <Col sm="6">
                                                <FormGroup>
                                                    <Label style={{marginRight: '10px'}}>Credit Type </Label>
                                                    <Radio.Group name="creditType" onChange={(e)=>this.setState({creditType: e.target.value})} value={this.state.creditType}>
                                                        <Radio value={'PostPaid'}>PostPaid</Radio>
                                                        <Radio value={'Prepaid'}>Prepaid</Radio>
                                                    </Radio.Group>

                                                    {/*<Label className="d-block mt-3">Credit Type </Label>
                                                    <AvRadioGroup name="creditType" value={'Prepaid'} inline name="planType" required>
                                                        <AvRadio  customInput label="PostPaid" value="PostPaid" />
                                                        <AvRadio  customInput label="Prepaid" value="Prepaid" />
                                                    </AvRadioGroup>*/}

                                                </FormGroup>
                                            </Col>
                                            <Col sm="6">
                                                <FormGroup>
                                                    <Label style={{marginRight: '10px'}}>NOTIFY CLIENT WITH EMAIL </Label>
                                                    <Radio.Group onChange={(e)=>this.setState({isClientNotify: e.target.value})} name="isClientNotify" value={this.state.isClientNotify}>
                                                        <Radio value={'Yes'}>Yes</Radio>
                                                        <Radio value={'No'}>No</Radio>
                                                    </Radio.Group>

                                                    {/*<Label className="d-block mt-3">NOTIFY CLIENT WITH EMAIL </Label>
                                                    <AvRadioGroup value={"true"} inline name="isClientNotify" required>
                                                        <AvRadio check customInput label="Yes" value="true" />
                                                        <AvRadio customInput label="No" value="false" />
                                                    </AvRadioGroup>*/}
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col sm="6">
                                                <Label style={{marginRight: '10px'}}>SMS TYPE </Label>
                                                <FormGroup>
                                                    <Radio.Group onChange={(e)=>this.setState({smsType: e.target.value})} name="smsType" value={this.state.smsType}>
                                                        <Radio value={'Transactional'}>Transactional</Radio>
                                                        <Radio value={'Promotional'}>Promotional</Radio>
                                                    </Radio.Group>

                                                    {/*<Label className="d-block mt-3">SMS TYPE </Label>
                                                    <AvRadioGroup  value={"Promotional"} inline name="smsType" required>
                                                        <AvRadio onChange={(event) => this.setState({smsType: event.target.value})} check customInput label="Transactional" value="Transactional" />
                                                        <AvRadio onChange={(event) => this.setState({smsType: event.target.value})} customInput label="Promotional" value="Promotional" />
                                                    </AvRadioGroup>*/}
                                                </FormGroup>
                                            </Col>

                                            {this.state.smsType === "Transactional" &&
                                                <Col sm="6">
                                                    <Label>SMS TEMPLATE TYPE </Label>
                                                    <Select
                                                        label="SMS TEMPLATE TYPE"
                                                        onChange={this.handleSelectTemplate}
                                                        defaultValue={TEMPLATE_TYPE[0].options[0]}
                                                        options={TEMPLATE_TYPE}
                                                    />
                                                </Col>
                                            }
                                        </Row>
                                        
                                        <Row className="align-items-center">                                            
                                            <Col sm="6">
                                                <Label>USER TYPE </Label>
                                                <Select
                                                    className="mb-select"
                                                    label="USER TYPE"
                                                    onChange={this.handleSelectUserType}
                                                    defaultValue={USER_TYPE[0].options[0]}
                                                    options={USER_TYPE}
                                                />
                                            </Col>

                                            {/*<Col sm="6">
                                                <Label>CLIENT GROUP </Label>
                                                <Select
                                                    className="mb-select"
                                                    label="CLIENT GROUP"
                                                    defaultValue={CLIENT_GROUP[0].options[0]}
                                                    required={true}
                                                    className="reactselect-invalid"
                                                    onChange={this.handleSelectUserType}
                                                    options={CLIENT_GROUP}
                                                />
                                            </Col>*/}

                                            {/*<Col sm="6">
                                                <Label>SMS Gateway </Label>
                                                <Select
                                                    className="mb-select"
                                                    label="SMS Gateway"
                                                    defaultValue={SMS_GATEWAY[0].options[0]}
                                                    required={true}
                                                    className="reactselect-invalid"
                                                    onChange={this.handleSmsGateway}
                                                    options={SMS_GATEWAY}
                                                />
                                            </Col>*/}

                                            <Col sm="6">
                                                <Label>Reffer By </Label>
                                                <Select
                                                    className="reactselect-invalid"
                                                    label="Reffer By"
                                                    defaultValue={REFFER_BY[0].options[0]}
                                                    required={true}
                                                    onChange={this.handleReffeerBy}
                                                    options={REFFER_BY}
                                                />
                                            </Col>

                                            {/*<Col sm="6">
                                                <Label>STATUS </Label>
                                                <Select
                                                    className="mb-select"
                                                    label="STATUS"
                                                    onChange={this.handleSelectStatus}
                                                    defaultValue={STATUS[0].options[0]}
                                                    options={STATUS}
                                                />
                                            </Col>*/}
                                            
                                        </Row>
                                        </>
                                        )} 

                                        <Row className="align-items-center">
                                            <Col sm="6">
                                                <AvField name="price" label="Price"
                                                    placeholder="Enter Price" type="number" errorMessage="Enter Price"
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                        </Row>

                                        <FormGroup className="mb-0 mt-3">
                                            <div className="float-right">
                                                <Button type="submit" color="primary" className="mr-1">
                                                    {(this.state.isAdding)?'Please Wait...':'Submit'}
                                                    </Button>{' '}
                                                <Button type="reset" color="secondary">
                                                    Cancel
                                                    </Button>
                                            </div>
                                            <div className="float-right">
                                                {this.state.activeStep === this.state.steps.length ? (
                                                <div>
                                                    <Typography className={'instructions'}>All steps completed</Typography>
                                                </div>
                                                ) : (
                                                <div>
                                                    <Typography className={'instructions'}>{this.getStepContent(this.state.activeStep)}</Typography>
                                                    <div>
                                                    <Button
                                                        disabled={this.state.activeStep === 0}
                                                        onClick={this.handleBack}
                                                        className={'backButton'}
                                                    >
                                                        Back
                                                    </Button>
                                                    <Button variant="contained" color="primary" onClick={this.handleNext}>
                                                        {this.state.activeStep === this.state.steps.length - 1 ? 'Finish' : 'Next'}
                                                    </Button>
                                                    </div>
                                                </div>
                                                )}
                                            </div>
                                        </FormGroup>

                                    </AvForm>

                                </CardBody>

                                

                            </Card>
                        </Col>

                        {this.state.dlRegister === 'New Register' &&
                        <Col lg="6">
                            <Card>
                                <CardBody>
    
                                    <AvForm onValidSubmit={this.addNewClient} mode={defaultValues} ref={c => (this.form1 = c)}>
                                        <Row className="align-items-center">
                                            <Col sm="6">
                                                <Label>Entity Type *</Label>
                                                <Select
                                                    label="Entity Type *"
                                                    defaultValue={CLIENT_GROUP[0].options[99]}
                                                    onChange={this.handleSelectClientGroup}
                                                    options={CLIENT_GROUP}
                                                />
                                            </Col>
                                            <Col sm="6">
                                                <Label>Category of Organization *</Label>
                                                <Select
                                                    label="Category of Organization *"
                                                    defaultValue={CLIENT_GROUP[0].options[99]}
                                                    onChange={this.handleSelectClientGroup}
                                                    options={CLIENT_GROUP}
                                                />
                                            </Col>
                                            
                                            <Col sm="6">
                                                <AvField name="pan_no" label=" PAN Number *"
                                                    placeholder="eg: AAAAA0000A" type="text" errorMessage="Enter First Name"
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                            <Col sm="6">
                                                {/*<AvField name="upload_pan" label="Upload PAN *"
                                                    placeholder="Enter Upload PAN *" type="file" errorMessage="Upload PAN *"
                                                    validate={{ required: { value: true } }} />*/}
                                                <Dropzone onDrop={acceptedFiles => this.handleAcceptedFilesPan(acceptedFiles)}>
                                                    {({ getRootProps, getInputProps }) => (
                                                        <div className="dropzone">
                                                            <div className="dz-message needsclick" {...getRootProps()}>
                                                                <input {...getInputProps()} />
                                                                <h6 className="font-12">Upload PAN *</h6>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Dropzone>
                                                <div className="dropzone-previews mt-3" id="file-previews">
                                                    {this.state.selectedFilesPan.map((f, i) => {
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

                                            <Col sm="6">
                                                <AvField name="cin" label="CIN/ GST/ TAN"
                                                    placeholder="Enter CIN/ GST/ TAN" type="text" errorMessage="Enter CIN/ GST/ TAN"
                                                    validate={{ required: { value: true } }} />
                                            </Col>

                                            <Col sm="6">
                                                {/*<AvField name="upload_cin" label="Upload CIN/ GST/ TAN"
                                                    placeholder="Enter Upload CIN/ GST/ TAN" type="file" errorMessage="Upload CIN/ GST/ TAN"
                                                    validate={{ required: { value: false } }} />*/}
                                                <Dropzone onDrop={acceptedFiles => this.handleAcceptedFilesCin(acceptedFiles)}>
                                                    {({ getRootProps, getInputProps }) => (
                                                        <div className="dropzone">
                                                            <div className="dz-message needsclick" {...getRootProps()}>
                                                                <input {...getInputProps()} />
                                                                <h6 className="font-12">Upload CIN/ GST/ TAN</h6>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Dropzone>
                                                <div className="dropzone-previews mt-3" id="file-previews">
                                                    {this.state.selectedFilesCin.map((f, i) => {
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

                                            <Col sm="6">
                                                <Label>Proof Of Identity  </Label>
                                                <Select
                                                    label="Proof Of Identity "
                                                    // defaultValue={this.state.routes[0].options[0]}
                                                    required={true}
                                                    className="reactselect-invalid"
                                                    onChange={this.handleSelectUserRoute}
                                                    options={this.state.routes}
                                                />
                                            </Col>

                                            <Col sm="6">
                                                {/*<AvField name="upload_proof_of_identy" label="Proof Of Identity"
                                                    placeholder="" type="file" errorMessage="Upload Proof Of Identity"
                                                    validate={{ required: { value: false } }} />*/}
                                                <Dropzone onDrop={acceptedFiles => this.handleAcceptedFilesProof(acceptedFiles)}>
                                                    {({ getRootProps, getInputProps }) => (
                                                        <div className="dropzone">
                                                            <div className="dz-message needsclick" {...getRootProps()}>
                                                                <input {...getInputProps()} />
                                                                <h6 className="font-12">Upload Proof Of Identity</h6>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Dropzone>
                                                <div className="dropzone-previews mt-3" id="file-previews">
                                                    {this.state.selectedFilesProof.map((f, i) => {
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

                                            <Col sm="6">
                                                <AvField name="other_documents" label="Other Documents"
                                                    placeholder="Enter Other Documents" type="email" errorMessage="Enter Other Documents"
                                                    validate={{ required: { value: false } }} />
                                            </Col>

                                            <Col sm="6">
                                                {/*<AvField name="upload_other_documents" label="Upload Other Documents"
                                                    placeholder="Upload Other Documents" type="file" errorMessage="Upload Other Documents"
                                                    validate={{ required: { value: false } }} />*/}
                                                <Dropzone onDrop={acceptedFiles => this.handleAcceptedFilesOther(acceptedFiles)}>
                                                    {({ getRootProps, getInputProps }) => (
                                                        <div className="dropzone">
                                                            <div className="dz-message needsclick" {...getRootProps()}>
                                                                <input {...getInputProps()} />
                                                                <h6 className="font-12">Upload Other Documents</h6>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Dropzone>
                                                <div className="dropzone-previews mt-3" id="file-previews">
                                                    {this.state.selectedFilesOther.map((f, i) => {
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

                                        <Row>
                                            <Col sm="12">
                                                <h6>Authorized Person Information</h6>
                                            </Col>

                                            <Col sm="6">
                                                <AvField name="authorized_name" label="Name"
                                                    placeholder="Enter Name" type="text" errorMessage="Enter Name"
                                                    validate={{ required: { value: false } }} />
                                            </Col>

                                            <Col sm="6">
                                                {/*<AvField name="upload_other_documents" label="Upload Other Documents"
                                                    placeholder="Upload Other Documents" type="file" errorMessage="Upload Other Documents"
                                                    validate={{ required: { value: false } }} />*/}
                                                <Dropzone onDrop={acceptedFiles => this.handleAcceptedFilesAuthorizedDocument(acceptedFiles)}>
                                                    {({ getRootProps, getInputProps }) => (
                                                        <div className="dropzone">
                                                            <div className="dz-message needsclick" {...getRootProps()}>
                                                                <input {...getInputProps()} />
                                                                <h6 className="font-12">Upload Other Documents</h6>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Dropzone>
                                                <div className="dropzone-previews mt-3" id="file-previews">
                                                    {this.state.selectedFilesAuthorizedDocument.map((f, i) => {
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

                                            <Col sm="6">
                                                <AvField name="authorized_designation" label="Designation"
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
                                                    placeholder="Upload Other Documents" type="file" errorMessage="Upload Other Documents"
                                                    validate={{ required: { value: false } }} />*/}
                                                <Dropzone onDrop={acceptedFiles => this.handleAcceptedFilesAuthorizedLetter(acceptedFiles)}>
                                                    {({ getRootProps, getInputProps }) => (
                                                        <div className="dropzone">
                                                            <div className="dz-message needsclick" {...getRootProps()}>
                                                                <input {...getInputProps()} />
                                                                <h6 className="font-12">Upload Letter of Authorization *</h6>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Dropzone>
                                                <div className="dropzone-previews mt-3" id="file-previews">
                                                    {this.state.selectedFilesAuthorizedLetter.map((f, i) => {
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

                                    </AvForm>

                                </CardBody>
                            </Card>
                        </Col>
                        }

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
                            onConfirm={() => this.props.history.push('/allClients')} >
                        </SweetAlert> 
                    }

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(AddClient));