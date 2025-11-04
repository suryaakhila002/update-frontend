import React, { Component } from 'react';
// REMOVED: reactstrap imports
import { activateAuthLayout, openSnack } from '../../store/actions';
import Select from 'react-select';
// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { ServerApi } from '../../utils/ServerApi';
import { getLoggedInUser } from '../../helpers/authUtils';

// --- MUI & Core Imports ---
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import AddIcon from '@mui/icons-material/Add';
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    TextField, 
    Button as MuiButton, 
    InputLabel, 
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    MenuItem
} from '@mui/material';
// --- END MUI Imports ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

// Constants (Converted for easy use/display)
const ACCOUNT_TYPE = [
    { label: "Prepaid", value: "PREPAID" },
    { label: "Postpaid", value: "POSTPAID" },
];
const CREDIT_DEDUCTION = [
    { label: "Submitted", value: "SUBMIT" },
    { label: "Delivery", value: "DELIVERY" },
];
const AUTH_TYPE = [
    { label: "Yes", value: true },
    { label: "No", value: false },
];
const USER_TYPE = [
    { label: "User", value: "CLIENT" },
    { label: "Reseller", value: "RESELLER" },
];
const SMS_PLAN = [
    { label: "Fixed Price", value: "Fixed" },
    { label: "Bundle Plan", value: "Bundle" },
];

