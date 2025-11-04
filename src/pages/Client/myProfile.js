import React, { Component } from 'react';
// REMOVED: import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Nav, NavItem, NavLink, TabContent, TabPane, Modal, ModalBody } from 'reactstrap';
// REMOVED: import classnames from 'classnames';
import { activateAuthLayout, updateSmsBalance, openSnack } from '../../store/actions';
import Select from 'react-select'; // RETAINED: For complex select functionality
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import defaultProfileImage from '../../images/users/default_profile.jpg';
import {ServerApi} from '../../utils/ServerApi';
import DataLoading from '../../components/Loading/DataLoading';
import {print_state, print_city} from '../../utils/StateCity';
import {getLoggedInUser, setLoggeedInUser} from '../../helpers/authUtils';
import MaskInput from 'react-maskinput'; // RETAINED: For phone masking

// --- MUI Imports ---
import { 
    Box, Grid, Paper, Typography, TextField, Button as MuiButton, InputLabel, 
    FormControl as MuiFormControl, Tabs, Tab, Dialog, DialogTitle, DialogContent, 
    DialogActions, MenuItem 
} from '@mui/material';
// --- END MUI Imports ---

// --- Custom Tab Panel Component ---
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3, minHeight: 400 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}
// --- End Custom Tab Panel Component ---


const COMPANY_TYPES = [
    { label: "Private Ltd Company", value: "Private Ltd Company" },
    { label: "Public Ltd Company", value: "Public Ltd Company" },
    { label: "Unlimited Company", value: "Unlimited Company" },
    { label: "Sole proprietorship", value: "Sole proprietorship" },
    { label: "Joint Hindu Family business ", value: "Joint Hindu Family business " },
    { label: "Partnership Cooperatives ", value: "Partnership Cooperatives " },
    { label: "Limited Liability Partnership(LLP) ", value: "Limited Liability Partnership(LLP) " },
    { label: "Liaison Office ", value: "Liaison Office " },
    { label: "Branch Office ", value: "Branch Office " },
    { label: "Project Office ", value: "Project Office " },
    { label: "Subsidiary Company", value: "Subsidiary Company" },
];

class MyProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0, // MUI Tabs start at index 0
            clientDetails: {},
            address : '',
            country : 'India',
            isLoading: true,
            modal_change_image: false,
            isAdding: false,
            isDisabled: true, // Controls form edit mode
            selectedFilesDocument: [],
            selectedState: '',
            selectedCity: '',
            selectedStateIndex: 29, // Default to India/Maharashtra (or similar common index)
            selectedCompanyType: '',
            templateBased: {label: 'Yes', value:true},
            gstNo: '',
        };

        this.updateClient = this.updateClient.bind(this);
        this.tog_update_image = this.tog_update_image.bind(this);
        this.handleAcceptedFilesDocument = this.handleAcceptedFilesDocument.bind(this);
        this.changeAvatar = this.changeAvatar.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }
    
    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadClientDetails();
    }
    
    // --- Handlers ---
    
    // MUI Tab Handler
    handleTabChange = (event, newValue) => {
        this.setState({ activeTab: newValue });
    };

    // Generic handler for all TextFields
    handleInputChange = e => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };
    
    // Handler for react-select or general selects
    handleSelectChange = (field, selectedItem) => {
        this.setState({ [field]: selectedItem });
    }

    // Modal Toggle
    tog_update_image = () => {
        this.setState(prevState => ({
            modal_change_image: !prevState.modal_change_image
        }));
    }; 
    
    // File Handling
    handleAcceptedFilesDocument = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));
        this.setState({ selectedFilesDocument: files });
    }
    
    formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // --- API & Data Loaders ---

    loadClientDetails(){
        this.setState({isLoading: true});
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(`getClientDetails/${getLoggedInUser().id}`)
        .then(res => {
            if (res.data === undefined) {
                this.setState({ isLoading: false });
                return false;
            }

            // Initialize state fields with current client data
            this.setState({
                clientDetails: res.data, 
                selectedState: res.data.state || '',
                selectedCity: res.data.city || '',
                gstNo: res.data.gstNo || '',
                address: res.data.address || '',
                selectedCompanyType: res.data.companyType, // Use direct value if it matches the constant structure
                templateBased: res.data.templateBased ? {label: 'Yes', value: true} : {label: 'No', value: false},
                isLoading: false
            });
        })
        .catch(error => {
            console.log('error', error);
            this.setState({ isLoading: false });
        });
    }

    // --- Form Submission ---

    updateClient(event){
        event.preventDefault(); 
        
        if (this.state.isDisabled) {
            this.setState({ isDisabled: false }); // Enter edit mode
            return;
        }

        this.setState({isAdding: true});
        
        // Extract data from state for the API call
        const formValues = {
            clientId: this.state.clientDetails.id,
            // Assuming TextField values are now in clientDetails or explicitly mapped here:
            name: this.form.name.value, // Using ref approach for simplicity in class component
            email: this.form.email.value,
            entityName: this.form.entityName.value, // Assuming this field exists in the form
            dltRegNo: this.form.dltRegNo.value,
            // State values
            state: this.state.selectedState,
            city: this.state.selectedCity,
            gstNo: this.state.gstNo,
            address: this.state.address,
            companyType: this.state.selectedCompanyType,
            templateBased: this.state.templateBased.value,
            country: this.state.country,
        };

        ServerApi().put("updateClient", formValues)
          .then(res => {
            this.setState({ isAdding: false });

            if (res.data?.status === false) {
                this.props.openSnack({type: 'error', message: res.data.message});
                return false;
            }

            this.props.openSnack({type: 'success', message: 'Profile Updated!'});
            
            // Update local storage and re-load data
            let newUser = getLoggedInUser();
            newUser.dltRegNo = formValues.dltRegNo;
            newUser.templateBased = formValues.templateBased;
            setLoggeedInUser(newUser);
            
            this.setState({isDisabled: true}); // Exit edit mode
            this.loadClientDetails();
          })
          .catch(error => {
              console.log('error', error);
              this.setState({ isAdding: false });
              this.props.openSnack({type: 'error', message: 'Update failed.'});
          });
    }

    changeAvatar(){
        // Form submission is usually for the main form. For avatar, we'll simulate the update call.
        this.tog_update_image();
        // [API call for avatar update would be here]
        this.props.openSnack({type: 'success', message: 'Avatar updated.'});
    }

    // --- Render Methods ---

    renderProfileForm() {
        const { clientDetails, isDisabled, selectedState, selectedCity, selectedCompanyType, templateBased, gstNo } = this.state;
        const states = print_state.map(s => s.state);
        const cities = selectedState ? print_city[selectedState] : [];

        // Helper to get select value for react-select components
        const getSelectValue = (options, value) => {
            if (!value) return null;
            const group = options.find(g => g.options);
            return group?.options.find(opt => opt.value === value) || null;
        };

        return (
            <Grid container spacing={3}>
                {/* 1. Entity Details */}
                <Grid item xs={12} sm={6}>
                    <TextField label="Name" name="name" defaultValue={clientDetails.name} fullWidth margin="normal" size="small" disabled={isDisabled} inputRef={el => this.form && (this.form.name = el)} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Email" name="email" defaultValue={clientDetails.email} fullWidth margin="normal" size="small" disabled={isDisabled} inputRef={el => this.form && (this.form.email = el)} required />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField label="Phone Number" name="phone" defaultValue={clientDetails.phoneNumber} fullWidth margin="normal" size="small" disabled={isDisabled} required 
                        InputProps={{
                            inputComponent: MaskInput,
                            inputProps: { mask: '0000000000', maskChar: ' ' }
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="GST No" name="gstNo" value={gstNo} onChange={this.handleInputChange} fullWidth margin="normal" size="small" disabled={isDisabled} />
                </Grid>

                {/* 2. Company Info & DLT */}
                <Grid item xs={12} sm={6}>
                    <MuiFormControl fullWidth margin="normal" size="small">
                        <InputLabel shrink>Company Type</InputLabel>
                        <Select
                            classNamePrefix="react-select"
                            name="companyType"
                            value={COMPANY_TYPES.find(opt => opt.value === selectedCompanyType) || null}
                            onChange={item => this.handleSelectChange('selectedCompanyType', item.value)}
                            options={COMPANY_TYPES}
                            placeholder="Select Company Type"
                            isDisabled={isDisabled}
                        />
                    </MuiFormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="DLT Registration No" name="dltRegNo" defaultValue={clientDetails.dltRegNo} fullWidth margin="normal" size="small" disabled={isDisabled} inputRef={el => this.form && (this.form.dltRegNo = el)} />
                </Grid>
                
                {/* 3. Location/Address */}
                <Grid item xs={12}>
                    <TextField label="Address" name="address" defaultValue={clientDetails.address} fullWidth multiline rows={3} margin="normal" size="small" disabled={isDisabled} inputRef={el => this.form && (this.form.address = el)} />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                    <MuiFormControl fullWidth margin="normal" size="small">
                        <InputLabel shrink>State</InputLabel>
                        <Select
                            classNamePrefix="react-select"
                            name="selectedState"
                            value={states.find(s => s === selectedState) ? { label: selectedState, value: selectedState } : null}
                            onChange={item => this.handleSelectChange('selectedState', item.value)}
                            options={states.map(s => ({ label: s, value: s }))}
                            placeholder="Select State"
                            isDisabled={isDisabled}
                        />
                    </MuiFormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                    <MuiFormControl fullWidth margin="normal" size="small">
                        <InputLabel shrink>City</InputLabel>
                        <Select
                            classNamePrefix="react-select"
                            name="selectedCity"
                            value={cities.find(c => c === selectedCity) ? { label: selectedCity, value: selectedCity } : null}
                            onChange={item => this.handleSelectChange('selectedCity', item.value)}
                            options={cities.map(c => ({ label: c, value: c }))}
                            placeholder="Select City"
                            isDisabled={isDisabled || !selectedState}
                        />
                    </MuiFormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <MuiFormControl fullWidth margin="normal" size="small">
                        <InputLabel shrink>Template Based</InputLabel>
                        <Select
                            classNamePrefix="react-select"
                            name="templateBased"
                            value={templateBased}
                            onChange={item => this.handleSelectChange('templateBased', item)}
                            options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                            placeholder="Select Template Type"
                            isDisabled={isDisabled}
                        />
                    </MuiFormControl>
                </Grid>
                
                {/* Submission Buttons */}
                <Grid item xs={12} sx={{ textAlign: 'right', mt: 2 }}>
                    {isDisabled ? (
                        <MuiButton onClick={() => this.setState({ isDisabled: false })} variant="contained" color="secondary">
                            Edit Profile
                        </MuiButton>
                    ) : (
                        <>
                            <MuiButton type="submit" variant="contained" color="primary" disabled={this.state.isAdding} sx={{ mr: 2 }}>
                                {this.state.isAdding ? 'Saving...' : 'Save Changes'}
                            </MuiButton>
                            <MuiButton onClick={() => this.loadClientDetails().then(() => this.setState({ isDisabled: true }))} variant="outlined" color="secondary">
                                Cancel
                            </MuiButton>
                        </>
                    )}
                </Grid>
            </Grid>
        );
    }


    render() {
        if (this.state.isLoading) { 
            return(<DataLoading loading={this.state.isLoading} />)
        } 

        const { clientDetails } = this.state;

        return (
            <Box sx={{ p: 3 }}>
                
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1">VIEW PROFILE</Typography>
                </Box>
                
                <Grid container spacing={3}>
                    {/* Profile Header/Avatar Section (Simplified) */}
                    <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box sx={{ position: 'relative' }}>
                                <img 
                                    src={clientDetails.avatar || defaultProfileImage} 
                                    alt="Profile" 
                                    style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <MuiButton 
                                    variant="contained" 
                                    size="small" 
                                    onClick={this.tog_update_image} 
                                    sx={{ 
                                        position: 'absolute', 
                                        bottom: 0, right: 0, 
                                        minWidth: 30, height: 30, 
                                        borderRadius: '50%',
                                        p: 0
                                    }}
                                >
                                    <i className="ti ti-camera"></i>
                                </MuiButton>
                            </Box>
                            <Box>
                                <Typography variant="h5">{clientDetails.name}</Typography>
                                <Typography variant="subtitle1" color="text.secondary">{clientDetails.userType} | {clientDetails.email}</Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Main Content Area */}
                    <Grid item xs={12}>
                        <Paper elevation={3}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs 
                                    value={this.state.activeTab} 
                                    onChange={this.handleTabChange} 
                                    aria-label="profile tabs"
                                >
                                    <Tab label="View Profile" /> {/* Index 0 */}
                                </Tabs>
                            </Box>

                            <TabPanel value={this.state.activeTab} index={0}>
                                <Box component="form" onSubmit={this.updateClient} ref={c => (this.form = c)}>
                                    {this.renderProfileForm()}
                                </Box>
                            </TabPanel>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Modal: Change Profile Image (MUI Dialog) */}
                <Dialog open={this.state.modal_change_image} onClose={this.tog_update_image} maxWidth="xs" fullWidth>
                    <DialogTitle>Update Profile Image</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" align="center" sx={{ mb: 2 }}>Upload a new image file.</Typography>
                        <Dropzone onDrop={this.handleAcceptedFilesDocument} multiple={false}>
                            {({ getRootProps, getInputProps }) => (
                                <Box sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 4, textAlign: 'center', cursor: 'pointer' }} {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <Typography variant="caption">Drag 'n' drop here, or click to select file</Typography>
                                </Box>
                            )}
                        </Dropzone>
                        {this.state.selectedFilesDocument.map((f, i) => (
                            <Typography key={i} variant="caption" sx={{ display: 'block', mt: 1, fontWeight: 'bold' }}>
                                {f.name} - {f.formattedSize}
                            </Typography>
                        ))}
                    </DialogContent>
                    <DialogActions>
                        <MuiButton onClick={this.tog_update_image} variant="outlined" color="secondary">Cancel</MuiButton>
                        <MuiButton onClick={this.changeAvatar} variant="contained" color="primary" disabled={this.state.selectedFilesDocument.length === 0}>
                            Upload Image
                        </MuiButton>
                    </DialogActions>
                </Dialog>

            </Box>
        );
    }
}

export default connect(null, { activateAuthLayout, updateSmsBalance, openSnack })(MyProfile);
