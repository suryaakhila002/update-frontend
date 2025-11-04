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

class SpamWords extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: null, 
            spamWordInput: '', // State for the new word input
            cSelected: [], // Retained for original onCheckboxBtnClick, though currently unused in render
            isAdding: false,

            // DataGrid Columns
            columns: [
                {
                    field: 'words',
                    headerName: 'WORDS',
                    width: 200, // Adjusted width
                    // Placeholder: In a real app, you might use renderCell to wrap a custom MUI component
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 270,
                    sortable: false,
                    // Use renderCell to include MUI buttons for actions
                    renderCell: (params) => (
                        <Box>
                            <MuiButton variant="contained" color="error" size="small">Delete</MuiButton>
                        </Box>
                    )
                },
            ],
            // Dummy DataGrid Rows (replace with API data)
            rows: [
                { id: 1, words: 'offer' },
                { id: 2, words: 'discount' },
                { id: 3, words: 'free gift' },
            ] 
        };
        this.onCheckboxBtnClick = this.onCheckboxBtnClick.bind(this);
        this.handleWordInputChange = this.handleWordInputChange.bind(this);
        this.handleAddWord = this.handleAddWord.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        // Placeholder for API call to load spam words
    }

    // Retained original function (not visible in the MUI render, but kept for completeness)
    onCheckboxBtnClick(selected) {
        const index = this.state.cSelected.indexOf(selected);
        if (index < 0) {
            this.state.cSelected.push(selected);
        } else {
            this.state.cSelected.splice(index, 1);
        }
        this.setState({ cSelected: [...this.state.cSelected] });
    }

    // Input Handler for the new spam word
    handleWordInputChange = (e) => {
        this.setState({ spamWordInput: e.target.value });
    }

    // Form Submission Handler
    handleAddWord = (e) => {
        e.preventDefault();
        const newWord = this.state.spamWordInput.trim();
        if (newWord) {
            this.setState({ isAdding: true });
            
            // --- Placeholder for API call to add word ---
            console.log("Adding new spam word:", newWord);
            
            setTimeout(() => {
                const newId = this.state.rows.length + 1;
                const newRow = { id: newId, words: newWord };
                this.setState(prevState => ({
                    rows: [...prevState.rows, newRow],
                    spamWordInput: '', // Clear input
                    isAdding: false
                }));
            }, 1000);
            // --- End Placeholder ---
        } else {
            console.error("Please enter a word.");
        }
    }
    
    // Select Handler (retained signature for potential use)
    handleSelectGroup = (selectedGroup) => {
        this.setState({ selectedGroup });
    }

    render() {
        const { spamWordInput, rows, columns, isAdding } = this.state;

        return (
            <Box sx={{ p: 3 }}>
                <Box className="page-title-box" sx={{ mb: 3 }}>
                    <Typography variant="h4">SPAM WORDS</Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* LEFT COLUMN: ADD NEW WORD (5/12) */}
                    <Grid item xs={12} lg={5}>
                        <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>ADD NEW WORD</Typography>

                            <Box component="form" onSubmit={this.handleAddWord} noValidate>
                                
                                {/* Spam Word Input (MUI TextField replaces AvField) */}
                                <TextField
                                    name="spam_words"
                                    label="SPAM WORDS"
                                    type="text"
                                    fullWidth
                                    required
                                    margin="normal"
                                    value={spamWordInput}
                                    onChange={this.handleWordInputChange}
                                />

                                {/* Submission Button */}
                                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                                    <MuiButton 
                                        type="submit" 
                                        variant="contained" 
                                        color="success" 
                                        sx={{ mr: 1 }}
                                        startIcon={<AddIcon />}
                                        disabled={isAdding}
                                    >
                                        {isAdding ? 'Adding...' : 'Add'}
                                    </MuiButton>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: SPAM WORDS LIST (7/12) */}
                    <Grid item xs={12} lg={7}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>SPAM WORDS LIST</Typography>

                            <Box sx={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    pageSizeOptions={[5, 10, 20]}
                                    initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                                    getRowId={(row) => row.words} // Using 'words' as ID since 'sl' isn't explicitly mapped in the data load logic here
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

export default connect(null, { activateAuthLayout })(SpamWords);
