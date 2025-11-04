import React, { Component } from 'react';
// REMOVED: reactstrap imports
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select'; // RETAINED: For complex select functionality
// import { withRouter } from 'react-router-dom'; // Assuming still not needed
// REMOVED: import { FormControl } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';

// --- MUI & Core Imports ---
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    TextField, 
    Button as MuiButton, // Renamed to avoid clash
    InputLabel, 
    FormControl,
    Dialog,         // MUI Modal/Dialog replacement
    DialogTitle,
    DialogContent,
    DialogActions 
} from '@mui/material';
import Swal from 'sweetalert2'; 
import withReactContent from 'sweetalert2-react-content'; 
// --- END MUI & Core Imports ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

const DEPARTMENT = [
    {
        options: [
            { label: "Support", value: "Support", isOptionSelected: true },
            { label: "Billing ", value: "Billing " },
        ]
    }
];

const STATUS = [
    {
        options: [
            { label: "Pending", value: "Pending", isOptionSelected: true },
            { label: "Answered ", value: "Answered " },
            { label: "Closed ", value: "Closed " },
        ]
    }
];

class ManageTicket extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Form & Display States
            selectedGroup: {label:'Support', value: 'Support'}, // Department
            selectedGroup1: {label:'Pending', value: 'Pending'}, // Status
            ticketId: 'TKT-920182', // Mock ticket data
            subject: 'Cannot access server logs after update', // Mock ticket data
            requester: 'John Doe (john.doe@example.com)', // Mock ticket data
            replyText: '',

            // UI States
            isAdding: false,
            isDeleting: false,
            modal_delete: false, // Controls MUI Dialog visibility
            delete_sid: '',
            
            // Note: Data grid setup is removed as this is a detail/management view
            tableData : { rows: [] }, 
        };
        this.addClientGroup = this.addClientGroup.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
        this.handleSelectDepartment = this.handleSelectDepartment.bind(this);
        this.handleSelectStatus = this.handleSelectStatus.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        // this.loadClientGroups();
    }
    
    // Select Handlers
    handleSelectDepartment = (selectedGroup) => {
        this.setState({ selectedGroup });
    }
    handleSelectStatus = (selectedGroup1) => {
        this.setState({ selectedGroup1 });
    }

    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }
    
    // Navigation (Kept but functionality relies on environment)
    ManageClick() {        
        // this.props.history.push('/manageClient');
    }

    // Toggles MUI Dialog
    tog_delete(id) {
        this.setState(prevState => ({
            modal_delete: !prevState.modal_delete,
            delete_sid: id || '',
        }));
        // removeBodyCss is no longer needed with MUI Dialog
    }

    addClientGroup(event){
        event.preventDefault(); // Prevent default form submission
        this.setState({isAdding: true});
        
        // Note: The original function used 'values' from a validation library.
        // We now extract data directly from state (e.g., ticket changes or reply)
        const { selectedGroup, selectedGroup1, replyText } = this.state;
        
        // Mock payload reflecting ticket update or reply
        var raw = JSON.stringify({
            requestType: "UPDATE_TICKET",
            payload:{
                department: selectedGroup.value,
                status: selectedGroup1.value,
                reply: replyText,
            }
        });
        
        var userData = JSON.parse(localStorage.getItem('user'));

        var requestOptions = {
          method: 'POST',
          headers: {"Content-Type": "application/json", 'Authorization': 'Bearer '+userData.sessionToken},
          body: raw,
          redirect: 'follow'
        };

        fetch("http://atssms.com:8090/groups/addGroup", requestOptions) // Mock API endpoint
          .then(response => response.json())
          .then(data => {
            this.setState({ isAdding: false });
            MySwal.fire({
                title: 'Success!',
                text: data.response || 'Ticket updated successfully.',
                icon: 'success'
            });
          })
          .catch(error => {
            console.error('API error:', error);
            this.setState({ isAdding: false });
            MySwal.fire('Error!', 'An error occurred during update.', 'error');
          });
    }

    deleteGroup(){
        if (!this.state.delete_sid) { return false; }

        this.setState({isDeleting: true});
        var userData = JSON.parse(localStorage.getItem('user'));

        var requestOptions = {
          method: 'GET',
          headers: {"Content-Type": "application/json", 'Authorization': 'Bearer '+userData.sessionToken},
          redirect: 'follow'
        };

        // Note: Using a mock delete endpoint.
        fetch("http://atssms.com:8090/groups/deleteGroup/"+this.state.delete_sid, requestOptions) 
          .then(response => response.json())
          .then(data => {
            this.setState({isDeleting: false});
            MySwal.fire('Deleted!', 'Ticket has been closed and archived.', 'success');
            this.tog_delete(); // Close the modal
            // this.loadClientGroups(); // Reload logic if needed
          })
        .catch(error => {
            console.error('API error:', error);
            this.setState({isDeleting: false});
            MySwal.fire('Error!', 'Failed to delete ticket.', 'error');
            this.tog_delete();
        });
    }

    render() {
        const { selectedGroup, selectedGroup1, ticketId, subject, requester, replyText } = this.state;

        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1">Manage Ticket</Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* LEFT COLUMN: Ticket Basic Info / Actions (4/12) */}
                    <Grid item xs={12} lg={4}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 3 }}>CHANGE BASIC INFO</Typography>
                            
                            <Box component="form" onSubmit={this.addClientGroup} noValidate>

                                <TextField 
                                    label="Ticket ID" 
                                    value={ticketId}
                                    fullWidth 
                                    margin="normal" 
                                    InputProps={{ readOnly: true }}
                                />

                                <TextField 
                                    label="Subject" 
                                    value={subject}
                                    fullWidth 
                                    margin="normal" 
                                    InputProps={{ readOnly: true }}
                                />

                                {/* Department Select (using react-select inside a styled Box) */}
                                <Box sx={{ my: 2 }}>
                                    <InputLabel shrink sx={{ position: 'relative', transform: 'none', mb: 1 }}>
                                        DEPARTMENT
                                    </InputLabel>
                                    <Select
                                        name="department"
                                        value={selectedGroup}
                                        onChange={this.handleSelectDepartment}
                                        options={DEPARTMENT}
                                        classNamePrefix="react-select"
                                    />
                                </Box>

                                {/* Status Select (using react-select inside a styled Box) */}
                                <Box sx={{ my: 2 }}>
                                    <InputLabel shrink sx={{ position: 'relative', transform: 'none', mb: 1 }}>
                                        STATUS
                                    </InputLabel>
                                    <Select
                                        name="status"
                                        value={selectedGroup1}
                                        onChange={this.handleSelectStatus}
                                        options={STATUS}
                                        classNamePrefix="react-select"
                                    />
                                </Box>
                                
                                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                                    <MuiButton 
                                        type="submit" 
                                        disabled={this.state.isAdding}
                                        variant="contained" 
                                        color="primary"
                                    >
                                        {!this.state.isAdding && <i className="ti ti-check mr-2"></i>}Save Changes
                                    </MuiButton>
                                    <MuiButton type="reset" variant="outlined" color="secondary">
                                        Reset
                                    </MuiButton>
                                </Box>

                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <MuiButton 
                                        variant="text" 
                                        color="error" 
                                        onClick={() => this.tog_delete(ticketId)}
                                    >
                                        Delete Ticket
                                    </MuiButton>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: Ticket Details & Reply (8/12) */}
                    <Grid item xs={12} lg={8}>
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>TICKET DETAILS</Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                **Requester:** {requester}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                **Subject:** {subject}
                            </Typography>
                            
                            {/* Mock Ticket Messages/History */}
                            <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1, minHeight: 150, mb: 3 }}>
                                <Typography variant="caption" display="block" color="primary.main">
                                    [2024-10-01 10:30 AM] - Requester
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    I am suddenly unable to access the server logs via the management panel. Please check the permissions.
                                </Typography>
                                <Typography variant="caption" display="block" color="secondary.main">
                                    [2024-10-01 11:00 AM] - Support
                                </Typography>
                                <Typography variant="body2">
                                    We are investigating the issue and will get back to you shortly.
                                </Typography>
                            </Box>
                            
                            <Typography variant="h6" sx={{ mb: 2 }}>TICKET REPLY</Typography>
                            
                            <TextField
                                name="replyText"
                                label="Write your reply here..."
                                multiline
                                rows={5}
                                fullWidth
                                variant="outlined"
                                value={replyText}
                                onChange={this.handleInputChange}
                                sx={{ mb: 2 }}
                            />
                            
                            <MuiButton 
                                variant="contained" 
                                color="secondary" 
                                onClick={this.addClientGroup} // Trigger the form submit (simulating reply submit)
                            >
                                Send Reply
                            </MuiButton>
                        </Paper>
                    </Grid>
                </Grid>

                {/* MUI Dialog (Delete Confirmation) */}
                <Dialog 
                    open={this.state.modal_delete} 
                    onClose={() => this.tog_delete()} 
                    maxWidth="sm" 
                    fullWidth
                >
                    <DialogTitle>Confirm Ticket Deletion</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" align="center" sx={{ pt: 2 }}>
                            Are You Sure You want to delete ticket **{this.state.delete_sid}**? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                        <MuiButton 
                            onClick={this.deleteGroup} 
                            variant="contained" 
                            color="error"
                            disabled={this.state.isDeleting}
                            sx={{ mr: 1 }}
                        >
                            {this.state.isDeleting ? 'Deleting...' : 'Delete'}
                        </MuiButton>
                        <MuiButton 
                            onClick={() => this.tog_delete()} 
                            variant="outlined" 
                            color="secondary"
                        >
                            Cancel
                        </MuiButton>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }
}

export default connect(null, { activateAuthLayout })(ManageTicket);
