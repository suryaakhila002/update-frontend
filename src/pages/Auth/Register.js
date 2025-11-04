import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { registerUser, emptyError } from '../../store/actions';
import logosm from '../../images/logo.png';

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


class Register extends Component { // Renamed from Pagesregister

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            username: "",
            password: "",
            loading: false,
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.loading !== prevProps.loading) {
            this.setState({ loading: this.props.loading });
        }
    }

    handleInputChange = e => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };

    handleSubmit(event) {
        event.preventDefault();
        const { email, username, password } = this.state;
        
        if (!username.trim() || !email.trim() || !password.trim()) {
            this.props.emptyError('All fields are required.');
            return;
        }

        // Dispatch Redux action with local state values
        this.props.registerUser({ username, email, password }, this.props.history);
    }


    render() {
        const { loading } = this.state;

        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7f6' }}>

                <Paper elevation={8} sx={{ width: '90%', maxWidth: 400, borderRadius: 2, overflow: 'hidden' }}>

                    {/* Header */}
                    <Box sx={{ backgroundColor: 'primary.main', p: 4, color: 'white', textAlign: 'center', position: 'relative', bgcolor: '#007bff' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>Free Register</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>Get your free account now.</Typography>
                        <Link to="/" className="logo logo-admin">
                            <Box component="img" src={logosm} height="24" alt="logo" sx={{ display: 'inline-block' }} />
                        </Link>
                    </Box>
                    
                    {/* Form Content */}
                    <Box sx={{ p: 3 }}>
                        
                        {/* Alerts */}
                        {this.props.user && (
                            <MuiAlert severity="success" sx={{ mb: 2 }}>
                                Registration Done Successfully.
                            </MuiAlert>
                        )}
                        {this.props.registrationError && (
                            <MuiAlert severity="error" sx={{ mb: 2 }}>
                                {this.props.registrationError}
                            </MuiAlert>
                        )}

                        <Box component="form" onSubmit={this.handleSubmit} noValidate>
                            
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
                            />
                            
                            {/* Email Field */}
                            <TextField 
                                name="email" 
                                label="Email" 
                                placeholder="Enter Email" 
                                type="email" 
                                fullWidth 
                                required 
                                margin="normal"
                                value={this.state.email}
                                onChange={this.handleInputChange}
                                disabled={loading}
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
                            />

                            <Box sx={{ mt: 3, mb: 2, textAlign: 'right' }}>
                                <MuiButton 
                                    variant="contained" 
                                    color="primary" 
                                    type="submit" 
                                    disabled={loading}
                                    sx={{ minWidth: 100 }}
                                >
                                    {loading ? 'Loading ...' : 'Register'}
                                </MuiButton>
                            </Box>

                            <Box sx={{ mt: 1, mb: 0 }}>
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                                    By registering you agree to our <Link to="#" style={{ color: '#007bff', textDecoration: 'none' }}>Terms of Use</Link>
                                </Typography>
                            </Box>

                        </Box>

                    </Box>

                </Paper>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="textPrimary">
                        Already have an account ? <Link to="/login" style={{ color: '#007bff', fontWeight: 500, textDecoration: 'none' }}> Login </Link>
                    </Typography>
                </Box>

            </Box>
        );
    }
}

const mapStatetoProps = state => {
    const { user, registrationError, loading } = state.Account;
    return { user, registrationError, loading };
}

export default connect(mapStatetoProps, { registerUser, emptyError })(Register);
