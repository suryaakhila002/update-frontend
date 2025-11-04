import React, { Component } from 'react';
// REMOVED: reactstrap imports
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select';
import { connect } from 'react-redux';
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    Button as MuiButton, 
    InputLabel, 
    TextField, 
    Checkbox, 
    FormControlLabel 
} from '@mui/material';

const CLIENT_GROUP_STATUS = [
    {
        label: "Status",
        options: [
            { label: "Active", value: "Active" },
            { label: "In Active", value: "In Active" }
        ]
    }
];

const SELECT_BOOLEAN = [
    {
        options: [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" }
        ]
    }
];

class ClientExportImport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: null, 
            clientGroupStatus: CLIENT_GROUP_STATUS[0].options[0].value,
            smsGateway: SELECT_BOOLEAN[0].options[0].value,
            resellerPanel: SELECT_BOOLEAN[0].options[0].value,
            apiAccess: SELECT_BOOLEAN[0].options[0].value,
            importFile: null,
            firstRowAsHeader: false,
            isImporting: false,
        };
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleImportSubmit = this.handleImportSubmit.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
    }
    
    // Select Handler for react-select
    handleSelectChange(name, selectedOption) {
        this.setState({ [name]: selectedOption.value });
    }

    handleFileChange(e) {
        this.setState({ importFile: e.target.files[0] });
    }

    handleCheckboxChange(e) {
        this.setState({ [e.target.name]: e.target.checked });
    }

    handleImportSubmit(e) {
        e.preventDefault();
        
        if (!this.state.importFile) {
            alert("Please select a file to import.");
            return;
        }

        this.setState({ isImporting: true });

        // Simulate API call and redirect/alert
        console.log("Importing file:", this.state.importFile.name);
        console.log("Settings:", this.state);

        setTimeout(() => {
            alert(`Import simulation complete for ${this.state.importFile.name}.`);
            this.setState({ isImporting: false, importFile: null });
        }, 2000);
    }

    render() {
        const { clientGroupStatus, smsGateway, resellerPanel, apiAccess, importFile, firstRowAsHeader, isImporting } = this.state;

        return (
            <Box sx={{ p: 3 }}>
                <Box className="page-title-box" sx={{ mb: 3 }}>
                    <Typography variant="h4">EXPORT AND IMPORT CLIENTS</Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Export Section (left column) */}
                    <Grid item xs={12} lg={4}>
                        <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                            <Box sx={{ mb: 3 }}>
                                <Grid container alignItems="center" spacing={1}>
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="body2" color="textSecondary">Export Clients :</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={8}>
                                        <MuiButton variant="contained" color="success" size="small" fullWidth={false}>
                                            Export Clients as CSV
                                        </MuiButton>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Grid container alignItems="center" spacing={1}>
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="body2" color="textSecondary">Sample File :</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={8}>
                                        <MuiButton variant="contained" color="primary" size="small" fullWidth={false}>
                                            Download Sample File
                                        </MuiButton>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Import Section (right column) */}
                    <Grid item xs={12} lg={8}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3 }}>IMPORT CLIENT</Typography>

                            <Box component="form" onSubmit={this.handleImportSubmit} noValidate>
                                
                                {/* Client Group Status */}
                                <Box sx={{ mb: 2 }}>
                                    <InputLabel shrink sx={{ mb: 0.5 }}>CLIENT GROUP STATUS</InputLabel>
                                    <Select
                                        className="MuiSelect-root-full-width"
                                        name="clientGroupStatus"
                                        value={clientGroupStatus}
                                        onChange={(opt) => this.handleSelectChange('clientGroupStatus', opt)}
                                        options={CLIENT_GROUP_STATUS}
                                    />
                                </Box>

                                {/* SMS GATEWAY */}
                                <Box sx={{ mb: 2 }}>
                                    <InputLabel shrink sx={{ mb: 0.5 }}>SMS GATEWAY</InputLabel>
                                    <Select
                                        className="MuiSelect-root-full-width"
                                        name="smsGateway"
                                        value={smsGateway}
                                        onChange={(opt) => this.handleSelectChange('smsGateway', opt)}
                                        options={SELECT_BOOLEAN}
                                    />
                                </Box>

                                {/* RESELLER PANEL */}
                                <Box sx={{ mb: 2 }}>
                                    <InputLabel shrink sx={{ mb: 0.5 }}>RESELLER PANEL</InputLabel>
                                    <Select
                                        className="MuiSelect-root-full-width"
                                        name="resellerPanel"
                                        value={resellerPanel}
                                        onChange={(opt) => this.handleSelectChange('resellerPanel', opt)}
                                        options={SELECT_BOOLEAN}
                                    />
                                </Box>

                                {/* API ACCESS */}
                                <Box sx={{ mb: 2 }}>
                                    <InputLabel shrink sx={{ mb: 0.5 }}>API ACCESS</InputLabel>
                                    <Select
                                        className="MuiSelect-root-full-width"
                                        name="apiAccess"
                                        value={apiAccess}
                                        onChange={(opt) => this.handleSelectChange('apiAccess', opt)}
                                        options={SELECT_BOOLEAN}
                                    />
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <InputLabel shrink sx={{ mb: 0.5 }}>IMPORT FILE *</InputLabel>
                                    <TextField
                                        name="importFile"
                                        type="file"
                                        fullWidth
                                        required
                                        variant="outlined"
                                        size="small"
                                        onChange={this.handleFileChange}
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ accept: ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" }}
                                    />
                                    {importFile && (
                                        <Typography variant="caption" color="textPrimary">Selected: {importFile.name}</Typography>
                                    )}
                                </Box>

                                <Box sx={{ mb: 2 }}>
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
                                
                                <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                                    IT WILL TAKE FEW MINUTES. PLEASE DO NOT RELOAD THE PAGE
                                </Typography>

                                {/* Submission Button */}
                                <MuiButton 
                                    type="submit" 
                                    variant="contained" 
                                    color="primary" 
                                    disabled={isImporting || !importFile}
                                    fullWidth
                                >
                                    {isImporting ? 'Importing...' : 'Import'}
                                </MuiButton>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    }
}

export default connect(null, { activateAuthLayout })(ClientExportImport);
