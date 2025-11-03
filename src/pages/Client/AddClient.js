import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, textarea } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { FormControl, AvField, AvGroup } from 'availity-reactstrap-validation';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Select from 'react-select';
import Countries from '../../utils/Countries';
import Dropzone from 'react-dropzone';
import {ServerApi} from '../../utils/ServerApi';
import { Radio } from 'antd';
import {getLoggedInUser} from '../../helpers/authUtils';

// import { makeStyles } from '@mui/material/styles';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// --- KEY CHANGES (IMPORTS) ---
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated
import Swal from 'sweetalert2'; // ADDED: Modern Alert Library
import withReactContent from 'sweetalert2-react-content'; // ADDED: React wrapper
// --- END KEY CHANGES ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

// ... (Constants like CLIENT_GROUP, REFFER_BY, etc. remain unchanged)
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
// ... (end of constants)


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
            
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed, as SweetAlert2 is called imperatively
            // success_msg: false,
            // success_message: '',
            // modalType:'success',
            // modal_standard: false,
            // --- END KEY CHANGE ---

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
            // ... (rest of state remains unchanged)
        };
        // ... (constructor bindings remain unchanged)
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
    
    // ... (All component lifecycle and handle methods remain unchanged)
    
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
            // ... (raw data object remains unchanged)
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
                // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
                // this.setState({success_msg: true, modalType:'error', success_message : res.data.message, isAdding: false}); // REMOVED
                this.setState({ isAdding: false });
                MySwal.fire({
                    title: 'Error!',
                    text: res.data.message,
                    icon: 'error'
                });
                // --- END KEY CHANGE ---
                return false;
            }
            
            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({success_msg: true, modalType:'success', success_message : "Client Added!", isAdding: false}); // REMOVED
            this.setState({ isAdding: false });
            MySwal.fire({
                title: 'Client Added!',
                icon: 'success'
            }).then(() => {
                // This logic was in the old <SweetAlert> onConfirm prop
                this.props.history.push('/allClients');
            });
            // --- END KEY CHANGE ---

            this.form && this.form.reset();

          })
          .catch(error => {
              console.log('error', error);
              this.setState({ isAdding: false });
              MySwal.fire({
                  title: 'Error!',
                  text: 'An unknown error occurred.',
                  icon: 'error'
              });
          });
    }

    // ... (All Dropzone handleAcceptedFiles and formatBytes methods remain unchanged)
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
    formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    // ... (Stepper navigation methods remain unchanged)
    handleNext = () => {
        this.setState({activeStep: this.state.activeStep +1})
    };
    handleBack = () => {
        this.setState({activeStep: this.state.activeStep -1})
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
                    {/* ... (All JSX in render() remains unchanged, EXCEPT for the SweetAlert block) ... */}
                    
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">Add New Client</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="6">
                            {/* ... (Stepper JSX remains unchanged) ... */}
                            <Card>
                                <CardBody>
                                    <FormControl onValidSubmit={this.addNewClient} mode={defaultValues} ref={c => (this.form = c)}>
                                        {/* ... (All FormControl fields remain unchanged) ... */}
                                    </FormControl>
                                </CardBody>
                            </Card>
                        </Col>

                        {this.state.dlRegister === 'New Register' &&
                        <Col lg="6">
                            <Card>
                                <CardBody>
                                    <FormControl onValidSubmit={this.addNewClient} mode={defaultValues} ref={c => (this.form1 = c)}>
                                        {/* ... (All FormControl fields in the second column remain unchanged) ... */}
                                    </FormControl>
                                </CardBody>
                            </Card>
                        </Col>
                        }
                    </Row>

                    {/* --- KEY CHANGE (SWEETALERT BLOCK DELETED) --- */}
                    {/* The old <SweetAlert> component is DELETED from the render method.
                        It is now triggered as a function call in the 'addNewClient' method. */}
                    {/* {this.state.success_msg &&
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
                    } */}
                    {/* --- END KEY CHANGE --- */}

                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout })(AddClient);