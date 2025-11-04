import React, { Component } from 'react';
// REMOVED: { Container, Row, Col, Card, CardBody, FormGroup, Label, Button } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select'; // Retained for complex select handling
import { connect } from 'react-redux';

// --- MUI & Core Imports ---
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    TextField, 
    Button as MuiButton, // Renamed to avoid conflicts
    InputLabel, 
    FormControl,
    ButtonGroup,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
// --- END MUI Imports ---

const CLIENT_GROUP = [
    {
        label: "Client Group",
        options: [
            { label: "None", value: "None" },
            { label: "SMS GATEWAY ", value: "SMS GATEWAY " },
            { label: "Twilio", value: "Twilio" },
            { label: "SMS LIMIT", value: "SMS LIMIT" },
            { label: "AVATAR", value: "AVATAR" }
        ]
    }
];

const VALIDITY = [
    {
        label: "Month",
        options: [
            { label: "2 Months", value: "2 Months" },
            { label: "3 Months", value: "3 Months" },
            { label: "6 Months", value: "6 Months" },
        ],
    }
];

const STATUS = [
    {
        options: [
            { label: "Available", value: "Available" },
            { label: "Assigned", value: "Assigned" },
        ]
    }
];

class AddNewKeywoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            keywordName: '',
            replyText: '',
            replyVoice: '',
            replyMMSFile: null,
            status: STATUS[0].options[0],
            selectedClient: null,
            validity: VALIDITY[0].options[0],
            price: '',
            isAdding: false,
        };
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
    }

    handleSelectChange = (name, selectedOption) => {
        this.setState({ [name]: selectedOption });
    }

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }
    
    handleFileChange = (e) => {
        this.setState({ replyMMSFile: e.target.files[0] });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        // Simple client-side validation placeholder since validation library is removed
        if (!this.state.title || !this.state.keywordName || !this.state.price) {
            console.error("Validation Error: Please fill required fields.");
            return;
        }

        this.setState({ isAdding: true });
        // --- API Submission Placeholder ---
        const payload = {
            title: this.state.title,
            keywordName: this.state.keywordName,
            status: this.state.status.value,
            // ... rest of state
        };
        console.log("Submitting new keyword:", payload);

        setTimeout(() => {
            console.log("Keyword added successfully!");
            this.setState({ isAdding: false, title: '', keywordName: '', price: '' }); // Resetting some fields
        }, 1500);
        // --- End API Submission Placeholder ---
    }


    render() {
        const { 
            title, keywordName, replyText, replyVoice, status, 
            selectedClient, price, validity, isAdding, replyMMSFile
        } = this.state;

        return (
            <Box sx={{ p: 3 }}>
                <Box className="page-title-box" sx={{ mb: 3 }}>
                    <Typography variant="h4">ADD NEW KEYWORD</Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} lg={6}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3 }}>ADD NEW KEYWORD</Typography>

                            <Box component="form" onSubmit={this.handleSubmit} noValidate>
                                
                                {/* TITLE */}
                                <TextField
                                    name="title"
                                    label="TITLE"
                                    type="text"
                                    fullWidth
                                    required
                                    margin="normal"
                                    value={title}
                                    onChange={this.handleInputChange}
                                />
                                {/* KEYWORD NAME */}
                                <TextField
                                    name="keywordName"
                                    label="KEYWORD NAME"
                                    type="text"
                                    fullWidth
                                    required
                                    margin="normal"
                                    value={keywordName}
                                    onChange={this.handleInputChange}
                                />
                                {/* REPLY TEXT FOR RECIPIENT (Textarea) */}
                                <TextField
                                    name="replyText"
                                    label="REPLY TEXT FOR RECIPIENT"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    margin="normal"
                                    value={replyText}
                                    onChange={this.handleInputChange}
                                />
                                {/* REPLY VOICE FOR RECIPIENT (Textarea) */}
                                <TextField
                                    name="replyVoice"
                                    label="REPLY VOICE FOR RECIPIENT"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    margin="normal"
                                    value={replyVoice}
                                    onChange={this.handleInputChange}
                                />
                                {/* REPLY MMS FOR RECIPIENT (File Input) */}
                                <Box sx={{ my: 2 }}>
                                    <InputLabel shrink>REPLY MMS FOR RECIPIENT</InputLabel>
                                    <TextField
                                        name="replyMMSFile"
                                        type="file"
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        onChange={this.handleFileChange}
                                        sx={{ mt: 1 }}
                                    />
                                    {replyMMSFile && (
                                        <Typography variant="caption" color="textPrimary">Selected: {replyMMSFile.name}</Typography>
                                    )}
                                </Box>
                                

                                {/* STATUS (react-select) */}
                                <InputLabel shrink sx={{ mt: 2, mb: 0.5 }}>STATUS</InputLabel>
                                <Select
                                    name="status"
                                    value={status}
                                    onChange={(opt) => this.handleSelectChange('status', opt)}
                                    options={STATUS}
                                    placeholder="Select Status"
                                />

                                {/* SELECT CLIENT (react-select) */}
                                <InputLabel shrink sx={{ mt: 2, mb: 0.5 }}>SELECT CLIENT</InputLabel>
                                <Select
                                    name="selectedClient"
                                    value={selectedClient}
                                    onChange={(opt) => this.handleSelectChange('selectedClient', opt)}
                                    options={CLIENT_GROUP}
                                    placeholder="Select Client"
                                />
                                
                                {/* PRICE */}
                                <TextField
                                    name="price"
                                    label="PRICE"
                                    type="number"
                                    fullWidth
                                    required
                                    margin="normal"
                                    value={price}
                                    onChange={this.handleInputChange}
                                />

                                {/* VALIDITY (react-select) */}
                                <InputLabel shrink sx={{ mt: 2, mb: 0.5 }}>VALIDITY</InputLabel>
                                <Select
                                    name="validity"
                                    value={validity}
                                    onChange={(opt) => this.handleSelectChange('validity', opt)}
                                    options={VALIDITY}
                                    placeholder="Select Validity"
                                />

                                {/* Submission Button */}
                                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
                                    <MuiButton 
                                        type="submit" 
                                        variant="contained" 
                                        color="primary" 
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
                </Grid>
            </Box>
        );
    }
}

export default connect(null, { activateAuthLayout })(AddNewKeywoard);