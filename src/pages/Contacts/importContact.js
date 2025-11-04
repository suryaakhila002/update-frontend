import React, { Component } from 'react';
// REMOVED: { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, ButtonGroup } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select'; // RETAINED: For advanced select functionality
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
    FormControlLabel, 
    Checkbox,
    ToggleButton, 
    ToggleButtonGroup 
} from '@mui/material';
// --- END MUI Imports ---

const CLIENT_GROUP_STATUS = [
    {
        label: "Status",
        options: [
            { label: "Active", value: "Active" },
            { label: "In Active", value: "In Active" }
        ]
    }
];

// Delimiters data structure for the ToggleButtonGroup
const DELIMITERS = [
    { label: 'AUTOMATIC', value: 'AUTO' },
    { label: ';', value: 'SEMICOLON' },
    { label: ',', value: 'COMMA' },
    { label: '|', value: 'PIPE' },
    { label: 'TAB', value: 'TAB' },
    { label: 'NEW LINE', value: 'NEWLINE' },
];

class ImportContact extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: null, // For select inputs
            cSelected: ['AUTO'], // For delimiter buttons (using value, not index)
            pasteNumbers: '',
            importFile: null,
            firstRowAsHeader: false,
            countryCode: null,
            importListInto: null,
            isImporting: false,
        };
        this.handleSelectGroup = this.handleSelectGroup.bind(this);
        this.handlePasteNumbersChange = this.handlePasteNumbersChange.bind(this);
        this.handleDelimiterChange = this.handleDelimiterChange.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleImportSubmit = this.handleImportSubmit.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        // Placeholder to load actual group/country data if API were available
    }

    // Select Handler for react-select
    handleSelectGroup = (name, selectedOption) => {
        this.setState({ [name]: selectedOption });
    }

    // Textarea Handler for pasting numbers
    handlePasteNumbersChange = (e) => {
        this.setState({ pasteNumbers: e.target.value });
    }

    // Delimiter Handler (replaces onCheckboxBtnClick)
    handleDelimiterChange = (event, newDelimiter) => {
        // Allow selection of multiple delimiters, similar to original ButtonGroup
        this.setState({ cSelected: newDelimiter });
    }

    // File Input Handler
    handleFileChange = (e) => {
        this.setState({ importFile: e.target.files[0] });
    }

    // Checkbox Handler
    handleCheckboxChange = (e) => {
        this.setState({ [e.target.name]: e.target.checked });
    }

    // Main Submission Handler
    handleImportSubmit = (e) => {
        e.preventDefault();
        this.setState({ isImporting: true });
        
        // --- Dummy Submission Logic ---
        const importMode = this.state.importFile ? 'File' : 'Paste';
        const payload = {
            mode: importMode,
            delimiter: this.state.cSelected,
            group: this.state.importListInto?.label || 'N/A',
        };

        console.log("Submitting import:", payload);

        setTimeout(() => {
            alert(`Import simulation started in ${importMode} mode.`);
            this.setState({ isImporting: false });
        }, 2000);
        // --- End Dummy Submission Logic ---
    }


    render() {

        const { selectedGroup, pasteNumbers, cSelected, importFile, firstRowAsHeader, isImporting } = this.state;

        return (
            <Box sx={{ p: 3 }}>
                <Box className="page-title-box" sx={{ mb: 3 }}>
                    <Typography variant="h4">IMPORT CONTACTS</Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* LEFT COLUMN: IMPORT CONTACT BY FILE (4/12) */}
                    <Grid item xs={12} lg={4}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            <Typography variant="h5" sx={{ mb: 2 }}>IMPORT CONTACT BY FILE</Typography>

                            <MuiButton variant="contained" color="primary" sx={{ mb: 3 }}>
                                Download Sample File
                            </MuiButton>

                            <Box component="form" onSubmit={this.handleImportSubmit} noValidate>
                                
                                {/* IMPORT NUMBERS (File Input) */}
                                <InputLabel shrink sx={{ mb: 0.5, mt: 1 }}>IMPORT NUMBERS (File)</InputLabel>
                                <TextField
                                    name="import_numbers"
                                    type="file"
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    required={!pasteNumbers} // Required if pasteNumbers is empty
                                    onChange={this.handleFileChange}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ accept: ".csv, .txt, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" }}
                                />
                                {importFile && (
                                    <Typography variant="caption" color="textPrimary">Selected: {importFile.name}</Typography>
                                )}

                                {/* FIRST ROW AS HEADER (Checkbox) */}
                                <Box sx={{ mt: 1, mb: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="firstRowAsHeader"
                                                checked={firstRowAsHeader}
                                                onChange={this.handleCheckboxChange}
                                                color="primary"
                                            />
                                        }
                                        label="FIRST ROW AS HEADER"
                                    />
                                </Box>

                                {/* COUNTRY CODE (react-select) */}
                                <InputLabel shrink sx={{ mb: 0.5 }}>COUNTRY CODE</InputLabel>
                                <Select
                                    className="MuiSelect-root-full-width mb-3"
                                    name="countryCode"
                                    value={this.state.countryCode}
                                    onChange={(opt) => this.handleSelectGroup('countryCode', opt)}
                                    options={CLIENT_GROUP_STATUS} // Using placeholder options
                                    placeholder="Select Country Code"
                                />

                                {/* IMPORT LIST INTO (react-select) */}
                                <InputLabel shrink sx={{ mb: 0.5 }}>IMPORT LIST INTO</InputLabel>
                                <Select
                                    className="MuiSelect-root-full-width mb-3"
                                    name="importListInto"
                                    value={this.state.importListInto}
                                    onChange={(opt) => this.handleSelectGroup('importListInto', opt)}
                                    options={CLIENT_GROUP_STATUS} // Using placeholder options
                                    placeholder="Select Group"
                                />

                                {/* Submission Button */}
                                <MuiButton 
                                    type="submit" 
                                    variant="contained" 
                                    color="success" 
                                    fullWidth
                                    disabled={isImporting || !importFile}
                                >
                                    {isImporting ? 'Importing File...' : 'Import'}
                                </MuiButton>

                            </Box>
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: IMPORT BY NUMBERS (8/12) */}
                    <Grid item xs={12} lg={8}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            <Typography variant="h5" sx={{ mb: 2 }}>IMPORT BY NUMBERS</Typography>

                            <Box component="form" onSubmit={this.handleImportSubmit} noValidate>
                                {/* COUNTRY CODE (react-select) */}
                                <InputLabel shrink sx={{ mb: 0.5 }}>COUNTRY CODE</InputLabel>
                                <Select
                                    className="MuiSelect-root-full-width mb-3"
                                    name="countryCode"
                                    value={this.state.countryCode}
                                    onChange={(opt) => this.handleSelectGroup('countryCode', opt)}
                                    options={CLIENT_GROUP_STATUS} // Using placeholder options
                                    placeholder="Select Country Code"
                                />

                                {/* PASTE NUMBERS (Textarea) */}
                                <InputLabel shrink sx={{ mb: 0.5 }}>PASTE NUMBERS</InputLabel>
                                <TextField
                                    name="paste_numbers"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    variant="outlined"
                                    value={pasteNumbers}
                                    onChange={this.handlePasteNumbersChange}
                                    required={!importFile} // Required if importFile is null
                                    sx={{ mb: 2 }}
                                />

                                {/* CHOOSE DELIMITER (ToggleButtonGroup) */}
                                <InputLabel shrink sx={{ mb: 0.5 }}>CHOOSE DELIMITER</InputLabel>
                                <ToggleButtonGroup
                                    value={cSelected}
                                    onChange={this.handleDelimiterChange}
                                    aria-label="text formatting"
                                    size="small"
                                    sx={{ flexWrap: 'wrap', mb: 3 }}
                                >
                                    {DELIMITERS.map((delimiter) => (
                                        <ToggleButton key={delimiter.value} value={delimiter.value} color="info">
                                            {delimiter.label}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                                
                                {/* IMPORT LIST INTO (react-select) */}
                                <InputLabel shrink sx={{ mb: 0.5 }}>IMPORT LIST INTO</InputLabel>
                                <Select
                                    className="MuiSelect-root-full-width mb-3"
                                    name="importListInto"
                                    value={this.state.importListInto}
                                    onChange={(opt) => this.handleSelectGroup('importListInto', opt)}
                                    options={CLIENT_GROUP_STATUS} // Using placeholder options
                                    placeholder="Select Group"
                                />

                                {/* Submission Button */}
                                <MuiButton 
                                    type="submit" 
                                    variant="contained" 
                                    color="success" 
                                    fullWidth
                                    disabled={isImporting || (!importFile && !pasteNumbers)}
                                >
                                    {isImporting ? 'Importing Numbers...' : 'Add'}
                                </MuiButton>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    }
}

export default connect(null, { activateAuthLayout })(ImportContact);
