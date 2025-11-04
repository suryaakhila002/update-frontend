import React, { Component } from 'react';
// REMOVED: { Container, Row, Col, Card, CardBody, FormGroup, Button } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
// import { withRouter } from 'react-router-dom';

import { connect } from 'react-redux';

// --- MUI & Core Imports ---
import { DataGrid } from '@mui/x-data-grid';
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    TextField, 
    Button as MuiButton, // Renamed to avoid conflicts
    InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
// --- END MUI Imports ---

class PhoneBook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: null, 
            listName: '', // State for the new list input
            
            // DataGrid Columns
            columns: [
                {
                    field: 'sl',
                    headerName: 'SL',
                    width: 150
                },
                {
                    field: 'list_name',
                    headerName: 'LIST NAME',
                    width: 270
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 200,
                    sortable: false,
                    // Use renderCell to include MUI buttons for actions
                    renderCell: (params) => (
                        <Box>
                            <MuiButton variant="contained" color="primary" size="small" sx={{ mr: 1 }}>Manage</MuiButton>
                            <MuiButton variant="contained" color="error" size="small">Delete</MuiButton>
                        </Box>
                    )
                }
            ],
            // Dummy DataGrid Rows (replace with API data)
            rows: [
                { id: 1, sl: 1, list_name: 'Clients India' },
                { id: 2, sl: 2, list_name: 'Leads Q1 2024' },
                { id: 3, sl: 3, list_name: 'Marketing Opt-ins' },
            ] 
        };
        this.handleListNameChange = this.handleListNameChange.bind(this);
        this.handleAddList = this.handleAddList.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
    }
    
    // Select Handler (retained signature for potential use)
    handleSelectGroup = (selectedGroup) => {
        this.setState({ selectedGroup });
    }

    // Input Handler for the List Name
    handleListNameChange = (e) => {
        this.setState({ listName: e.target.value });
    }

    // Form Submission Handler
    handleAddList = (e) => {
        e.preventDefault();
        const listName = this.state.listName.trim();
        if (listName) {
            // Placeholder for API call to add list
            console.log("Adding new list:", listName);
            // Simulate adding to rows (in a real app, this would be done after successful API call)
            const newId = this.state.rows.length + 1;
            const newRow = { id: newId, sl: newId, list_name: listName };
            this.setState(prevState => ({
                rows: [...prevState.rows, newRow],
                listName: '' // Clear input
            }));
        } else {
            // Replaced alert() with console/UI feedback placeholder
            console.error("Please enter a list name.");
        }
    }

    render() {
        const { listName, rows, columns } = this.state;

        return (
            <Box sx={{ p: 3 }}>
                <Box className="page-title-box" sx={{ mb: 3 }}>
                    <Typography variant="h4">PHONE BOOK</Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* LEFT COLUMN: ADD NEW LIST (4/12) */}
                    <Grid item xs={12} lg={4}>
                        <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>ADD NEW LIST</Typography>

                            <Box component="form" onSubmit={this.handleAddList} noValidate>
                                <TextField
                                    name="list_name"
                                    label="LIST NAME"
                                    type="text"
                                    fullWidth
                                    required
                                    margin="normal"
                                    value={listName}
                                    onChange={this.handleListNameChange}
                                    // Validation hint is integrated into MUI TextField props (helperText, error state)
                                />

                                {/* Submission Button */}
                                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                                    <MuiButton 
                                        type="submit" 
                                        variant="contained" 
                                        color="success" 
                                        sx={{ mr: 1 }}
                                        startIcon={<AddIcon />}
                                    >
                                        Add
                                    </MuiButton>
                                    <MuiButton type="reset" variant="outlined" color="secondary">
                                        Cancel
                                    </MuiButton>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: PHONE BOOK LIST (8/12) */}
                    <Grid item xs={12} lg={8}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>PHONE BOOK LIST</Typography>

                            <Box sx={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    pageSizeOptions={[5, 10, 20]}
                                    initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                                    getRowId={(row) => row.id} 
                                    disableRowSelectionOnClick
                                />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    }
}

export default connect(null, { activateAuthLayout })(PhoneBook);
