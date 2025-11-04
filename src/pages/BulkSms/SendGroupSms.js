import React, { Component } from 'react';
// REMOVED: reactstrap imports
import { activateAuthLayout, updateSmsBalance, getSmsBalance, openSnack } from '../../store/actions';
import Select from 'react-select';
// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ServerApi } from '../../utils/ServerApi';
import Message from '../../components/LanguageTransliterate/Message';
// REMOVED: import {Radio} from 'antd'
import { getLoggedInUser } from '../../helpers/authUtils';
import ContactsLoading from '../../components/Loading/ContactsLoading';
import SmsSent from '../../components/Loading/SmsSent';
import NoBalance from '../../components/Loading/NoBalance';
import MyTemplates from '../../components/MyTemplates';
import TemplateMessageBox from '../../components/LanguageTransliterate/TemplateMessageBox';
import SmsSending from '../../components/Loading/SmsSending';

// --- MUI & Core Imports ---
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    TextField, 
    Button as MuiButton, // Renamed to avoid conflict with reactstrap
    RadioGroup, 
    FormControlLabel, 
    Radio,
    InputLabel // Used instead of reactstrap Label
} from '@mui/material';
// --- END MUI Imports ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

class SendGroupSms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedSenderId: null,
            selectedGroup: null,
            senderId: null,
            smsGateway: null,
            isSending: false,
            cSelected: [],
            savedMessages: [],
            message: '',

            groupLoading: false,
            remaningMessageCharacters: 160,
            totalMobileNumbers: 0,
            sheduleRequired: 'No',
            showSavedMessage: false,
            recipientList: "",
            messageText: '',
            defaultLanguage: "en",
            translationLanguage: "en",
            templateBased: false,
            selectedTemplateId: '',
            combinedMessage: '',
            templates: [],
            default_date: new Date(),
        };
        // Bindings
        this.handleDefault = this.handleDefault.bind(this);
        this.loadRoutes = this.loadRoutes.bind(this);
        this.loadGroups = this.loadGroups.bind(this);
        this.loadSenderIds = this.loadSenderIds.bind(this);
        this.handleSelectGroupSmsGateway = this.handleSelectGroupSmsGateway.bind(this);
        this.handleSelectGroup = this.handleSelectGroup.bind(this);
        this.handleSelectSenderId = this.handleSelectSenderId.bind(this);
        this.loadSavedMessages = this.loadSavedMessages.bind(this);
        this.loadContacts = this.loadContacts.bind(this);
        this.updateMessageHandler = this.updateMessageHandler.bind(this);
        this.savedMessageHandler = this.savedMessageHandler.bind(this);
        this.sendSms = this.sendSms.bind(this);
        this.setMessageText = this.setMessageText.bind(this);
        this.saveDraft = this.saveDraft.bind(this);
        this.loadTemplates = this.loadTemplates.bind(this);
        this.pickedTemplate = this.pickedTemplate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleRecipientListChange = this.handleRecipientListChange.bind(this);
        this.sendSmsMui = this.sendSmsMui.bind(this); // New handler for MUI form
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadGroups();
        this.loadSenderIds();
        this.loadSavedMessages();
        this.loadRoutes();
    }

    // Select Handlers
    handleSelectSenderId = (selectedSenderId) => {
        this.loadTemplates(selectedSenderId.value);
        this.setState({ selectedSenderId });
    }
    handleSelectGroup = (selectedGroup) => {
        if (selectedGroup === null) {
            this.setState({ recipientList: '', totalMobileNumbers: 0 })
            return;
        };

        this.setState({ selectedGroup });
        this.loadContacts(selectedGroup)
    }
    handleDefault(date) {
        this.setState({ default_date: date });
    }
    handleSelectGroupSmsGateway = (selectedItem) => {
        this.setState({ smsGateway: selectedItem.value });
    }

    // Input Handlers
    updateMessageHandler(message) {
        this.setState({ messageText: message })
    }
    savedMessageHandler() {
        this.setState({ showSavedMessage: true });
    }
    setMessageText(value) {
        if (value != null) {
            this.setState({ messageText: value });
        }
    }
    handleChange = e => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };

    // Handler for the recipient list textarea
    handleRecipientListChange = (e) => {
        const value = e.target.value;
        const count = value.split(',').filter(n => n.trim() !== '').length;
        this.setState({
            recipientList: value,
            totalMobileNumbers: count
        });
    }

    // Loader methods (omitted body for brevity, but structure remains)
    loadSenderIds() {
        if (getLoggedInUser().templateBased) {
            this.setState({ templateBased: true })
        }
        ServerApi().get(`getAllSenderIds/${getLoggedInUser().id}`)
            .then(res => {
                if (!res.data) { return false; }
                let approvedIds = res.data.filter((i) => i.status === 'Approved');
                let approvedIdsOptions = approvedIds.map(obj => ({
                    label: obj.senderId,
                    value: obj.senderId,
                }))
                this.setState({ senderIds: approvedIdsOptions })
            })
            .catch(error => console.log('error', error));
    }

    loadRoutes() {
        var arr = getLoggedInUser().routes.map(obj => ({
            label: obj.routeName,
            value: obj.id,
        }))
        this.setState({ smsGateways: arr })
    }

    loadSavedMessages() {
        ServerApi().get('sms/getAllSmsTemplates')
            .then(res => {
                if (!res.data) { return false; }
                this.setState({ savedMessages: res.data })
            })
            .catch(error => console.log('error', error));
    }

    loadGroups() {
        ServerApi().get(`groups/getActiveGroups/${getLoggedInUser().id}`)
            .then(res => {
                if (!res.data) { return false; }
                var arr = res.data.map(obj => ({
                    label: obj.groupName + "  (" + obj.contactsCount + ")",
                    value: obj,
                }))
                this.setState({ groups: arr })
            })
            .catch(error => console.log('error', error));
    }

    loadContacts(selectedGroups) {
        this.setState({ groupLoading: true });
        var raw = selectedGroups.map(item => item.value.id);

        ServerApi().post('groups/getContacts', raw)
            .then(res => {
                if (!res.data) { return false; }
                var numbers = res.data.map(item => item.mobile);
                this.setState({ groupLoading: false, recipientList: numbers.join(','), totalMobileNumbers: numbers.length })
            })
            .catch(error => console.log('error', error));
    }

    loadTemplates() {
        ServerApi().get(`sms/getAllSmsTemplates`)
            .then(res => {
                if (!res.data) { return false; }
                let approvedTemplates = res.data.filter(i => i.status !== 0)
                this.setState({ templates: approvedTemplates })
            })
            .catch(error => console.log('error', error));
    }

    pickedTemplate(id) {
        const { templates } = this.state;
        const selected = templates.filter(i => i.id === id);
        this.setState({ variableValues: {}, selectedTemplateId: id, messageText: selected && selected.length > 0 ? selected[0].message : "" })
    }

    // MUI wrapper for form submission
    sendSmsMui(event) {
        event.preventDefault(); 
        
        // Mock values object based on new state structure for original sendSms function
        const values = {
            recipients: this.state.recipientList
        };
        this.sendSms(event, values);
    }

    sendSms(event, values) {
        if (this.state.selectedSenderId === null || values.recipients === null || values.recipients.trim() === '') {
            this.props.openSnack({ type: 'error', message: 'Please enter all required fields.' })
            return false;
        }
        if (this.state.messageText.trim() === "") {
            this.props.openSnack({ type: 'error', message: 'Please enter all required fields.' })
            return false;
        }
        if (getLoggedInUser().userType === 'ADMIN' || getLoggedInUser().userType === 'SUPER_ADMIN') {
            if (this.state.smsGateway === null) {
                this.props.openSnack({ type: 'error', message: 'Please enter all required fields.' })
                return false;
            }
        }

        this.setState({ isSending: true });

        // Show the loading modal *before* making the API call
        MySwal.fire({
            html: <SmsSending />, 
            title: 'Sending SMS...',
            showConfirmButton: false,
            allowOutsideClick: false,
        });

        var raw = JSON.stringify({
            requestType: "QUICKSMS",
            payload: {
                smsGateway: (getLoggedInUser().userType === 'RESELLER' || getLoggedInUser().userType === 'USER') ? getLoggedInUser().routes[0].id : this.state.smsGateway,
                senderId: this.state.selectedSenderId.value,
                countryCode: "+91",
                globalStatus: "true",
                recipients: values.recipients,
                delimiter: ",",
                removeDuplicate: "true",
                messageType: this.props.sms_type,
                message: this.state.messageText,
                templateId: this.state.selectedTemplateId,
            }
        });

        ServerApi().post('sms/sendQuickSms', raw)
            .then(res => {
                this.setState({
                    selectedSenderId: { label: 'Select', value: 0 },
                    messageText: '',
                    recipientList: '',
                    selectedGroup: null,
                });

                setTimeout(() => {
                    MySwal.close(); // Close the loading modal
                    this.setState({ isSending: false });
                    this.props.openSnack({ type: 'success', message: 'SMS sent.' })
                }, 2300)

                // this.form && this.form.reset(); // Removed as we use controlled inputs
                this.loadBalance();
            })
            .catch(error => {
                MySwal.close(); // Close the loading modal on error
                this.props.openSnack({ type: 'error', message: 'Unable to send SMS' });
                this.setState({ isSending: false });
                console.log('error', error);
            });
    }

    loadBalance() {
        if (getLoggedInUser().userType === 'SUPER_ADMIN') { return false; }

        ServerApi().get(`client/getBalance/${getLoggedInUser().id}`)
            .then(res => {
                if (res.data === undefined) { return false; }
                this.props.updateSmsBalance(Math.round((parseFloat(res.data.response) + Number.EPSILON) * 1000000) / 1000000);
            })
            .catch(error => console.log('error', error));
    }

    saveDraft() {
        if (this.state.messageText === '') {
            return false;
        }

        this.setState({ isDrafting: true });

        // Show loading modal for drafting
        MySwal.fire({
            html: <SmsSending />,
            title: 'Saving Draft...',
            showConfirmButton: false,
            allowOutsideClick: false,
        });

        let raw = JSON.stringify({
            templateName: this.state.messageText.replace(' ', '_'),
            message: this.state.messageText
        });

        ServerApi().post('sms/saveSmsTemplate', raw)
            .then(res => {
                if (res.data === undefined) { return false; }

                this.setState({ isDrafting: false });

                MySwal.fire({
                    html: (
                        <div>
                            <SmsSent />
                            <h6>Message saved as draft</h6>
                        </div>
                    ),
                    icon: 'success'
                }).then(() => {
                    setTimeout(() => {
                        window.location.reload()
                    }, 750);
                });
            })
            .catch(error => {
                console.log('error', error);
                this.setState({ isDrafting: false });
                MySwal.close(); // Close loading modal on error
                this.props.openSnack({ type: 'error', message: 'Unable to save draft.' });
            });
    }

    render() {
        const { selectedSenderId } = this.state;

        return (
            <Box sx={{ p: 3 }}>
                
                <Box className="page-title-box" sx={{ mb: 3 }}>
                    <Typography variant="h4">SEND GROUP SMS</Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} lg={6}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            
                            <Box component="form" onSubmit={this.sendSmsMui} noValidate>
                                
                                <Grid container spacing={2} className="mb-2">
                                    {getLoggedInUser().userType !== 'RESELLER' && getLoggedInUser().userType !== 'CLIENT' && (
                                        <Grid item xs={12}>
                                            <InputLabel shrink sx={{ mb: 0.5 }}>SMS Gateway</InputLabel>
                                            <Select
                                                className="MuiSelect-root-full-width"
                                                name="smsGateway"
                                                onChange={this.handleSelectGroupSmsGateway}
                                                options={this.state.smsGateways}
                                                required
                                            />
                                        </Grid>
                                    )}

                                    <Grid item xs={12}>
                                        <InputLabel shrink sx={{ mb: 0.5 }}>SENDER ID</InputLabel>
                                        <Select
                                            className="MuiSelect-root-full-width"
                                            name="senderId"
                                            value={selectedSenderId}
                                            onChange={this.handleSelectSenderId}
                                            options={this.state.senderIds}
                                            required
                                        />
                                    </Grid>
                                </Grid>

                                <Box sx={{ mb: 2 }}>
                                    <InputLabel shrink sx={{ mb: 0.5 }}>GROUP</InputLabel>
                                    <Select
                                        className="MuiSelect-root-full-width"
                                        isMulti
                                        name="groups"
                                        onChange={this.handleSelectGroup}
                                        options={this.state.groups}
                                    />
                                </Box>
                                
                                {this.state.groupLoading && (
                                    <Box sx={{ my: 2 }}><ContactsLoading /></Box>
                                )}

                                <Box sx={{ mb: 3 }}>
                                    <TextField
                                        name="recipients"
                                        label="Groups Contacts (Comma separated)"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        required
                                        variant="outlined"
                                        value={this.state.recipientList}
                                        onChange={this.handleRecipientListChange}
                                        sx={{ mb: 0.5 }}
                                        inputProps={{ style: { overflow: 'auto' } }}
                                    />
                                    <Grid container>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="caption" color="textSecondary">
                                                No of mobile numbers: <b>{this.state.totalMobileNumbers}</b>
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* Message Input Area */}
                                {this.state.templateBased && this.state.selectedTemplateId ? (
                                    <Message messageText={this.state.messageText} messageHandler={this.updateMessageHandler} savedMessageHandler={this.savedMessageHandler} noExtraOptions={true} />
                                ) : (
                                    <Message messageText={this.state.messageText} messageHandler={this.updateMessageHandler} savedMessageHandler={this.savedMessageHandler} />
                                )}

                                {/* Schedule Radio Group - Replaces Antd Radio.Group */}
                                <Box sx={{ my: 2 }}>
                                    <InputLabel shrink sx={{ mr: 1, display: 'inline-block' }}>Send Later:</InputLabel>
                                    <RadioGroup 
                                        row 
                                        name="sheduleRequired" 
                                        value={this.state.sheduleRequired} 
                                        onChange={this.handleChange}
                                        sx={{ display: 'inline-block' }}
                                    >
                                        <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                        <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                    </RadioGroup>

                                    {this.state.sheduleRequired === 'Yes' &&
                                        <Box sx={{ mt: 1 }}>
                                            <DatePicker
                                                className="MuiForm-control MuiOutlinedInput-root"
                                                selected={this.state.default_date}
                                                onChange={this.handleDefault}
                                                showTimeSelect
                                                dateFormat="Pp"
                                            />
                                        </Box>
                                    }
                                </Box>


                                <Box sx={{ mt: 3, mb: 0, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                    <MuiButton 
                                        size="small" 
                                        variant="contained"
                                        type="submit" 
                                        disabled={this.state.isSending} 
                                        color="primary"
                                    >
                                        <i className="fa fa-paper-plane mr-2"></i> 
                                        {(this.state.isSending) ? 'Please Wait...' : 'Send'}
                                    </MuiButton>
                                    <MuiButton 
                                        size="small" 
                                        variant="outlined" 
                                        onClick={this.saveDraft}
                                        disabled={this.state.isDrafting}
                                    >
                                        <i className="fa fa-save mr-2"></i> Save Draft
                                    </MuiButton>
                                </Box>

                            </Box>
                        </Paper>
                    </Grid>

                    {/* Templates Section */}
                    {this.state.selectedSenderId !== null && this.state.templateBased && (this.state.templates.length > 0) &&
                        <MyTemplates templates={this.state.templates} pickedTemplate={this.pickedTemplate} />
                    }
                </Grid>
            </Box>
        );
    }
}

const mapStatetoProps = state => {
    const { sms_balance } = state.User;
    const { sms_type } = state.Sms;
    return { sms_balance, sms_type };
}

export default connect(mapStatetoProps, { activateAuthLayout, updateSmsBalance, getSmsBalance, openSnack })(SendGroupSms);
