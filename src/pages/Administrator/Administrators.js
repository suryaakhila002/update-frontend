import React, { Component } from 'react';
// Removed reactstrap imports
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select'; // RETAINED: For complex selects

import { connect } from 'react-redux';

// --- MUI & Core Imports ---
import { 
    Box, Grid, Paper, Typography, TextField, Button as MuiButton, InputLabel, 
    FormControl as MuiFormControl, Dialog, DialogTitle, DialogContent, DialogActions, 
    FormGroup
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid'; 
import Swal from 'sweetalert2'; 
import withReactContent from 'sweetalert2-react-content'; 
// --- END MUI & Core Imports ---

const MySwal = withReactContent(Swal); 

const ROLES = [
    {
        label: "Role",
        options: [
            { label: "User", value: "User", isOptionSelected: true },
            { label: "Reseller ", value: "Reseller " },
            { label: "Distributor ", value: "Distributor " },
            { label: "Admin", value: "Admin" },
        ]
    }
];

class Administrators extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Form fields state
            firstName: '',
            lastName: '',
            userName: '',
            email: '',
            password: '',
            confirmPassword: '',

            selectedGroup: {label:'User', value: 'User'}, 
            selectedMulti: null,
            isAdding: false,
            isDeleting: false,
            modal_delete: false,
            delete_sid: '',

            columns: [
                { field: 'sl', headerName: 'SL', width: 80 },
                { field: 'name', headerName: 'Name', width: 150 },
                { field: 'userName', headerName: 'User Name', width: 150 },
                { field: 'role', headerName: 'Role', width: 100 },
                { field: 'status', headerName: 'STATUS', width: 120, renderCell: (params) => (params.value) },
                { field: 'action', headerName: 'ACTION', width: 150, sortable: false, renderCell: (params) => (params.value) }
            ],

            tableData : {
                rows: [
                    // Mock data to initialize the table structure
                    {
                        id: 1, sl: 1, name: 'John Doe', userName: 'jdoe', role: 'Admin',
                        status: <span className="badge badge-success p-1">Active</span>,
                        action: <MuiButton variant="contained" color="error" size="small">Delete</MuiButton>
                    }
                ]
            },
        };
        this.addClientGroup = this.addClientGroup.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this); // Handler for text fields
        this.handleSubmitAddAdmin = this.handleSubmitAddAdmin.bind(this); // Wrapper for form submit
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        // this.loadClientGroups();
    }
    
    // Select 
    handleSelectGroup = (selectedGroup) => {
        this.setState({ selectedGroup });
    }

    // Generic handler for all TextFields
    handleInputChange = e => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };

    // New wrapper for form submission, including validation logic
    handleSubmitAddAdmin = (event) => {
        event.preventDefault();
        const { firstName, lastName, userName, email, password, confirmPassword } = this.state;

        if ([firstName, lastName, userName, email, password, confirmPassword].some(field => !field.trim())) {
            MySwal.fire({ title: 'Validation Error', text: 'All fields are required.', icon: 'warning' });
            return;
        }

        if (password !== confirmPassword) {
            MySwal.fire({ title: 'Validation Error', text: 'Password and Confirm Password must match.', icon: 'warning' });
            return;
        }

        const values = {
            group_name: `${firstName} ${lastName}`, // Combined name for API payload
            // In a real app, you'd send individual fields or use a different payload structure
        };
        this.addClientGroup(event, values);
    }


    ManageClick() {        
        // this.props.history.push('/manageClient');
    }

    // Toggle for MUI Dialog
    tog_delete(id) {
        this.setState(prevState => ({
            modal_delete: !prevState.modal_delete,
            delete_sid: id || '',
        }));
    }

    // removeBodyCss is deprecated/unused with MUI Dialog

    addClientGroup(event, values){
        this.setState({isAdding: true});
        var userData = JSON.parse(localStorage.getItem('user'));

        var raw = JSON.stringify({
            requestType: "ADDGROUP",
            payload:{
                groupName: values.group_name,
                status: this.state.selectedGroup.value,
            }
        });
        var requestOptions = {
          method: 'POST',
          headers: {"Content-Type": "application/json", 'Authorization': 'Bearer '+userData.sessionToken},
          body: raw,
          redirect: 'follow'
        };

        fetch("http://atssms.com:8090/groups/addGroup", requestOptions)
          .then(response => response.json())
          .then(data => {
            this.setState({ isAdding: false, firstName: '', lastName: '', userName: '', email: '', password: '', confirmPassword: '' }); // Clear inputs
            MySwal.fire({
                title: 'Success!',
                text: data.response || 'Administrator added successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            // this.loadClientGroups();
          })
          .catch(error => {
            console.log('error', error);
            this.setState({ isAdding: false });
            MySwal.fire({ title: 'Error!', text: 'Failed to add administrator.', icon: 'error' });
          });
    }

    deleteGroup(){
        if (this.state.delete_sid === "") { return false; }
        
        // ... (API call to delete group) ...
        this.setState({isDeleting: true});
        setTimeout(() => {
            this.setState({isDeleting: false});
            // this.loadClientGroups();
            this.tog_delete();
            MySwal.fire('Deleted!', 'Administrator has been deleted.', 'success');
        }, 500); 
    }

    loadClientGroups(){
        // ... (API logic to load groups remains the same, ensure 'id' field is mapped) ...
    }

    render() {
        const { selectedGroup } = this.state;

        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1">Administrators</Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Add Administrator Form (MUI Grid) */}
                    <Grid item xs={12} lg={4}>
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Add Administrator</Typography>

                            <Box component="form" onSubmit={this.handleSubmitAddAdmin} noValidate>
                                
                                <TextField name="firstName" label="First NAME" type="text" fullWidth required margin="normal" size="small"
                                    value={this.state.firstName} onChange={this.handleInputChange} />
                                
                                <TextField name="lastName" label="Last NAME" type="text" fullWidth required margin="normal" size="small"
                                    value={this.state.lastName} onChange={this.handleInputChange} />

                                <TextField name="userName" label="User NAME" type="text" fullWidth required margin="normal" size="small"
                                    value={this.state.userName} onChange={this.handleInputChange} />

                                <TextField name="email" label="Email" type="email" fullWidth required margin="normal" size="small"
                                    value={this.state.email} onChange={this.handleInputChange} />

                                <TextField name="password" label="Password" type="password" fullWidth required margin="normal" size="small"
                                    value={this.state.password} onChange={this.handleInputChange} />

                                <TextField name="confirmPassword" label="Confirm Password" type="password" fullWidth required margin="normal" size="small"
                                    value={this.state.confirmPassword} onChange={this.handleInputChange} />

                                {/* Role Select */}
                                <MuiFormControl fullWidth margin="normal" size="small">
                                    <InputLabel shrink>Role</InputLabel>
                                    <Select
                                        classNamePrefix="react-select"
                                        name="role"
                                        value={selectedGroup}
                                        onChange={this.handleSelectGroup}
                                        options={ROLES}
                                        isDisabled={this.state.isAdding}
                                    />
                                </MuiFormControl>

                                {/* Buttons */}
                                <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                                    <MuiButton type="submit" 
                                        variant="contained" 
                                        color="primary" 
                                        disabled={this.state.isAdding}
                                    >
                                        {!this.state.isAdding && <i className="ti ti-plus mr-2"></i>}
                                        {this.state.isAdding ? 'Adding...' : 'Add'}
                                    </MuiButton>
                                    <MuiButton type="reset" variant="outlined" color="secondary">
                                        Cancel
                                    </MuiButton>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Administrator List (MUI Grid) */}
                    <Grid item xs={12} lg={8}>
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Administrators List</Typography>
                            <Box sx={{ height: 600, width: '100%' }}>
                                <DataGrid
                                    rows={this.state.tableData.rows}
                                    columns={this.state.columns}
                                    pageSizeOptions={[5, 10, 20]}
                                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                    getRowId={(row) => row.id} 
                                    disableRowSelectionOnClick
                                />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Delete Modal (MUI Dialog) */}
                <Dialog open={this.state.modal_delete} onClose={this.tog_delete} maxWidth="xs">
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" align="center">Are you sure you want to delete this administrator?</Typography>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center' }}>
                        <MuiButton onClick={this.tog_delete} variant="outlined" color="secondary">Cancel</MuiButton>
                        <MuiButton onClick={this.deleteGroup} variant="contained" color="error" disabled={this.state.isDeleting}>
                            {this.state.isDeleting ? 'Deleting...' : 'Delete'}
                        </MuiButton>
                    </DialogActions>
                </Dialog>

            </Box>
        );
    }
}

export default connect(null, { activateAuthLayout })(Administrators);
