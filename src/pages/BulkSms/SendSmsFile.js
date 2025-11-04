import React, { Component } from 'react';
import { activateAuthLayout, openSnack, updateSmsBalance, getSmsBalance } from '../../store/actions';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select'; // RETAINED: For complex select inputs
import Dropzone from 'react-dropzone';
import {ServerApi} from '../../utils/ServerApi';

// --- Imported Custom Components (Retained) ---
import Message from '../../components/LanguageTransliterate/Message'
import MyTemplates from '../../components/MyTemplates';
import TemplateMessageBox from '../../components/LanguageTransliterate/TemplateMessageBox';
import Uploading from '../../components/Loading/Uploading';
import SmsSending from '../../components/Loading/SmsSending';
import {getLoggedInUser} from '../../helpers/authUtils';
// ---

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
    Table as MuiTable, // Replaced reactstrap Table
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

class SendSmsFile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Form & Input States
            selectedGroup: null, 
            selectedMulti: null,
            cSelected: [],
            sheduleRequired: 'No',
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
            selectedSenderId: null, // Selected senderId object (react-select value)
            smsGateway: null,
            
            // UI/Control States
            isDrafting: false,
            // The following state properties (modal/alert controls) are now handled imperatively by MySwal calls:
            // success_msg, fileDetailModal, uploadingModal, modal_type

            default_date: new Date(), default: false, start_date: new Date(), monthDate: new Date(), yearDate: new Date(), end_date: new Date(), date: new Date(),
            
            // Data States (mock options for selects)
            smsGateways: [],
            senderIds: []
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
        this.handleUploadFile = this.handleUploadFile.bind(this); // Ensure upload handler is bound
    }
    
    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadSenderIds();
        this.loadSavedMessages();
        this.loadRoutes();
        this.props.getSmsBalance(); // Load balance on mount
    }

    //Select Handlers
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

        // Call the fetchFileDetails method, which now handles its own modals
        this.fetchFileDetails(files);
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

    fetchFileDetails(files){
        // 1. Show Loading Modal
        MySwal.fire({
            html: <Uploading />,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false
        });

        var formdata = new FormData();
        // Use the files argument directly, as setState is async
        formdata.append("numbers", files[0]); 

        ServerApi().post('sms/checkFileContents', formdata)
          .then(res => {
            MySwal.close(); // Close loading modal

            if (res.data.status !== undefined && res.data.status === true) {
                
                // 2. Show Success Modal (re-creating the old one)
                MySwal.fire({
                    title: 'Numbers Uploaded',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    // Pass JSX to the 'html' property
                    html: (
                        <MuiTable size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Duplicate</TableCell>
                                    <TableCell>Invalid</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>{(res.data.response.Total === "0")?"N/A":res.data.response.Total}</TableCell>
                                    <TableCell>{(res.data.response.Dupilcate === "0")?"N/A":res.data.response.Dupilcate}</TableCell>
                                    <TableCell>{(res.data.response.Invalid === "0")?"N/A":res.data.response.Invalid}</TableCell>
                                </TableRow>
                            </TableBody>
                        </MuiTable>
                    )
                });
                // We still save the response to state if needed elsewhere
                this.setState({ fileContentResponse: res.data.response });

            }else{
                
                // 3. Show Error Modal
                MySwal.fire({
                    title: 'Invalid file.',
                    text: res.data.response || 'Please check the file format and try again.',
                    icon: 'error'
                });
                this.setState({ selectedUploadFile: [], isAdding: false });
            }
          })
          .catch(error => {
              MySwal.close(); // Close loading modal
              console.log('error', error);
              MySwal.fire({ title: 'Upload Failed', text: 'An error occurred during file processing.', icon: 'error' });
              this.setState({ selectedUploadFile: [] }); // Clear files on error
          });
    }


    sendSms(event, values){
        event.preventDefault(); // Added prevention for HTML form submit

        if(this.state.selectedSenderId === null || this.state.selectedUploadFile.length === 0){
            this.props.openSnack({type: 'error', message: 'Please select a Sender ID and upload a file.'})
            return false;
        }
        if (this.state.messageText.trim() === "") {
            this.props.openSnack({type: 'error', message: 'Please enter a message.'})
            return false;
        }
        // Simplified admin check
        if(getLoggedInUser().userType === 'ADMIN' || getLoggedInUser().userType === 'SUPER_ADMIN'){
            if(this.state.smsGateway === null){
                this.props.openSnack({type: 'error', message: 'Please select an SMS Gateway.'})
                return false;
            }
        }
        
        // Balance check (Mocked since balance state is not fully visible)
        if(this.props.sms_balance <= 0 && getLoggedInUser().userType !== 'ADMIN' && getLoggedInUser().userType !== 'SUPER_ADMIN'){
             MySwal.fire({ html: <NoBalance />, showConfirmButton: false });
             return false;
        }

        this.setState({isSending: true});

        // Show Loading SweetAlert
        MySwal.fire({
            html: <SmsSending />,
            title: 'Sending SMS...',
            showConfirmButton: false,
            allowOutsideClick: false
        });

        // The raw object is recreated here since it was missing in the original snippet.
        var raw = {
            smsGateway: this.state.smsGateway,
            senderId: this.state.selectedSenderId.value,
            message: this.state.messageText,
            scheduleRequired: this.state.sheduleRequired === 'Yes' ? 'true' : 'false',
            scheduleTime: this.state.sheduleRequired === 'Yes' ? this.state.default_date.toISOString() : undefined,
            fileId: this.state.fileContentResponse.id, // Assuming response from file check includes an ID
            // Defaulted values from the original context:
            delimiter: ",",
            removeDuplicate: "true",
            messageType: this.props.sms_type || 'Plain', // Use sms_type from Redux or default
            countryCode: '+91',
        };

        var formdata = new FormData();
        formdata.append("requestType", "BULKSMS");
        formdata.append("request", JSON.stringify(raw));
        formdata.append("numbers", this.state.selectedUploadFile[0]);

        ServerApi().post('sms/bulkSmsRequest', formdata)
          .then(res => {
            MySwal.close(); // Close the loading modal
            this.setState({
                selectedSenderId: null,
                combinedMessage: '',
                selectedUploadFile: [], // Clear file
                messageText: '', // Clear message
            });

            setTimeout(()=>{
                this.setState({isSending: false});
                this.props.openSnack({type: 'success', message: 'SMS sent.'})
            }, 2300); 

            // Assuming `this.form` is set up via a ref if validation/resetting is needed
            // this.form && this.form.reset(); 
            this.loadBalance();
          })
          .catch(error => {
              MySwal.close(); // Close loading modal on error
              this.props.openSnack({type: 'error', message: 'Unable to send SMS'});
              this.setState({isSending: false});
              console.error('API Error:', error);
          });
    }

    loadBalance(){
        if(getLoggedInUser().userType === 'SUPER_ADMIN'){return false;}
        ServerApi().get(`client/getBalance/${getLoggedInUser().id}`)
          .then(res => {
            if (res.data === undefined) { return false; } 
            this.props.updateSmsBalance(Math.round((parseFloat(res.data.response) + Number.EPSILON) * 1000000) / 1000000);
          })
          .catch(error => console.log('error', error));
    }

    loadSavedMessages() {
        ServerApi().get('sms/getAllSmsTemplates')
          .then(res => {
            if (res.data === undefined) { return false; } 
            this.setState({savedMessages: res.data})
          })
          .catch(error => console.log('error', error));
    }
    
    loadTemplates(){
        ServerApi().get(`sms/getAllSmsTemplates`)
          .then(res => {
            if (res.data === undefined) { return false; } 
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
        if(this.state.messageText === ''){ return false; }

        this.setState({isDrafting: true});

        // Show Loading SweetAlert
        MySwal.fire({
            html: <SmsSending />,
            title: 'Saving Draft...',
            showConfirmButton: false,
            allowOutsideClick: false
        });
        
        let raw = JSON.stringify({
            templateName: this.state.messageText.replace(/ /g, '_').substring(0, 50), // Basic cleanup and limit
            message: this.state.messageText
        });

        ServerApi().post('sms/saveSmsTemplate', raw)
          .then(res => {
            if (res.data === undefined) {
                MySwal.close(); 
                this.setState({isDrafting: false});
                return false;
            } 
            
            MySwal.fire({
                title: 'Success!',
                text: 'Message saved as draft',
                icon: 'success'
            }).then(() => {
                // Replicate original onConfirm logic (reload)
                setTimeout(()=>{
                    window.location.reload()
                },750);
            });
            this.setState({isDrafting: false});
          })
          .catch(error => {
              MySwal.close(); 
              console.log('error', error);
              this.setState({isDrafting: false});
          });
    }
    

    render() {
        const { selectedSenderId, selectedUploadFile, templates, templateBased } = this.state;

        return (
            <Box sx={{ p: 3 }}> {/* MUI Box replaces Container fluid */}
                
                <Box sx={{ mb: 4 }}> {/* Page Title */}
                    <Grid container alignItems="center">
                        <Grid item xs={12}>
                            <Typography variant="h4" component="h1">SEND SMS FROM FILE</Typography>
                        </Grid>
                    </Grid>
                </Box>

                <Grid container spacing={3}>
                    {/* LEFT COLUMN: File Upload and Form (lg="6") */}
                    <Grid item lg={6} xs={12}>
                        <Paper elevation={3} sx={{ p: 3 }}> {/* MUI Paper replaces Card/CardBody */}
                            
                            <Box component="form" onSubmit={this.sendSms} ref={c => (this.form = c)}>
                                
                                {/* 1. Dropzone */}
                                <Box sx={{ mb: 3 }}>
                                    <Dropzone onDrop={this.handleUploadFile}>
                                        {({ getRootProps, getInputProps }) => (
                                            <Box className="dropzone" sx={{ border: '2px dashed #ccc', borderRadius: 1, p: 4, textAlign: 'center', cursor: 'pointer' }}>
                                                <Box className="dz-message needsclick" {...getRootProps()}>
                                                    <input {...getInputProps()} />
                                                    <Typography variant="subtitle1">Upload File *</Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    </Dropzone>
                                </Box>

                                {/* File Previews */}
                                <Box className="dropzone-previews" sx={{ mt: 2 }}>
                                    {selectedUploadFile.map((f, i) => (
                                        <Paper key={i} elevation={1} sx={{ mt: 1, p: 1 }}>
                                            <Grid container alignItems="center" spacing={1}>
                                                <Grid item>
                                                    <Box sx={{ width: 40, height: 40, bgcolor: 'primary.main', borderRadius: 1 }} /> 
                                                </Grid>
                                                <Grid item xs>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{f.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{f.formattedSize}</Typography>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    ))}
                                </Box>
                                
                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                    
                                    {/* 2. SMS Gateway Select (Conditional for Admins) */}
                                    {(getLoggedInUser().userType === 'ADMIN' || getLoggedInUser().userType === 'SUPER_ADMIN') && 
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth margin="normal" size="small">
                                                <InputLabel shrink>SMS Gateway</InputLabel>
                                                <Select
                                                    classNamePrefix="react-select"
                                                    name="smsGateway"
                                                    onChange={this.handleSelectGroupSmsGateway}
                                                    options={this.state.smsGateways}
                                                    placeholder="Select SMS Gateway"
                                                    required
                                                />
                                            </FormControl>
                                        </Grid>
                                    }
                                    
                                    {/* 3. Sender ID Select */}
                                    <Grid item xs={12} sm={getLoggedInUser().userType === 'USER' ? 12 : 6}>
                                        <FormControl fullWidth margin="normal" size="small">
                                            <InputLabel shrink>SENDER ID</InputLabel>
                                            <Select
                                                classNamePrefix="react-select"
                                                name="senderId"
                                                value={selectedSenderId}
                                                onChange={this.handleSelectSenderId}
                                                options={this.state.senderIds}
                                                placeholder="Select Sender ID"
                                                required
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                {/* 4. Message/Template Input */}
                                <Box sx={{ mt: 2 }}>
                                    {/* Template Message Box for Template-Based */}
                                    {templateBased && selectedSenderId && (selectedSenderId.value) && (
                                        <TemplateMessageBox 
                                            messageText={this.state.messageText} 
                                            messageHandler={this.updateMessageHandler} 
                                            savedMessageHandler={this.savedMessageHandler}
                                            selectedTemplateId={this.state.selectedTemplateId} 
                                            templates={this.state.templates} 
                                            setTemplateId={(id) => this.setState({selectedTemplateId: id})}
                                        />
                                    )}
                                    
                                    {/* Regular Message Box for Non-Template or if template is not picked */}
                                    {(!templateBased || !selectedSenderId || !selectedSenderId.value) && (
                                        <Message 
                                            messageText={this.state.messageText} 
                                            messageHandler={this.updateMessageHandler} 
                                            savedMessageHandler={this.savedMessageHandler}
                                        />
                                    )}
                                </Box>

                                {/* 5. Schedule Radio/DatePicker */}
                                <Box sx={{ mt: 2 }}>
                                    <FormControl component="fieldset">
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

                                    {this.state.sheduleRequired === 'Yes' && 
                                        <FormControl fullWidth margin="normal" size="small">
                                            <DatePicker
                                                className="MuiInputBase-input MuiOutlinedInput-input"
                                                selected={this.state.default_date}
                                                onChange={this.handleDefault}
                                                showTimeSelect
                                                dateFormat="Pp"
                                                customInput={<TextField fullWidth size="small" label="Schedule Time" />}
                                            />
                                        </FormControl>
                                    }
                                </Box>

                                {/* 6. Action Buttons */}
                                <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                    <MuiButton size="small" type="button" variant="outlined" color="secondary" onClick={this.saveDraft} disabled={this.state.isDrafting}>
                                        <i className="fa fa-save mr-2"></i> {(this.state.isDrafting) ? 'Saving...' : 'Save Draft'}
                                    </MuiButton>
                                    <MuiButton size="small" type="submit" variant="contained" color="primary" disabled={this.state.isSending}>
                                        <i className="fa fa-paper-plane mr-2"></i> {(this.state.isSending) ? 'Please Wait...' : 'Send'}
                                    </MuiButton>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: Saved Templates/Messages (Conditional lg="6") */}
                    {selectedSenderId && templateBased && templates.length > 0 &&
                        <Grid item lg={6} xs={12}>
                            <MyTemplates templates={templates} pickedTemplate={this.pickedTemplate} />
                        </Grid>
                    }
                    
                    {/* Placeholder for Saved Messages (for non-template flow or draft saving) */}
                    {this.state.showSavedMessage && this.state.savedMessages && this.state.savedMessages.length > 0 &&
                        <Grid item lg={6} xs={12}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Saved Drafts</Typography>
                            {this.state.savedMessages.slice(0, 3).map((draft, index) => (
                                <MuiAlert key={index} severity="info" sx={{ mb: 1 }}>
                                    <Box sx={{ width: '100%' }}>
                                        <Typography variant="body2">{draft.message}</Typography>
                                        <Box sx={{ mt: 1, textAlign: 'right' }}>
                                            <Link href="#" onClick={(e) => { e.preventDefault(); this.setState({ messageText: draft.message, showSavedMessage: false }); }} style={{ color: 'inherit', marginRight: 8 }}>
                                                <i className="fa fa-check" style={{ color: 'green' }}></i> Use
                                            </Link> 
                                            {/* Delete draft functionality would go here */}
                                        </Box>
                                    </Box>
                                </MuiAlert>
                            ))}
                        </Grid>
                    }
                </Grid>
            </Box>
        );
    }
}


const mapStatetoProps = state => {
    const {sms_balance} = state.User;
    const {sms_type} = state.Sms;
    return { sms_balance, sms_type };
  }
  
export default connect(mapStatetoProps, { activateAuthLayout, openSnack, updateSmsBalance, getSmsBalance })(SendSmsFile);
