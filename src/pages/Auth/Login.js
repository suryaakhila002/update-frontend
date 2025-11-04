import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { loginUserSuccessful, updateSmsBalance } from '../../store/actions';
import { apiError } from '../../store/auth/login/actions';
import Settings from '../../utils/ServerSettings'

// AUTH related methods
import { setLoggeedInUser } from '../../helpers/authUtils';

// --- MUI & Core Imports ---
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    TextField, 
    Button as MuiButton,
    Alert as MuiAlert // Renamed to avoid conflict with reactstrap Alert
} from '@mui/material';
// --- END MUI Imports ---

class Login extends Component { // Renamed from Pageslogin

    constructor(props) {
        super(props);
        this.state = { 
            loading: false,
            username: "", 
            password: "",
            buttonLabel: "Log In",
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this); // New handler for MUI inputs
        this.checkCredentials = this.checkCredentials.bind(this);
    }

    componentDidMount(){
        // Ensure no leftover body classes are applied
        // document.body.classList.remove('login-bg');
    }

    handleInputChange = e => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };

    handleSubmit(event) {
        event.preventDefault();
        
        if (!this.state.username.trim() || !this.state.password.trim()) {
            this.props.apiError(['Username and password are required.']);
            return;
        }

        this.setState({loading: true});
        this.checkCredentials({ username: this.state.username, password: this.state.password });
    }
    
    checkCredentials(values){
        var raw = JSON.stringify({"password": values.password,"username": values.username});
        var requestOptions = {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: raw,
            redirect: 'follow'
        };
        
        // This is a direct API call, usually done in Redux actions, but mimicking original structure
        fetch(Settings.CLIENT_MICRO_SERVER+"auth/login/", requestOptions)
        .then(response => response.json())
        .then(data => {
            if (data.status === "UNAUTHORIZED") {
                this.props.apiError(['Your Account is Inactive please contact admin for support.']);
                this.setState({loading: false})
                return false;
            }

            if (data.status === false) {
                this.props.apiError(['Username / password are invalid. Please enter correct username / password']);
                this.setState({loading: false})
                return false;
            }
            
            // Save user data
            data.response.sessionToken = data.sessionToken; 
            setLoggeedInUser(data.response);
            
            // Mutate state / Dispatch Redux action
            this.props.loginUserSuccessful(data.response);
            
            // Navigate
            this.props.history.push('/dashboard');

        })
        .catch(error => {
            console.log('error', error);
            this.props.apiError(['Username / password are invalid. Please enter correct username / password']);
            this.setState({loading: false})
        });
    }


    render() {
        const { loading } = this.state;

        return (
            <Box sx={{backgroundColor: '#f9f9f9', minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
                <Grid container sx={{ flexGrow: 1 }}>
                    {/* Left Side: Illustration */}
                    <Grid item xs={12} md={7} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Box sx={{ p: 4, pt: 8 }}>
                            {/* Replaced Div with image for MUI Box */}
                            <Box sx={{ p: 3 }}>
                                <img style={{maxWidth: '75%', display: 'block', margin: 'auto'}} alt="bg" src="/images/login.png" className="img-fluid" />
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right Side: Form */}
                    <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h4" component="h3" sx={{ mt: { xs: 4, md: 8 }, mb: 2, ml: 2, fontWeight: 'bold', alignSelf: 'flex-start' }}>
                            Sign in
                        </Typography>

                        <Paper elevation={4} sx={{ width: '90%', maxWidth: 400, mx: 2, mt: 2 }}>
                            
                            {/* Success Alert */}
                            {this.props.user && (
                                <MuiAlert severity="success" sx={{ mb: 0, p: 1 }}>
                                    Your Login is successful.
                                </MuiAlert>
                            )}

                            {/* Error Alert */}
                            {this.props.loginError && (
                                <MuiAlert severity="error" sx={{ mb: 0, p: 1 }}>
                                    {this.props.loginError}
                                </MuiAlert>
                            )}
                            
                            <Box component="form" onSubmit={this.handleSubmit} noValidate>
                                
                                <Box sx={{ p: '20px 20px 0px 20px' }}>
                                    
                                    {/* Username Field */}
                                    <TextField 
                                        name="username" 
                                        label="Username" 
                                        placeholder="Enter Username" 
                                        type="text" 
                                        fullWidth 
                                        required 
                                        margin="normal"
                                        value={this.state.username}
                                        onChange={this.handleInputChange}
                                        disabled={loading}
                                        size="small"
                                    />
                                    
                                    {/* Password Field */}
                                    <TextField 
                                        name="password" 
                                        label="Password" 
                                        placeholder="Enter Password" 
                                        type="password" 
                                        fullWidth 
                                        required 
                                        margin="normal"
                                        value={this.state.password}
                                        onChange={this.handleInputChange}
                                        disabled={loading}
                                        size="small"
                                    />

                                </Box>
                                
                                {/* Action Buttons and Links */}
                                <Box sx={{ p: 4 }}>
                                    
                                    <MuiButton 
                                        style={{ height: 45 }} 
                                        variant="contained" 
                                        color="primary" 
                                        type="submit" 
                                        fullWidth
                                        disabled={loading}
                                    >
                                        {loading ? 'Please Wait...' : this.state.buttonLabel}
                                    </MuiButton>

                                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                                        <Link to="/forget-password" style={{ color: '#007bff', textDecoration: 'none' }}>
                                            <i className="mdi mdi-lock"></i> Forgot your password?
                                        </Link>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Footer Wave Shape */}
                <Box sx={{ 
                    mt: 'auto', 
                    height: 150, 
                    overflow: 'hidden', 
                    position: 'relative',
                    backgroundColor: 'rgb(19 96 239)' 
                }}>
                    <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{height: '100%', width: '100%'}}>
                        <path d="M0.00,49.98 C150.00,150.00 271.49,-50.00 500.00,49.98 L500.00,0.00 L0.00,0.00 Z" style={{stroke: 'none', fill: '#f9f9f9'}}></path>
                    </svg>
                </Box>
            </Box>
        );
    }
}

const mapStatetoProps = state => {
    const { user, loginError, loading } = state.Login;
    return { user, loginError, loading };
}

export default connect(mapStatetoProps, { loginUserSuccessful, apiError, updateSmsBalance })(Login);