class AdminCreateClients extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAdding: false,
            
            // Form Data
            name: '',
            email: '',
            phone: '',
            username: '',
            password: '',
            confirmPassword: '',
            credit_limit: 0,
            dropping_percentage: 0,
            
            // Select/Radio States (initialized to first option's value or sensible defaults)
            sms_plan: 'Fixed',
            account_type: 'PREPAID',
            user_type: 'CLIENT',
            credit_deduction: 'SUBMIT',
            dnd_return: false,
            admin_dropping: true, // Assuming default is Yes
            admin_dropping_access: true, // Assuming default is Yes
            templateBased: true, // Assuming default is Template based
            
            // API Data
            routes: [],
            priceBundles: [],
            fixedBundles: [],
            selectedFixedBundle: '',
            route: '',
            
            // Price Details
            fixedPrice: 0,
            
            // Validation
            passwordError: false,
        };

        // Bindings
        this.addNewClient = this.addNewClient.bind(this);
        this.loadRoutes = this.loadRoutes.bind(this);
        this.loadPriceBundles = this.loadPriceBundles.bind(this);
        this.loadFixedBundles = this.loadFixedBundles.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.handleRadioChange = this.handleRadioChange.bind(this);
    }
    
    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadRoutes();
        this.loadPriceBundles();
        this.loadFixedBundles();
    } 
    
    // --- Input Handlers ---
    handleInputChange(e) {
        const { name, value } = e.target;
        this.setState({ [name]: value });

        // Basic password validation check
        if (name === 'confirmPassword' || name === 'password') {
            setTimeout(() => {
                const { password, confirmPassword } = this.state;
                if (confirmPassword && password !== confirmPassword) {
                    this.setState({ passwordError: true });
                } else {
                    this.setState({ passwordError: false });
                }
            }, 100);
        }
    }

    handleSelectChange(name, selectedOption) {
        this.setState({ [name]: selectedOption.value });

        if (name === 'selectedFixedBundle') {
            const priceObj = this.state.fixedBundles.find(b => b.value === selectedOption.value);
            this.setState({ fixedPrice: priceObj ? priceObj.netPrice : 0 });
        }
    }

    handleRadioChange(e) {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }
    
    // --- API Loaders (Simplified) ---
    loadRoutes(){
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get("routes")
          .then(res => {
            if (res.data === undefined) { return false } 
            var arr = res.data.map(obj => ({ label: obj.routeName, value: obj.id, }))
            this.setState({routes: arr})
          })
          .catch(error => console.log('error', error));
    }

    loadPriceBundles(){
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(`api/v1/pricing/bundle/${getLoggedInUser().id}/all`)
          .then(res => {
            if (res.data === undefined) { return false } 
            var arr = res.data.map(obj => ({ label: obj.planName, value: obj.id, }))
            this.setState({priceBundles: arr})
          })
          .catch(error => console.log('error', error));
    }

    loadFixedBundles(){
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(`api/v1/pricing/price/${getLoggedInUser().id}/all`)
          .then(res => {
            if (res.data === undefined) { return false } 
            var arr = res.data.map(obj => ({ label: obj.planName, value: obj.id, netPrice: obj.netPrice, }))
            this.setState({fixedBundles: arr})
          })
          .catch(error => console.log('error', error));
    }

    // --- Submission Logic ---
    addNewClient(event){
        event.preventDefault(); 
        const { username, email, phone, password, confirmPassword, route, selectedFixedBundle, credit_deduction, passwordError } = this.state;

        if (passwordError) {
            this.props.openSnack({type: 'error', message: 'Passwords do not match.'});
            return false;
        }

        // Simplified validation check (can be expanded)
        if (!username || !email || !phone || !password || !route || !selectedFixedBundle || !credit_deduction) {
            this.props.openSnack({type: 'error', message: 'Please fill all required fields.'})
            return false;
        }

        this.setState({isAdding: true});

        const dto = {
            accountType: this.state.account_type,
            applyDndReturn: this.state.dnd_return,
            applyDropping: this.state.admin_dropping,
            bundlePriceApplicable: this.state.sms_plan === 'Bundle',
            bundlePriceId: this.state.selectedPriceBundle || 0, // Need selectedPriceBundle state/logic if 'Bundle' is chosen
            creatorId: getLoggedInUser().id,
            creditDeductionType: this.state.credit_deduction,
            creditLimit: this.state.account_type === 'POSTPAID' ? this.state.credit_limit : 0,
            droppingAccessApplicableToChild: this.state.admin_dropping_access,
            droppingPercentage: this.state.dropping_percentage,
            email: this.state.email,
            name: this.state.name,
            password: this.state.password,
            phoneNumber: this.state.phone,
            pricingId: this.state.selectedFixedBundle,
            routeIdList: [this.state.route],
            userType: this.state.user_type,
            username: this.state.username,
            templateBased: this.state.templateBased,
            // Assuming required fields from the original 'raw' object are mapped from state:
            // address, company, etc. are currently missing in state/form definition, but client details are minimal here.
        };

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).post("addClient", dto)
          .then(res => {
            if (res.data === undefined || res.data.id === undefined) {
                this.setState({isAdding: false});
                let message = res.data?.message || 'An unknown error occurred.';
                this.props.openSnack({type: 'error', message: message});
                return false;
            }

            this.props.openSnack({type: 'success', message: 'Client Added Successfully!'});
            
            MySwal.fire({
                title: 'Client Added!',
                text: 'The new client has been created successfully.',
                icon: 'success'
            }).then(() => {
                this.props.history.push('/allClients');
            });

            setTimeout(() => {
                this.setState({isAdding: false}); 
                this.props.history.push('/allClients')
            }, 800); 
          })
          .catch(error => {
              console.log('error', error);
              this.setState({isAdding: false});
              MySwal.fire({ 
                  title: 'Error!',
                  text: 'An error occurred while adding the client.',
                  icon: 'error'
              });
          });
    }
    

    render() {
        const { 
            name, email, phone, username, password, confirmPassword, passwordError, 
            account_type, user_type, credit_deduction, route, selectedFixedBundle, isAdding, 
            routes, fixedBundles, sms_plan, fixedPrice, credit_limit, dropping_percentage
        } = this.state;

        return (
            <Box sx={{ p: 3 }}>
                <Box className="page-title-box" sx={{ mb: 3 }}>
                    <Typography variant="h4">Add New Client</Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} lg={6}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            <Box component="form" onSubmit={this.addNewClient} noValidate>
                                
                                <Grid container spacing={2}>
                                    
                                    {/* Personal Info */}
                                    <Grid item xs={12}>
                                        <Typography variant="h6" sx={{ mb: 1 }}>Account Details</Typography>
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <TextField name="name" label="NAME" fullWidth required margin="none" 
                                            value={name} onChange={this.handleInputChange} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField name="email" label="EMAIL" type="email" fullWidth required margin="none" 
                                            value={email} onChange={this.handleInputChange} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField name="phone" label="PHONE NUMBER" fullWidth required margin="none" 
                                            value={phone} onChange={this.handleInputChange} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField name="username" label="USERNAME" fullWidth required margin="none" 
                                            value={username} onChange={this.handleInputChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField 
                                            name="password" 
                                            label="PASSWORD" 
                                            type="password" 
                                            fullWidth 
                                            required 
                                            margin="none"
                                            value={password} 
                                            onChange={this.handleInputChange} 
                                            error={passwordError}
                                            helperText={passwordError ? "Passwords must match." : ""}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField 
                                            name="confirmPassword" 
                                            label="CONFIRM PASSWORD" 
                                            type="password" 
                                            fullWidth 
                                            required 
                                            margin="none"
                                            value={confirmPassword} 
                                            onChange={this.handleInputChange}
                                            error={passwordError}
                                        />
                                    </Grid>

                                    {/* User Type */}
                                    <Grid item xs={12} sm={6}>
                                        <InputLabel shrink sx={{ mb: 0.5, mt: 1 }}>USER TYPE *</InputLabel>
                                        <Select
                                            className="MuiSelect-root-full-width"
                                            name="user_type"
                                            value={user_type}
                                            onChange={(opt) => this.handleSelectChange('user_type', opt)}
                                            options={USER_TYPE}
                                            required
                                        />
                                    </Grid>

                                    {/* Account Type */}
                                    <Grid item xs={12} sm={6}>
                                        <InputLabel shrink sx={{ mb: 0.5, mt: 1 }}>ACCOUNT TYPE *</InputLabel>
                                        <Select
                                            className="MuiSelect-root-full-width"
                                            name="account_type"
                                            value={account_type}
                                            onChange={(opt) => this.handleSelectChange('account_type', opt)}
                                            options={ACCOUNT_TYPE}
                                            required
                                        />
                                    </Grid>

                                    {/* Route Selection */}
                                    <Grid item xs={12}>
                                        <InputLabel shrink sx={{ mb: 0.5, mt: 1 }}>SMS ROUTE *</InputLabel>
                                        <Select
                                            className="MuiSelect-root-full-width"
                                            name="route"
                                            value={route}
                                            onChange={(opt) => this.handleSelectChange('route', opt)}
                                            options={routes}
                                            required
                                        />
                                    </Grid>
                                    
                                    {/* Pricing Section */}
                                    <Grid item xs={12}>
                                        <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>Pricing</Typography>
                                    </Grid>

                                    {/* SMS Plan Radio Group */}
                                    <Grid item xs={12}>
                                        <InputLabel shrink sx={{ mb: 0.5 }}>SMS PLAN *</InputLabel>
                                        <RadioGroup row name="sms_plan" value={sms_plan} onChange={this.handleRadioChange}>
                                            {SMS_PLAN.map(p => (
                                                <FormControlLabel key={p.value} value={p.value} control={<Radio size="small" />} label={p.label} />
                                            ))}
                                        </RadioGroup>
                                    </Grid>

                                    {/* Fixed Price Bundle */}
                                    {sms_plan === 'Fixed' && (
                                        <>
                                            <Grid item xs={12} sm={6}>
                                                <InputLabel shrink sx={{ mb: 0.5 }}>FIXED PRICE BUNDLE *</InputLabel>
                                                <Select
                                                    className="MuiSelect-root-full-width"
                                                    name="selectedFixedBundle"
                                                    value={selectedFixedBundle}
                                                    onChange={(opt) => this.handleSelectChange('selectedFixedBundle', opt)}
                                                    options={fixedBundles}
                                                    required
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField 
                                                    name="fixedPrice" 
                                                    label="Net Price (Per SMS)" 
                                                    fullWidth 
                                                    margin="none"
                                                    value={fixedPrice} 
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                        </>
                                    )}

                                    {/* Bundle Pricing Dropdown (Logic simplified here, only showing price bundles) */}
                                    {sms_plan === 'Bundle' && (
                                        <Grid item xs={12}>
                                            <InputLabel shrink sx={{ mb: 0.5 }}>PRICE BUNDLE *</InputLabel>
                                            <Select
                                                className="MuiSelect-root-full-width"
                                                name="selectedPriceBundle"
                                                // value={selectedPriceBundle} // State needed for this
                                                // onChange={(opt) => this.handleSelectChange('selectedPriceBundle', opt)}
                                                options={this.state.priceBundles}
                                                required
                                            />
                                        </Grid>
                                    )}

                                    {/* Credit Deduction Type */}
                                    <Grid item xs={12} sm={6}>
                                        <InputLabel shrink sx={{ mb: 0.5 }}>CREDIT DEDUCTION TYPE *</InputLabel>
                                        <Select
                                            className="MuiSelect-root-full-width"
                                            name="credit_deduction"
                                            value={credit_deduction}
                                            onChange={(opt) => this.handleSelectChange('credit_deduction', opt)}
                                            options={CREDIT_DEDUCTION}
                                            required
                                        />
                                    </Grid>

                                    {/* Postpaid Credit Limit */}
                                    {account_type === 'POSTPAID' && (
                                        <Grid item xs={12} sm={6}>
                                            <TextField 
                                                name="credit_limit" 
                                                label="CREDIT LIMIT" 
                                                type="number" 
                                                fullWidth 
                                                margin="none"
                                                value={credit_limit} 
                                                onChange={this.handleInputChange} 
                                                required 
                                            />
                                        </Grid>
                                    )}

                                    {/* Dropping Percentage */}
                                    <Grid item xs={12}>
                                        <TextField 
                                            name="dropping_percentage" 
                                            label="DROPPING PERCENTAGE" 
                                            type="number" 
                                            fullWidth 
                                            margin="none"
                                            value={dropping_percentage} 
                                            onChange={this.handleInputChange} 
                                        />
                                    </Grid>
                                </Grid>
                                
                                {/* Submission Button */}
                                <Box sx={{ mt: 3, mb: 0, display: 'flex', justifyContent: 'flex-end' }}>
                                    <MuiButton 
                                        type="submit"
                                        size="small" 
                                        variant="contained" 
                                        disabled={isAdding}
                                        startIcon={<AddIcon />}
                                        color="primary" 
                                    >
                                        {(isAdding)?'Please Wait...':'Add'}
                                    </MuiButton>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                    {/* Placeholder for optional second column (DLT registration/etc.) if needed */}
                    <Grid item xs={12} lg={6}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            <Typography variant="h6">Client Permissions</Typography>
                            <Box sx={{ mt: 2 }}>
                                <InputLabel shrink sx={{ mb: 0.5 }}>TEMPLATE BASED</InputLabel>
                                <RadioGroup row name="templateBased" value={this.state.templateBased} onChange={this.handleRadioChange}>
                                    {AUTH_TYPE.map(p => (
                                        <FormControlLabel key={p.value} value={p.value} control={<Radio size="small" />} label={p.label} />
                                    ))}
                                </RadioGroup>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <InputLabel shrink sx={{ mb: 0.5 }}>DND RETURN</InputLabel>
                                <RadioGroup row name="dnd_return" value={this.state.dnd_return} onChange={this.handleRadioChange}>
                                    {AUTH_TYPE.map(p => (
                                        <FormControlLabel key={p.value} value={p.value} control={<Radio size="small" />} label={p.label} />
                                    ))}
                                </RadioGroup>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <InputLabel shrink sx={{ mb: 0.5 }}>ADMIN DROPPING</InputLabel>
                                <RadioGroup row name="admin_dropping" value={this.state.admin_dropping} onChange={this.handleRadioChange}>
                                    {AUTH_TYPE.map(p => (
                                        <FormControlLabel key={p.value} value={p.value} control={<Radio size="small" />} label={p.label} />
                                    ))}
                                </RadioGroup>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
                {/* SweetAlert replacement handled imperatively in addNewClient */}
            </Box>
        );
    }
}

export default connect(null, { activateAuthLayout, openSnack })(AdminCreateClients);
