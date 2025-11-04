import React, { Component } from 'react';
// REMOVED: import { Button, Card, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import logosm from '../../images/logo.png';
import { forgetUser } from '../../store/actions';

// --- MUI & Core Imports ---
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    TextField, 
    Button as MuiButton 
} from '@mui/material';
// --- END MUI Imports ---

class ForgetPassword extends Component {

    constructor(props) {
        super(props);
        this.state = { username: "" };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange = (e) => {
        this.setState({ username: e.target.value });
    };

    handleSubmit(event) {
        event.preventDefault();
        
        const { username } = this.state;
        
        if (username.trim() === "") {
            // In a real app, you would show a snackbar or alert for validation failure.
            console.error("Email is required.");
            return;
        }

        // Call the Redux action
        this.props.forgetUser(username, this.props.history);
    }

    render() {
        // Simple inline style to replace wrapper-page and center the content
        const pageStyle = {
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f8f9fa' 
        };

        return (
            <Box sx={pageStyle}>
                <Paper elevation={4} sx={{ width: 360, borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                    {/* Header */}
                    <Box sx={{ 
                        backgroundColor: 'primary.main', 
                        p: 4, 
                        color: 'white', 
                        textAlign: 'center',
                        backgroundImage: 'linear-gradient(to right, #4CAF50, #8BC34A)', // Added a mock gradient
                    }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>Forget password ?</Typography>
                        <Link to="/" style={{ display: 'inline-block' }}>
                            {/* Replaced img with Box for logo placeholder */}
                            <Box sx={{ height: 24, width: 72, backgroundColor: 'white', borderRadius: 1, mx: 'auto' }}>
                                {/* You should place your actual logo component/image here */}
                            </Box>
                        </Link>
                    </Box>
                    
                    {/* Form Content */}
                    <Box sx={{ p: 3 }}>
                        <Box component="form" onSubmit={this.handleSubmit} noValidate>
                            <TextField 
                                name="username" 
                                label="Email" 
                                placeholder="Enter Email" 
                                type="email" 
                                fullWidth 
                                required 
                                margin="normal"
                                value={this.state.username}
                                onChange={this.handleInputChange}
                                size="small"
                            />

                            <Box sx={{ mt: 3, textAlign: 'right' }}>
                                {this.props.loading ? (
                                    <MuiButton variant="contained" color="primary" disabled>
                                        Loading ...
                                    </MuiButton>
                                ) : (
                                    <MuiButton variant="contained" color="primary" type="submit">
                                        Reset
                                    </MuiButton>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2">
                        Remember It ? 
                        <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 500, marginLeft: 4 }}>
                            Sign In here
                        </Link>
                    </Typography>
                </Box>
            </Box>
        );
    }
}

const mapStatetoProps = state => {
    const { user, loginError, loading } = state.Forget;
    return { user, loginError, loading };
}

export default connect(mapStatetoProps, { forgetUser })(ForgetPassword);
