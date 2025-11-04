import React, { Component } from 'react';
// REMOVED: { Container, Row, Col, Card, CardBody, FormGroup, Label, Button } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select'; // Retained for external select handling
import { connect } from 'react-redux';

// --- MUI & Core Imports ---
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    TextField, 
    Button as MuiButton, 
    InputLabel, 
    FormGroup,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
// --- END MUI Imports ---

// Mock Constants (Replaced reactstrap options structure)
const BOOLEAN_SELECT = [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" }
];

class KeywoardsSetting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedShowInClient: BOOLEAN_SELECT[0], 
            optInKeywords: '',
            optOutKeywords: '',
            customGatewaySuccess: '',
            isSaving: false,
        };
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        // Placeholder to load initial settings data
    }

    handleSelectChange = (name, selectedOption) => {
        this.setState({ [name]: selectedOption });
    }

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }
    
    handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation logic placeholder
        if (!this.state.selectedShowInClient) {
            console.error("Validation Error: Please select 'Show In Client'.");
            return;
        }

        this.setState({ isSaving: true });
        // --- API Submission Placeholder ---
        const payload = {
            showInClient: this.state.selectedShowInClient.value,
            optInKeywords: this.state.optInKeywords,
            optOutKeywords: this.state.optOutKeywords,
            customGatewaySuccess: this.state.customGatewaySuccess
        };
        console.log("Submitting keyword settings:", payload);

        setTimeout(() => {
            console.log("Settings updated successfully!");
            this.setState({ isSaving: false });
        }, 1500);
        // --- End API Submission Placeholder ---
    }

    render() {
        const { selectedShowInClient, optInKeywords, optOutKeywords, customGatewaySuccess, isSaving } = this.state;

        return (
            <Box sx={{ p: 3 }}>
                <Box className="page-title-box" sx={{ mb: 3 }}>
                    <Typography variant="h4">KEYWORD SETTINGS</Typography>
                </Box>

                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} lg={7}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3 }}>KEYWORD SETTINGS</Typography>

                            <Box component="form" onSubmit={this.handleSubmit} noValidate>
                                
                                {/* SHOW IN CLIENT (react-select) */}
                                <FormGroup sx={{ mb: 2 }}>
                                    <InputLabel shrink sx={{ mb: 0.5 }}>SHOW IN CLIENT</InputLabel>
                                    <Select
                                        name="selectedShowInClient"
                                        value={selectedShowInClient}
                                        onChange={(opt) => this.handleSelectChange('selectedShowInClient', opt)}
                                        options={BOOLEAN_SELECT}
                                        placeholder="Select Option"
                                    />
                                </FormGroup>

                                {/* OPT IN SMS KEYWORD (MUI TextField replaces AvField) */}
                                <TextField
                                    name="optInKeywords"
                                    label="OPT IN SMS KEYWORD"
                                    helperText="Insert keyword using comma (,)"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    margin="normal"
                                    value={optInKeywords}
                                    onChange={this.handleInputChange}
                                />
                                
                                {/* OPT OUT SMS KEYWORD (MUI TextField replaces AvField) */}
                                <TextField
                                    name="optOutKeywords"
                                    label="OPT OUT SMS KEYWORD"
                                    helperText="Insert keyword using comma (,)"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    margin="normal"
                                    value={optOutKeywords}
                                    onChange={this.handleInputChange}
                                />
                                
                                {/* CUSTOM GATEWAY SUCCESS RESPONSE STATUS (MUI TextField replaces AvField) */}
                                <TextField
                                    name="customGatewaySuccess"
                                    label="CUSTOM GATEWAY SUCCESS RESPONSE STATUS"
                                    helperText="Insert keyword using comma (,)"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    margin="normal"
                                    value={customGatewaySuccess}
                                    onChange={this.handleInputChange}
                                />

                                {/* Submission Button (MUI Button replaces reactstrap Button) */}
                                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
                                    <MuiButton 
                                        type="submit" 
                                        variant="contained" 
                                        color="success" 
                                        startIcon={<SaveIcon />}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Updating...' : 'Update'}
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

export default connect(null, { activateAuthLayout })(KeywoardsSetting);
