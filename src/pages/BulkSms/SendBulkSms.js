import React, { Component } from 'react';
import { activateAuthLayout } from '../../store/actions';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select'; // RETAINED: For complex select inputs
import Dropzone from 'react-dropzone';
import {ServerApi} from '../../utils/ServerApi';

// --- MUI Imports ---
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    TextField, 
    Button as MuiButton, // Renamed to avoid clashes
    InputLabel, 
    FormControl,
    RadioGroup,
    Radio,
    FormControlLabel,
    Alert as MuiAlert,
    Table as MuiTable,
    TableHead,
    TableBody,
    TableRow,
    TableCell
} from '@mui/material';
// --- END MUI Imports ---

import Swal from 'sweetalert2'; 
import withReactContent from 'sweetalert2-react-content'; 

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

class SendBulkSms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Form & Input States
            senderId: null, // Selected senderId object (react-select value)
            smsGateway: null,
            mobileColumn: null,
            messageType: null,
            selectTemplate: null,
            recipients: '', 
            removeDuplicate: false,
            messageText: '', // Message content
            sheduleRequired: 'No', // Radio Group value
            
            // UI/Control States
            remaningMessageCharacters: 160,
            totalMobileNumbers: 0,
            showSavedMessage: false,
            alert1: true,
            alert2: true,
            isSending: false,
            renderForm: false,
            selectedFile: [],
            default_date: new Date(), default: false, start_date: new Date(), monthDate: new Date(), yearDate: new Date(), end_date: new Date(), date: new Date(),
            
            // Data States
            senderIds: [
                {
                    label: "Select Sender Id",
                    options: [{ label: "Nothing Selected", value: "" }]
                }
            ],
            smsGateways: [
                {
                    label: "SMS Gateways",
                    options: [{ label: "None", value: "None" }]
                }
            ],
            mobileColumns: [ // Renamed array from mobileColumn to avoid conflict
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
        this.handleSmsSubmit = this.handleSmsSubmit.bind(this); // New submit handler
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadSenderIds();
        this.loadRoutes();
    }

    //Select Handlers
    handleSelectGroup = (senderId) => {
        this.setState({ senderId });
    }
    handleSelectGroupSmsGAteway  = (selectedItem) => {
        this.setState({ smsGateway: selectedItem.value });
    }
    handleSelectMobileColumn  = (selectedItem) => {
        this.setState({ mobileColumn: selectedItem.value });
    }
    handleSelectMessageType = (selectedItem) => {
        this.setState({ messageType: selectedItem.value });
    }
    handleSelectTemplate = (selectedItem) => {
        this.setState({ selectTemplate: selectedItem.value });
    }

    handleDefault(date) {
        this.setState({ default_date: date });
    }

    handleChange = e => {
        const { name, value, checked, type } = e.target;
        this.setState({
          [name]: type === 'checkbox' ? checked : value
        });
    };

    handleAcceptedFiles = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        this.setState({ renderForm: true, selectedFile: files });
    }
        
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

    // Form submission handler
    handleSmsSubmit(event) {
        event.preventDefault();
        
        // Simple client-side validation check
        if (!this.state.smsGateway || !this.state.senderId || !this.state.mobileColumn || !this.state.messageText) {
            MySwal.fire({
                title: 'Validation Error',
                text: 'Please fill in all required fields (Gateway, Sender ID, Mobile Column, Message).',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Pass an object to sendSms containing necessary values from state
        this.sendSms(event, {
            recipients: this.state.recipients,
            message: this.state.messageText
        });
    }

    loadSenderIds(){
        ServerApi().get('getActiveSenderIds')
          .then(res => {
            if (res.data === undefined) { return false; } 

            var arr = res.data.map(obj => ({
                label: obj.senderId,
                value: obj.senderId, // Assuming value is senderId string
            }))

            this.setState({senderIds: arr})
          })
          .catch(error => console.log('error', error));
    }

    loadRoutes(){
        ServerApi().get('routes/fetch-active-routes')
          .then(res => {
            if (res.data === undefined) { return false; } 

            var arr = res.data.response.map(obj => ({
                label: obj.systemId,
                value: obj.routeName,
            }))

            this.setState({smsGateways: arr})
          })
          .catch(error => console.log('error', error));
    }

    sendSms(event, values){
        this.setState({isSending: true});

        var raw = JSON.stringify({
            requestType: "BULKSMS", // Changed to BULKSMS as implied by context
            payload:{
                smsGateway: this.state.smsGateway,
                senderId:this.state.senderId.value,
                mobileColumn: this.state.mobileColumn, // Use mobile column from state
                messageType : this.state.messageType || 'Plain',
                countryCode:"+91",
                globalStatus:"true",
                recipients : values.recipients, // Recipients from the file process or text area
                delimiter : ",",
                removeDuplicate : this.state.removeDuplicate ? "true" : "false", // Use state
                message : values.message, // Message from text area
                scheduleRequired: this.state.sheduleRequired === 'Yes' ? 'true' : 'false',
                scheduleTime: this.state.sheduleRequired === 'Yes' ? this.state.default_date.toISOString() : undefined,
            }
        });

        ServerApi().post('sms/sendBulkSms', raw) // Changed to bulk SMS endpoint
          .then(res => {
            this.setState({ isSending: false, messageText: '', recipients: '' });
            MySwal.fire({
                title: 'Success!',
                text: res.data.response || 'Bulk SMS campaign initiated successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
          })
          .catch(error => {
              console.error('SMS send error:', error);
              this.setState({ isSending: false });
              MySwal.fire({
                title: 'Error!',
                text: 'Something went wrong while sending the SMS. Check the console for details.',
                icon: 'error',
                confirmButtonText: 'OK'
              });
          });
    }

    renderForm(){
        return(
            <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12}>
                <MuiTable size="small" sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>A</TableCell>
                            <TableCell>B</TableCell>
                            <TableCell>C</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow><TableCell>Mark</TableCell><TableCell>426246</TableCell><TableCell>Otto</TableCell></TableRow>
                        <TableRow><TableCell>Jacob</TableCell><TableCell>24362346</TableCell><TableCell>Thornton</TableCell></TableRow>
                        <TableRow><TableCell>Larry</TableCell><TableCell>23463246</TableCell><TableCell>the Bird</TableCell></TableRow>
                    </TableBody>
                </MuiTable>
            </Grid>

            <Grid item xs={12}>
            <Box component="form" onSubmit={this.handleSmsSubmit} sx={{ mt: 2 }}>
                
                {/* SMS Gateway Select */}
                <FormControl fullWidth margin="normal">
                    <InputLabel shrink>SMS Gateway</InputLabel>
                    <Select
                        classNamePrefix="react-select"
                        name="smsGateway"
                        onChange={this.handleSelectGroupSmsGAteway}
                        options={this.state.smsGateways}
                        placeholder="Select SMS Gateway"
                        required
                    />
                </FormControl>

                {/* SENDER ID Select */}
                <FormControl fullWidth margin="normal">
                    <InputLabel shrink>SENDER ID</InputLabel>
                    <Select
                        classNamePrefix="react-select"
                        name="senderId"
                        value={this.state.senderId}
                        onChange={this.handleSelectGroup}
                        options={this.state.senderIds}
                        placeholder="Select Sender ID"
                        required
                    />
                </FormControl>

                {/* Mobile Column Select */}
                <FormControl fullWidth margin="normal">
                    <InputLabel shrink>Mobile Column</InputLabel>
                    <Select
                        classNamePrefix="react-select"
                        name="mobileColumn"
                        onChange={this.handleSelectMobileColumn}
                        options={this.state.mobileColumns}
                        placeholder="Select Mobile Column"
                        required
                    />
                </FormControl>
                
                {/* Message Type Select (Mocked options for now) */}
                <FormControl fullWidth margin="normal">
                    <InputLabel shrink>Message Type</InputLabel>
                    <Select
                        classNamePrefix="react-select"
                        name="messageType"
                        onChange={this.handleSelectMessageType}
                        options={[{label: 'Plain', value: 'Plain'}, {label: 'Unicode', value: 'Unicode'}]}
                        placeholder="Select Message Type"
                        required
                    />
                </FormControl>

                {/* Template Select (Mocked options for now) */}
                <FormControl fullWidth margin="normal">
                    <InputLabel shrink>Select Template</InputLabel>
                    <Select
                        classNamePrefix="react-select"
                        name="selectTemplate"
                        onChange={this.handleSelectTemplate}
                        options={[{label: 'Welcome', value: 'Welcome'}, {label: 'Promo', value: 'Promo'}]}
                        placeholder="Select Template (Optional)"
                    />
                </FormControl>
                
                {/* Recipients Textarea (Commented out in original but keeping the input for manual entry fallback) */}
                {/* <TextField 
                    name="recipients" 
                    label="RECIPIENTS (Separated by comma)"
                    multiline rows={3} 
                    fullWidth margin="normal"
                    value={this.state.recipients}
                    onChange={(e) => this.setState({recipients: e.target.value, totalMobileNumbers: e.target.value.split(",").length})}
                    onFocus={ () => this.setState({showSavedMessage: false}) }
                />
                <Grid container alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                        <Typography variant="caption">No of mobile numbers: {this.state.totalMobileNumbers}</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                         <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.removeDuplicate}
                                    onChange={this.handleChange}
                                    name="removeDuplicate"
                                    color="primary"
                                />
                            }
                            label={<Typography variant="caption">REMOVE DUPLICATE</Typography>}
                        />
                    </Grid>
                </Grid> */}


                {/* Message Textarea */}
                <FormControl fullWidth margin="normal">
                    <TextField 
                        name="messageText" 
                        label="MESSAGE"
                        multiline rows={4} 
                        fullWidth 
                        value={this.state.messageText}
                        onChange={ (e) => this.setState({messageText: e.target.value, remaningMessageCharacters: 160 - e.target.value.length}) } 
                        onFocus={ () => this.setState({showSavedMessage: true}) } 
                        required
                    />

                    <Grid container sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Typography variant="caption" sx={{ ml: 1 }}>
                                {this.state.remaningMessageCharacters} CHARACTERS REMAINING 
                                <Typography component="span" color="success.main" sx={{ ml: 1, fontWeight: 'bold' }}>
                                    1 Message (s) {/* Simplify message count for now */}
                                </Typography>
                            </Typography>
                        </Grid>
                    </Grid>
                </FormControl>

                {/* Schedule Required Radio Group */}
                <FormControl component="fieldset" sx={{ mt: 2, mb: 2 }}>
                    <RadioGroup 
                        row 
                        name="sheduleRequired" 
                        value={this.state.sheduleRequired} 
                        onChange={this.handleChange}
                    >
                        <InputLabel sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>Schedule Required: </InputLabel>
                        <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                        <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                    </RadioGroup>
                </FormControl>

                {/* Date Picker (Conditional) */}
                {this.state.sheduleRequired === 'Yes' && 
                    <FormControl fullWidth margin="normal">
                        <DatePicker
                            className="MuiInputBase-input MuiOutlinedInput-input" // Attempt to match MUI styling
                            selected={this.state.default_date}
                            onChange={this.handleDefault}
                            showTimeSelect
                            dateFormat="Pp"
                        />
                    </FormControl>
                }

                {/* Action Buttons */}
                <Box sx={{ mt: 3, mb: 0, display: 'flex', gap: 1 }}>
                    <MuiButton size="small" type="submit" variant="contained" color="primary" disabled={this.state.isSending}>
                        <i className="fa fa-paper-plane mr-2"></i> {(this.state.isSending)?'Please Wait...':'Send'}
                    </MuiButton>
                    <MuiButton size="small" type="button" variant="outlined" color="secondary">
                        <i className="fa fa-save mr-2"></i> Save Draft
                    </MuiButton>
                </Box>
            </Box>
            </Grid>
            </Grid>
        )
    }

    render() {
        // Renaming local variables for clarity
        const selectedFile = this.state.selectedFile;

        return (
            <Box sx={{ p: 3 }}> {/* MUI Box replaces Container fluid */}
                
                {/* Page Title */}
                <Box sx={{ mb: 4 }}>
                    <Grid container alignItems="center">
                        <Grid item xs={12}>
                            <Typography variant="h4" component="h1">SEND CUSTOM SMS</Typography>
                        </Grid>
                    </Grid>
                </Box>

                <Grid container spacing={3}>
                    {/* LEFT COLUMN: File Upload and Form (lg="6") */}
                    <Grid item lg={6} xs={12}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%' }}> {/* MUI Paper replaces Card/CardBody */}

                            <Grid container spacing={2}>
                                {/* Dropzone */}
                                <Grid item xs={12}>
                                    <Dropzone onDrop={acceptedFiles => this.handleAcceptedFiles(acceptedFiles)}>
                                        {({ getRootProps, getInputProps }) => (
                                            <Box className="dropzone" sx={{ border: '2px dashed #ccc', borderRadius: 1, p: 4, textAlign: 'center', cursor: 'pointer' }}>
                                                <Box className="dz-message needsclick" {...getRootProps()}>
                                                    <input {...getInputProps()} />
                                                    <Typography variant="subtitle1">Upload File *</Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    </Dropzone>
                                    
                                    {/* File Previews */}
                                    <Box className="dropzone-previews" sx={{ mt: 2 }}>
                                        {selectedFile.map((f, i) => (
                                            <Paper key={i} elevation={1} sx={{ mt: 1, p: 1 }}>
                                                <Grid container alignItems="center" spacing={1}>
                                                    <Grid item>
                                                        {/* Using a placeholder for image/file preview */}
                                                        <Box sx={{ width: 40, height: 40, bgcolor: 'grey.300', borderRadius: 1 }} /> 
                                                    </Grid>
                                                    <Grid item xs>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{f.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{f.formattedSize}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Grid>
                            </Grid>
                            
                            {/* Render Form if file is selected */}
                            {this.state.renderForm && this.renderForm()}

                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: Saved Messages (Conditional lg="6") */}
                    {this.state.showSavedMessage &&
                        <Grid item lg={6} xs={12}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Saved Messages</Typography>
                            
                            {/* Saved Message Alert 1 (MUI Alert replaces reactstrap Alert) */}
                            <MuiAlert 
                                severity="success" 
                                onClose={() => this.setState({ alert1: false })} 
                                sx={{ mb: 2, display: this.state.alert1 ? 'flex' : 'none' }}
                            >
                                <Box sx={{ width: '100%' }}>
                                    <Typography variant="body2">Whenever to Bulk SMS.</Typography>
                                    <Box sx={{ mt: 1, textAlign: 'right' }}>
                                        <Link href="#" onClick={(e) => { e.preventDefault(); this.setState({ messageText: 'Whenever to Bulk SMS' }); }} style={{ color: 'inherit', marginRight: 8 }}>
                                            <i className="ti ti-check success mr-2" style={{ color: 'green' }}></i>
                                        </Link> 
                                        <Link href="#" onClick={(e) => { e.preventDefault(); this.setState({ alert1: false }); }} style={{ color: 'inherit' }}>
                                            <i className="ti ti-close danger" style={{ color: 'red' }}></i>
                                        </Link>
                                    </Box>
                                </Box>
                            </MuiAlert>
                            
                            {/* Saved Message Alert 2 (MUI Alert replaces reactstrap Alert) */}
                            <MuiAlert 
                                severity="success" 
                                onClose={() => this.setState({ alert2: false })} 
                                sx={{ display: this.state.alert2 ? 'flex' : 'none' }}
                            >
                                <Box sx={{ width: '100%' }}>
                                    <Typography variant="body2">Another sample message draft.</Typography>
                                    <Box sx={{ mt: 1, textAlign: 'right' }}>
                                        <Link href="#" onClick={(e) => { e.preventDefault(); this.setState({ messageText: 'Another sample message draft.' }); }} style={{ color: 'inherit', marginRight: 8 }}>
                                            <i className="ti ti-check success mr-2" style={{ color: 'green' }}></i>
                                        </Link> 
                                        <Link href="#" onClick={(e) => { e.preventDefault(); this.setState({ alert2: false }); }} style={{ color: 'inherit' }}>
                                            <i className="ti ti-close danger" style={{ color: 'red' }}></i>
                                        </Link>
                                    </Box>
                                </Box>
                            </MuiAlert>
                        </Grid>
                    }
                </Grid>
            </Box>
        );
    }
}

export default connect(null, { activateAuthLayout })(SendBulkSms);
