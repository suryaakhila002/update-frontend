import React, { Component } from 'react';
// REMOVED: { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select'; // RETAINED: For advanced select functionality
import { connect } from 'react-redux';
import { Tag } from 'antd'; // RETAINED: Ant Design Tag for status display
import { ServerApi } from '../../utils/ServerApi';

// --- MUI & Core Imports ---
import { DataGrid } from '@mui/x-data-grid';
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    Button as MuiButton, 
    TextField, 
    InputLabel, 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
// --- END MUI Imports ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

// Constants
const CLIENT_GROUP_STATUS = [
    {
        label: "Status",
        options: [
            { label: "Active", value: "Active" },
            { label: "In Active", value: "In Active" }
        ]
    }
];

class ClientGroups extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: {label:'Active', value: 'Active'}, 
            newGroupName: '', // State for the new group input
            isAdding: false,
            isDeleting: false,
            modal_delete: false, // Controls MUI Dialog visibility
            delete_sid: '',
            
            // DataGrid Columns
            columns: [
                { field: 'groupName', headerName: 'Group Name', width: 150 },
                { field: 'createdBy', headerName: 'CREATED BY', width: 270 },
                { 
                    field: 'status', 
                    headerName: 'STATUS', 
                    width: 200, 
                    renderCell: (params) => (params.value) 
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 200,
                    sortable: false,
                    // Use MuiButton components
                    renderCell: (params) => (
                        <Box>
                            <MuiButton onClick={() => this.ManageClick(params.row.id)} variant="contained" color="primary" size="small" sx={{ mr: 1 }}>
                                Manage
                            </MuiButton>
                            <MuiButton onClick={() => this.tog_delete(params.row.id)} variant="contained" color="error" size="small">
                                Delete
                            </MuiButton>
                        </Box>
                    )
                }
            ],
            // DataGrid Rows
            rows: []
        };
        this.addClientGroup = this.addClientGroup.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
        this.handleNewGroupNameChange = this.handleNewGroupNameChange.bind(this); // Handler for text input
        this.handleFormSubmit = this.handleFormSubmit.bind(this); // Wrapper for form submission
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadClientGroups();
    }
    
    // Select Handler
    handleSelectGroup = (selectedGroup) => {
        this.setState({ selectedGroup });
    }

    // Text Input Handler
    handleNewGroupNameChange(e) {
        this.setState({ newGroupName: e.target.value });
    }

    // Navigation (MUI button action)
    ManageClick(id) {        
        // Placeholder navigation logic
        this.props.history.push(`/manageClient/${id}`);
    }

    // Toggles MUI Dialog
    tog_delete(id) {
        this.setState(prevState => ({
            modal_delete: !prevState.modal_delete,
            delete_sid: id || '',
        }));
        // removeBodyCss not needed with MUI Dialog
    }
    
    // MUI Form Submission Wrapper
    handleFormSubmit(event) {
        event.preventDefault();
        const { newGroupName, selectedGroup } = this.state;

        if (newGroupName.trim() === "") {
            MySwal.fire('Validation Error', 'Please enter a Group Name.', 'error');
            return;
        }

        // Pass synthetic values object to original logic
        this.addClientGroup(event, { group_name: newGroupName, status: selectedGroup.value });
    }

    addClientGroup(event, values) {
        this.setState({ isAdding: true });

        var raw = JSON.stringify({
            requestType: "ADDGROUP",
            payload: {
                groupName: values.group_name,
                status: values.status,
            }
        });

        ServerApi().post('groups/addGroup', raw)
            .then(res => {
                this.setState({ isAdding: false, newGroupName: '' }); // Clear input on success
                MySwal.fire({
                    title: 'Success!',
                    text: res.data.response || 'Client group added successfully.',
                    icon: 'success'
                });
                this.loadClientGroups();
            })
            .catch(error => {
                console.log('error', error);
                this.setState({ isAdding: false });
                MySwal.fire('Error!', 'Could not add group.', 'error');
            });
    }

    deleteGroup() {
        if (!this.state.delete_sid) { return false; }
        
        this.setState({ isDeleting: true });
        
        ServerApi().get("groups/deleteGroup/"+this.state.delete_sid)
            .then(res => {
                this.setState({ isDeleting: false });
                this.loadClientGroups();
                this.tog_delete();
                MySwal.fire('Deleted!', 'The group has been deleted.', 'success');
            })
            .catch(error => {
                console.log('error', error);
                this.setState({ isDeleting: false });
                MySwal.fire('Error!', 'Could not delete group.', 'error');
            });
    }

    loadClientGroups() {
        ServerApi().get("groups/getGroups")
            .then(res => {
                if (!res.data) { return false; }
                
                const formattedRows = res.data.map((item, index) => {
                    // Ensure item has a unique 'id' field for DataGrid
                    if (!item.id) item.id = index;
                    
                    item.status = (item.isDeleted === 'Active') ? (<Tag color="green">Active</Tag>) : (<Tag color="red">In Active</Tag>);
                    // Actions are rendered via the renderCell function in state.columns
                    
                    return item;
                }); 
                
                this.setState({ rows: formattedRows });
            })
            .catch(error => console.log('error', error));
    }

    render() {
        const { selectedGroup, newGroupName, isAdding, rows, columns, isDeleting } = this.state;

        return (
            <Box sx={{ p: 3 }}>
                <Box className="page-title-box" sx={{ mb: 3 }}>
                    <Typography variant="h4">CLIENT GROUP</Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Add Client Group Form (MUI Grid replaces Row/Col/Card) */}
                    <Grid item xs={12} lg={4}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Add Client Group</Typography>
                            
                            {/* MUI Form wraps inputs */}
                            <Box component="form" onSubmit={this.handleFormSubmit} noValidate>
                                
                                {/* Group Name (Replaces AvField) */}
                                <TextField 
                                    name="group_name" 
                                    label="GROUP NAME"
                                    type="text" 
                                    fullWidth 
                                    required
                                    margin="normal"
                                    value={newGroupName}
                                    onChange={this.handleNewGroupNameChange}
                                />

                                {/* Client Group Status (using react-select) */}
                                <InputLabel shrink sx={{ mb: 0.5, mt: 1 }}>CLIENT GROUP STATUS</InputLabel>
                                <Select
                                    className="MuiSelect-root-full-width mb-3"
                                    name="group_status"
                                    value={selectedGroup}
                                    onChange={this.handleSelectGroup}
                                    options={CLIENT_GROUP_STATUS}
                                    placeholder="Select Status"
                                />

                                {/* Buttons */}
                                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                                    <MuiButton 
                                        type="submit" 
                                        variant="contained" 
                                        color="primary"
                                        disabled={isAdding}
                                        startIcon={!isAdding && <AddIcon />}
                                    >
                                        {(isAdding)?'Please Wait...':'Add'}
                                    </MuiButton>
                                    <MuiButton type="reset" variant="outlined" color="secondary">
                                        Cancel
                                    </MuiButton>
                                </Box>
                                
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Client Group List (MUI DataGrid) */}
                    <Grid item xs={12} lg={8}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>CLIENT GROUP LIST</Typography>

                            <Box sx={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    pageSizeOptions={[5, 10, 20]}
                                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                    getRowId={(row) => row.id} 
                                    disableRowSelectionOnClick
                                />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* MUI Dialog replaces reactstrap Modal for delete confirmation */}
                <Dialog 
                    open={this.state.modal_delete} 
                    onClose={() => this.tog_delete()} 
                    maxWidth="xs" 
                    fullWidth
                >
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" align="center" sx={{ pt: 2 }}>
                            Are you sure you want to delete this group (ID: **{this.state.delete_sid}**)?
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                        <MuiButton 
                            onClick={this.deleteGroup} 
                            variant="contained" 
                            color="error"
                            disabled={isDeleting}
                            sx={{ mr: 1 }}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
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

export default connect(null, { activateAuthLayout })(ClientGroups);
