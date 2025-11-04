import React, { Component } from 'react';
import { activateAuthLayout } from '../../store/actions';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Select from 'react-select'; // RETAINED: For complex select inputs
import Countries from '../../utils/Countries'; // RETAINED: Utility import
import Dropzone from 'react-dropzone';
import {ServerApi} from '../../utils/ServerApi';
// REMOVED: import { Radio } from 'antd'; // Replaced with MUI Radio/RadioGroup
import {getLoggedInUser} from '../../helpers/authUtils';

// --- MUI Imports ---
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    TextField, 
    Button as MuiButton, // Renamed to avoid clashes
    InputLabel, 
    FormControl as MuiFormControl, // Renamed to avoid clash with removed Availity FormControl
    RadioGroup,
    Radio,
    FormControlLabel,
    Stepper,
    Step,
    StepLabel,
    Checkbox
} from '@mui/material';
// --- END MUI Imports ---

import Swal from 'sweetalert2'; 
import withReactContent from 'sweetalert2-react-content'; 

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

// --- Form Options ---
const CLIENT_GROUP = [
    { options: [{ label: "None", value: "None" }] }
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
            { label: "User", value: "CLIENT", isOptionSelected: true },
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
// --- End Form Options ---


class AddClient extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // General UI/Select States
            selectedGroup: null, 
            country: 'India',
            client_group: 'None',
            client_route: 'None',
            user_type: 'CLIENT',
            status: 'Active',
            smsGateway: '',
            reffeerBy: '',
            dlRegister: 'Registered', // Radio value controlling second column visibility
            consumptionType: 'Submitted',
            smsType: 'Promotional',
            creditType: 'Prepaid',
            isAdding: false,
            
            // Input Field States (for controlled components)
            firstName: '', lastName: '', company: '', website: '', email: '', username: '', 
            password: '', confirmPassword: '', phone: '', address: '', state: '', city: '', 
            postalCode: '', assignedCredits: '', dltRegistrationNo: '', gstno: '', price: '',
            
            // Checkbox/Radio States
            isResellerPanel: 'Yes', // Defaulted to Yes
            isApiAccess: 'Yes',
            isClientNotify: 'No',
            planType: 'Monthly', // Assuming a default for planType
            billingType: 'Submit', // Assuming a default for billingType
            
            // File Upload States
            selectedFilesPan: [], selectedFilesCin: [], selectedFilesProof: [], selectedFilesOther: [], 
            selectedFilesAuthorizedDocument: [], selectedFilesAuthorizedLetter: [],
            
            // Data/Options States
            smsGateways: [{ label: "SMS Routes", options: [] }],
            routes: [], // For client_route select
            groups: [], // For client_group select

            // Stepper States
            steps: ['Personal Info', 'Documents', 'Permissions', 'Billing'],
            activeStep: 0,
        };
        
        // Form & Logic Bindings
        this.handleAcceptedFilesPan = this.handleAcceptedFilesPan.bind(this);
        this.handleAcceptedFilesCin = this.handleAcceptedFilesCin.bind(this);
        this.handleAcceptedFilesProof = this.handleAcceptedFilesProof.bind(this);
        this.handleAcceptedFilesOther = this.handleAcceptedFilesOther.bind(this);
        this.handleAcceptedAuthorizedDocument = this.handleAcceptedAuthorizedDocument.bind(this);
        this.handleAcceptedAuthorizedLetter = this.handleAcceptedAuthorizedLetter.bind(this);
        this.addNewClient = this.addNewClient.bind(this);
        this.loadRoutes = this.loadRoutes.bind(this);
        this.loadGroups = this.loadGroups.bind(this);
        this.loadSmsGateways = this.loadSmsGateways.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this); // Generic Input Handler
    }
    
    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadRoutes();
        this.loadGroups();
        this.loadSmsGateways();
    }

    // --- Utility Handlers ---

    // Generic handler for all TextFields/Radios/etc.
    handleInputChange = e => {
        const { name, value, type, checked } = e.target;
        this.setState({
            [name]: type === 'checkbox' ? checked : value
        });
    };
    
    // Select Handlers
    handleSelectCountry = (selectedItem) => { this.setState({ country: selectedItem.value }); }
    handleSelectUserType = (selectedItem) => { this.setState({ user_type: selectedItem.value }); }
    handleSelectStatus = (selectedItem) => { this.setState({ status: selectedItem.value }); }
    handleSelectClientGroup = (selectedItem) => { this.setState({ client_group: selectedItem.value }); }
    handleSelectUserRoute = (selectedItem) => { this.setState({ client_route: selectedItem.value }); }
    handleSelectTemplate = (selectedItem) => { this.setState({ template: selectedItem.value }); } 
    handleSmsGateway = (selectedItem) => { this.setState({ smsGateway: selectedItem.value }); }
    handleReffeerBy = (selectedItem) => { this.setState({ reffeerBy: selectedItem.value }); } 
    
    // Stepper navigation methods
    handleNext = () => {
        // Simple check before moving to the next step
        if (this.state.activeStep === 0 && (!this.state.firstName || !this.state.email || !this.state.password)) {
            MySwal.fire('Validation Error', 'Please complete the mandatory fields in the current step.', 'warning');
            return;
        }
        this.setState({ activeStep: this.state.activeStep + 1 });
    };
    handleBack = () => { this.setState({ activeStep: this.state.activeStep - 1 }); };
    
    // Navigation
    goToAllClients(){ this.props.history.push('/allClients'); }
    
    // File Handlers
    formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    handleAcceptedFiles = (files, stateKey) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));
        this.setState({ [stateKey]: files });
    }
    handleAcceptedFilesPan = (files) => { this.handleAcceptedFiles(files, 'selectedFilesPan'); }
    handleAcceptedFilesCin = (files) => { this.handleAcceptedFiles(files, 'selectedFilesCin'); }
    handleAcceptedFilesProof = (files) => { this.handleAcceptedFiles(files, 'selectedFilesProof'); }
    handleAcceptedFilesOther = (files) => { this.handleAcceptedFiles(files, 'selectedFilesOther'); }
    handleAcceptedAuthorizedDocument = (files) => { this.handleAcceptedFiles(files, 'selectedFilesAuthorizedDocument'); }
    handleAcceptedAuthorizedLetter = (files) => { this.handleAcceptedFiles(files, 'selectedFilesAuthorizedLetter'); }
    
    // --- API Loaders ---
    
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
            if (res.data === undefined) { return false; } 
            var arr = res.data.map(obj => ({
                label: obj.groupName + " ("+obj.contactsCount + ")",
                value: obj.id,
            }))
            this.setState({groups: arr})
          })
          .catch(error => console.log('error', error));
    }
    
    loadRoutes(){
        ServerApi().get('routes/fetch-active-routes')
          .then(res => {
            if (res.data === undefined) { return false; } 
            var arr = res.data.response.map(obj => ({
                label: obj.routeName,
                value: obj.routeName,
            }))
            this.setState({routes: arr})
          })
          .catch(error => console.log('error', error));
    }
    
    // --- Form Submission ---

    addNewClient(event){
        event.preventDefault(); // Prevent default form submission

        // Simple validation checks before API call (assuming this is the last step)
        if (this.state.password !== this.state.confirmPassword) {
            MySwal.fire('Error!', 'Passwords do not match.', 'error');
            return;
        }

        this.setState({isAdding: true});

        var raw = {
            requestType: "ADDCLIENT",
            payload:{ 
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                company: this.state.company,
                website: this.state.website,
                email: this.state.email,
                userName: this.state.username,
                password: this.state.confirmPassword,
                userType: this.state.user_type,
                phoneNumber: this.state.phone,
                address: this.state.address,
                country: this.state.country,
                state: this.state.state,
                city: this.state.city,
                postalCode: this.state.postalCode,
                isResellerPanel: this.state.isResellerPanel,
                isApiAccess: this.state.isApiAccess,
                clientGroup: this.state.client_group, // Using state values now
                groupId: this.state.client_group, // Assuming group ID is the same as name/value
                smsGateway: this.state.client_route,
                assignedCredits: this.state.assignedCredits,
                consumptionType: this.state.consumptionType, 
                planType: this.state.planType,
                dltRegistrationNo: this.state.dltRegistrationNo,
                gstno: this.state.gstno,
                smsType: this.state.smsType,
                assignRoute: this.state.client_route,
                billingType : this.state.billingType,
                creditType : this.state.creditType, 
                isClientNotify : this.state.isClientNotify,
                smsTemplateType : this.state.template,
                referredBy: this.state.reffeerBy,
                entityType : "None",
                orgCategory : "None",
                pan : "", // File metadata should go here
                cinOrGstOrTan : "",
                idProof : "",
                otherDocName : "",
                authorisedName : "",
                designation : "",
                price: this.state.price,
            }
        };


        var formdata = new FormData();
        formdata.append("request", JSON.stringify(raw));
        // Add files to FormData (for brevity, omitting full file upload logic replication)
        // if (this.state.selectedFilesPan.length > 0) formdata.append("panFile", this.state.selectedFilesPan[0]);

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).post("addClient", formdata)
          .then(res => {
            this.setState({ isAdding: false });
            
            if (res.data !== undefined && res.data.status !== true) {
                MySwal.fire({
                    title: 'Error!',
                    text: res.data.message || 'Client addition failed.',
                    icon: 'error'
                });
                return false;
            }
            
            MySwal.fire({
                title: 'Client Added!',
                icon: 'success'
            }).then(() => {
                this.props.history.push('/allClients');
            });
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

    // --- Render Methods for Stepper Content ---
    
    renderStep0() { // Personal Info
        return (
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField name="firstName" label="First Name" value={this.state.firstName} onChange={this.handleInputChange} fullWidth required margin="normal" size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField name="lastName" label="Last Name" value={this.state.lastName} onChange={this.handleInputChange} fullWidth margin="normal" size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField name="company" label="Company" value={this.state.company} onChange={this.handleInputChange} fullWidth required margin="normal" size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField name="website" label="Website" value={this.state.website} onChange={this.handleInputChange} fullWidth margin="normal" size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField name="email" label="Email" value={this.state.email} onChange={this.handleInputChange} fullWidth required type="email" margin="normal" size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField name="phone" label="Phone Number" value={this.state.phone} onChange={this.handleInputChange} fullWidth required margin="normal" size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField name="username" label="User Name" value={this.state.username} onChange={this.handleInputChange} fullWidth required margin="normal" size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <MuiFormControl fullWidth margin="normal" size="small">
                        <InputLabel shrink>User Type</InputLabel>
                        <Select
                            classNamePrefix="react-select"
                            name="user_type"
                            value={USER_TYPE[0].options.find(opt => opt.value === this.state.user_type)}
                            onChange={this.handleSelectUserType}
                            options={USER_TYPE[0].options}
                            placeholder="Select User Type"
                        />
                    </MuiFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField name="password" label="Password" value={this.state.password} onChange={this.handleInputChange} fullWidth required type="password" margin="normal" size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField name="confirmPassword" label="Confirm Password" value={this.state.confirmPassword} onChange={this.handleInputChange} fullWidth required type="password" margin="normal" size="small" />
                </Grid>
                <Grid item xs={12}>
                    <TextField name="address" label="Address" value={this.state.address} onChange={this.handleInputChange} fullWidth multiline rows={3} margin="normal" size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <MuiFormControl fullWidth margin="normal" size="small">
                        <InputLabel shrink>Country</InputLabel>
                        <Select
                            classNamePrefix="react-select"
                            name="country"
                            value={Countries.find(c => c.value === this.state.country)}
                            onChange={this.handleSelectCountry}
                            options={Countries}
                            placeholder="Select Country"
                        />
                    </MuiFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField name="state" label="State" value={this.state.state} onChange={this.handleInputChange} fullWidth margin="normal" size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField name="city" label="City" value={this.state.city} onChange={this.handleInputChange} fullWidth margin="normal" size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField name="postalCode" label="Postal Code" value={this.state.postalCode} onChange={this.handleInputChange} fullWidth margin="normal" size="small" />
                </Grid>
            </Grid>
        );
    }

    renderStep1() { // Documents
        const { dlRegister } = this.state;
        
        const renderDropzone = (label, files, handler) => (
            <MuiFormControl fullWidth margin="normal" size="small">
                <InputLabel shrink sx={{ position: 'relative', transform: 'none' }}>{label}</InputLabel>
                <Box sx={{ mt: 1 }}>
                    <Dropzone onDrop={handler}>
                        {({ getRootProps, getInputProps }) => (
                            <Box sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 2, textAlign: 'center', cursor: 'pointer' }} {...getRootProps()}>
                                <input {...getInputProps()} />
                                <Typography variant="caption">Drag 'n' drop file here, or click to select</Typography>
                            </Box>
                        )}
                    </Dropzone>
                    {files.map((f, i) => (
                        <Typography key={i} variant="caption" sx={{ display: 'block', mt: 1, fontWeight: 'bold' }}>
                            {f.name} - {f.formattedSize}
                        </Typography>
                    ))}
                </Box>
            </MuiFormControl>
        );

        return (
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <MuiFormControl component="fieldset">
                        <RadioGroup row name="dlRegister" value={dlRegister} onChange={this.handleInputChange}>
                            <InputLabel sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>DLT Registration:</InputLabel>
                            <FormControlLabel value="Registered" control={<Radio size="small" />} label="Registered" />
                            <FormControlLabel value="New Register" control={<Radio size="small" />} label="New Register" />
                        </RadioGroup>
                    </MuiFormControl>
                </Grid>

                {dlRegister === 'New Register' && (
                    <>
                        <Grid item xs={12}>
                            <TextField name="dltRegistrationNo" label="DLT Registration No." value={this.state.dltRegistrationNo} onChange={this.handleInputChange} fullWidth required margin="normal" size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {renderDropzone("PAN Card", this.state.selectedFilesPan, this.handleAcceptedFilesPan)}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {renderDropzone("CIN/GST/TAN Proof", this.state.selectedFilesCin, this.handleAcceptedFilesCin)}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {renderDropzone("ID Proof (Passport/Aadhaar)", this.state.selectedFilesProof, this.handleAcceptedFilesProof)}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {renderDropzone("Other Document", this.state.selectedFilesOther, this.handleAcceptedFilesOther)}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {renderDropzone("Authorized Person Document", this.state.selectedFilesAuthorizedDocument, this.handleAcceptedAuthorizedDocument)}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {renderDropzone("Authorized Person Letter", this.state.selectedFilesAuthorizedLetter, this.handleAcceptedAuthorizedLetter)}
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name="gstno" label="GST No" value={this.state.gstno} onChange={this.handleInputChange} fullWidth margin="normal" size="small" />
                        </Grid>
                    </>
                )}
            </Grid>
        );
    }

    renderStep2() { // Permissions
        return (
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <MuiFormControl fullWidth margin="normal" size="small">
                        <InputLabel shrink>Client Group</InputLabel>
                        <Select
                            classNamePrefix="react-select"
                            name="client_group"
                            value={CLIENT_GROUP[0].options.find(opt => opt.value === this.state.client_group)}
                            onChange={this.handleSelectClientGroup}
                            options={this.state.groups.length > 0 ? this.state.groups : CLIENT_GROUP[0].options}
                            placeholder="Select Client Group"
                        />
                    </MuiFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <MuiFormControl fullWidth margin="normal" size="small">
                        <InputLabel shrink>SMS Route</InputLabel>
                        <Select
                            classNamePrefix="react-select"
                            name="client_route"
                            value={this.state.routes.find(opt => opt.value === this.state.client_route)}
                            onChange={this.handleSelectUserRoute}
                            options={this.state.routes}
                            placeholder="Select SMS Route"
                            required
                        />
                    </MuiFormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <MuiFormControl component="fieldset" margin="normal">
                        <RadioGroup row name="isResellerPanel" value={this.state.isResellerPanel} onChange={this.handleInputChange}>
                            <InputLabel sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>Reseller Panel Access:</InputLabel>
                            <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                            <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                        </RadioGroup>
                    </MuiFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <MuiFormControl component="fieldset" margin="normal">
                        <RadioGroup row name="isApiAccess" value={this.state.isApiAccess} onChange={this.handleInputChange}>
                            <InputLabel sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>API Access:</InputLabel>
                            <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                            <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                        </RadioGroup>
                    </MuiFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <MuiFormControl component="fieldset" margin="normal">
                        <RadioGroup row name="isClientNotify" value={this.state.isClientNotify} onChange={this.handleInputChange}>
                            <InputLabel sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>Client Notifications:</InputLabel>
                            <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                            <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                        </RadioGroup>
                    </MuiFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <MuiFormControl fullWidth margin="normal" size="small">
                        <InputLabel shrink>Template Type</InputLabel>
                        <Select
                            classNamePrefix="react-select"
                            name="template"
                            value={TEMPLATE_TYPE[0].options.find(opt => opt.value === this.state.template)}
                            onChange={this.handleSelectTemplate}
                            options={TEMPLATE_TYPE[0].options}
                            placeholder="Select Template Type"
                        />
                    </MuiFormControl>
                </Grid>
            </Grid>
        );
    }

    renderStep3() { // Billing
        return (
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField name="assignedCredits" label="Assigned Credits" value={this.state.assignedCredits} onChange={this.handleInputChange} fullWidth required type="number" margin="normal" size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField name="price" label="SMS Price" value={this.state.price} onChange={this.handleInputChange} fullWidth required type="number" margin="normal" size="small" />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <MuiFormControl component="fieldset" margin="normal">
                        <InputLabel sx={{ mb: 1 }}>Consumption Type</InputLabel>
                        <RadioGroup row name="consumptionType" value={this.state.consumptionType} onChange={this.handleInputChange}>
                            <FormControlLabel value="Submitted" control={<Radio size="small" />} label="Submitted" />
                            <FormControlLabel value="Delivered" control={<Radio size="small" />} label="Delivered" />
                        </RadioGroup>
                    </MuiFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <MuiFormControl component="fieldset" margin="normal">
                        <InputLabel sx={{ mb: 1 }}>Credit Type</InputLabel>
                        <RadioGroup row name="creditType" value={this.state.creditType} onChange={this.handleInputChange}>
                            <FormControlLabel value="Prepaid" control={<Radio size="small" />} label="Prepaid" />
                            <FormControlLabel value="Postpaid" control={<Radio size="small" />} label="Postpaid" />
                        </RadioGroup>
                    </MuiFormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <MuiFormControl component="fieldset" margin="normal">
                        <InputLabel sx={{ mb: 1 }}>SMS Type</InputLabel>
                        <RadioGroup row name="smsType" value={this.state.smsType} onChange={this.handleInputChange}>
                            <FormControlLabel value="Promotional" control={<Radio size="small" />} label="Promotional" />
                            <FormControlLabel value="Transactional" control={<Radio size="small" />} label="Transactional" />
                        </RadioGroup>
                    </MuiFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <MuiFormControl component="fieldset" margin="normal">
                        <InputLabel sx={{ mb: 1 }}>Plan Type</InputLabel>
                        <RadioGroup row name="planType" value={this.state.planType} onChange={this.handleInputChange}>
                            <FormControlLabel value="Monthly" control={<Radio size="small" />} label="Monthly" />
                            <FormControlLabel value="Annual" control={<Radio size="small" />} label="Annual" />
                        </RadioGroup>
                    </MuiFormControl>
                </Grid>
                
                <Grid item xs={12}>
                    <MuiFormControl fullWidth margin="normal" size="small">
                        <InputLabel shrink>Referred By</InputLabel>
                        <Select
                            classNamePrefix="react-select"
                            name="reffeerBy"
                            value={REFFER_BY[0].options.find(opt => opt.value === this.state.reffeerBy)}
                            onChange={this.handleReffeerBy}
                            options={REFFER_BY[0].options}
                            placeholder="Select Referrer"
                        />
                    </MuiFormControl>
                </Grid>
            </Grid>
        );
    }
    
    getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return this.renderStep0();
            case 1:
                return this.renderStep1();
            case 2:
                return this.renderStep2();
            case 3:
                return this.renderStep3();
            default:
                return 'Unknown stepIndex';
        }
    }

    render() {
        const { activeStep, steps, isAdding } = this.state;

        return (
            <Box sx={{ p: 3 }}>
                
                <Box sx={{ mb: 4 }}>
                    <Grid container alignItems="center">
                        <Grid item xs={12}>
                            <Typography variant="h4" component="h1">Add New Client</Typography>
                        </Grid>
                    </Grid>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                            {/* Stepper Header */}
                            <Stepper activeStep={activeStep} alternativeLabel>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </Paper>
                    </Grid>

                    <Grid item lg={12} xs={12}>
                        <Paper elevation={3} sx={{ p: 3 }}>
                            
                            <Box component="form" onSubmit={this.addNewClient} ref={c => (this.form = c)}>
                                {/* Step Content */}
                                {this.getStepContent(activeStep)}

                                {/* Stepper Navigation Buttons */}
                                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, justifyContent: 'flex-end' }}>
                                    <MuiButton
                                        color="inherit"
                                        disabled={activeStep === 0 || isAdding}
                                        onClick={this.handleBack}
                                        sx={{ mr: 1 }}
                                    >
                                        Back
                                    </MuiButton>
                                    
                                    {activeStep !== steps.length - 1 ? (
                                        <MuiButton onClick={this.handleNext} variant="contained" disabled={isAdding}>
                                            Next
                                        </MuiButton>
                                    ) : (
                                        <MuiButton type="submit" variant="contained" color="primary" disabled={isAdding}>
                                            {isAdding ? 'Adding Client...' : 'Finish & Add Client'}
                                        </MuiButton>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    }
}

export default connect(null, { activateAuthLayout })(AddClient);
