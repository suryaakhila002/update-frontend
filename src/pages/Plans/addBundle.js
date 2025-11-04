import React, { Component } from 'react';
// REMOVED: reactstrap imports
import { activateAuthLayout } from '../../store/actions';
// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { ServerApi } from '../../utils/ServerApi';
import { getLoggedInUser } from '../../helpers/authUtils';

// --- MUI & Core Imports ---
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    TextField, 
    Button as MuiButton,
    InputLabel,
    FormControl,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
// --- END MUI Imports ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

// Mock Constants (Defined here as they were used in the original component context)
const GST_TYPE = [
    { label: 'Exclusive', value: 'Exclusive' },
    { label: 'Inclusive', value: 'Inclusive' },
];

class AddBundle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: [
                { id: 0, unitFrom: '', unitTo: '', price: '' } // Initial default row
            ],
            planName: '',
            gst_type: GST_TYPE[0],
            
            isAdding: false,
            modal_delete: false,
            delete_sid: '',
            isDeleting: false,
            isLoading: false, // Set to false since no initial data load shown
        };
        this.addBundle = this.addBundle.bind(this);
        this.handleRowChange = this.handleRowChange.bind(this);
        this.handlePlanNameChange = this.handlePlanNameChange.bind(this);
    }

    handlePlanNameChange = (e) => {
        this.setState({ planName: e.target.value });
    }

    handleRowChange = (e, id, field) => {
        const { value } = e.target;
        this.setState(prevState => ({
            rows: prevState.rows.map(row => 
                row.id === id ? { ...row, [field]: value } : row
            )
        }));
    }

    handleAddRow = () => {
        const newId = this.state.rows.length > 0 ? Math.max(...this.state.rows.map(r => r.id)) + 1 : 0;
        const newItem = {
            id: newId,
            unitFrom: '',
            unitTo: '',
            price: ''
        };
        this.setState({
            rows: [...this.state.rows, newItem]
        });
    };

    handleRemoveRow = (id) => {
        this.setState(prevState => ({
            rows: prevState.rows.filter(row => row.id !== id)
        }));
    };

    componentDidMount() {
        this.props.activateAuthLayout();
    }

    // New MUI form submission handler
    handleSubmit = (e) => {
        e.preventDefault();

        // Basic client-side validation
        if (!this.state.planName.trim()) {
            MySwal.fire({ title: 'Error!', text: 'Please enter a Plan Name.', icon: 'error' });
            return;
        }

        const bundles = this.state.rows.map(row => ({
            endingUnit: row.unitTo,
            startingUnit: row.unitFrom,
            price: row.price
        }));

        if (bundles.some(b => !b.endingUnit || !b.startingUnit || !b.price)) {
            MySwal.fire({ title: 'Error!', text: 'All bundle fields must be filled.', icon: 'error' });
            return;
        }

        // Call the original addBundle logic
        this.addBundle(e, { planName: this.state.planName }, bundles);
    }

    // Updated original logic using controlled inputs and new payload structure
    addBundle(event, values, bundles){
        this.setState({isAdding: true});

        var raw = {
            bundles: bundles,
            creatorId: getLoggedInUser().id,
            planName: values.planName
        };

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).post("api/v1/pricing/bundle/create", raw)
        .then(res => {
            
            if (res.data === undefined || res.data.id === '') {
                this.setState({ isAdding: false });
                let message = res.data?.message || 'An unknown error occurred.';
                MySwal.fire({
                    title: 'Error!',
                    text: message,
                    icon: 'error'
                });
                return false;
            }
            
            this.setState({ isAdding: false });
            MySwal.fire({
                title: 'Plan Created!',
                icon: 'success'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Redirect after success
                    this.props.history.push('/viewBundlePlan');
                }
            });

            // Clear the form after submission (assuming success)
            this.setState({ planName: '', rows: [{ id: 0, unitFrom: '', unitTo: '', price: '' }] });

        })
        .catch(error => {
            console.log('error', error);
            this.setState({ isAdding: false });
            MySwal.fire('Error!', 'An unknown error occurred.', 'error');
        });
    }

    render() {
        const { rows, planName, isAdding } = this.state;

        // Helper component for rendering a single bundle row using MUI Grid
        const BundleRow = ({ row, idx, handleRemove }) => (
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }} key={row.id}>
                <Grid item xs={12} sm={3}>
                    <TextField
                        name={`unitFrom-${row.id}`}
                        label="UNIT FROM"
                        type="number"
                        fullWidth
                        required
                        value={row.unitFrom}
                        onChange={(e) => this.handleRowChange(e, row.id, 'unitFrom')}
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <TextField
                        name={`unitTo-${row.id}`}
                        label="UNIT TO"
                        type="number"
                        fullWidth
                        required
                        value={row.unitTo}
                        onChange={(e) => this.handleRowChange(e, row.id, 'unitTo')}
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        name={`price-${row.id}`}
                        label="PRICE"
                        type="number"
                        fullWidth
                        required
                        value={row.price}
                        onChange={(e) => this.handleRowChange(e, row.id, 'price')}
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <MuiButton 
                        onClick={() => handleRemove(row.id)} 
                        variant="outlined" 
                        color="error"
                        size="small"
                        disabled={rows.length === 1} // Disable removal if only one row remains
                        sx={{ mt: 1 }}
                    >
                        <DeleteIcon fontSize="small" />
                    </MuiButton>
                </Grid>
            </Grid>
        );

        return (
            <Box sx={{ p: 3 }}>
                <Box className="page-title-box" sx={{ mb: 3 }}>
                    <Typography variant="h4">Add Bundle Plan</Typography>
                </Box>

                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} md={8}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3 }}>Add Bundle Plan</Typography>

                            <Box component="form" onSubmit={this.handleSubmit} noValidate>
                                
                                {/* Plan Name */}
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    <Grid item xs={12} sm={10}>
                                        <TextField 
                                            name="planName" 
                                            label="PLAN NAME"
                                            type="text" 
                                            fullWidth
                                            required
                                            value={planName}
                                            onChange={this.handlePlanNameChange}
                                            size="small"
                                        />
                                    </Grid>
                                </Grid>

                                {/* Dynamic Bundle Rows */}
                                <Box sx={{ border: '1px solid #eee', p: 2, borderRadius: 1 }}>
                                    <InputLabel shrink sx={{ mb: 1, fontWeight: 'bold' }}>PRICE BUNDLES</InputLabel>
                                    {rows.map((row) => (
                                        <BundleRow 
                                            key={row.id} 
                                            row={row} 
                                            handleRemove={this.handleRemoveRow} 
                                        />
                                    ))}
                                </Box>
                                
                                {/* Add Row and Save Buttons */}
                                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                                    <MuiButton 
                                        onClick={this.handleAddRow} 
                                        variant="outlined" 
                                        color="info" 
                                        size="small"
                                        startIcon={<AddIcon />}
                                    >
                                        Add More
                                    </MuiButton>
                                    <MuiButton 
                                        type="submit" 
                                        variant="contained" 
                                        color="success" 
                                        size="small"
                                        startIcon={<SaveIcon />}
                                        disabled={isAdding}
                                    >
                                        {isAdding ? 'Saving...' : 'Save'}
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

export default connect(null, { activateAuthLayout })(AddBundle);
