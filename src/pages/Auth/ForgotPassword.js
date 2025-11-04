import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { openSnack } from '../../store/actions';
import ForgotPasswordAnim from '../../components/Loading/ForgotPasswordAnim';
import Axios from 'axios';

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

class ForgotPassword extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            loading: false,
            isSending: false,
            otpSent: false, // Tracks if OTP has been sent
            username: '',
            phone: '',
            otp: '',
            newPassword: '',
            confirmPassword: '',
        }
        this.handleSubmit = this.handleSubmit.bind(this); // Send OTP
        this.resetPassword = this.resetPassword.bind(this); // Reset Password
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange = e => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };

    // Handler to initiate the OTP sending process
    handleSubmit(event) {
        event.preventDefault();
        const { phone, username } = this.state;
        
        if (!username.trim() || !phone.trim()) {
            this.props.openSnack({type: 'error', message: 'Username and Phone are required.'});
            return;
        }

        this.setState({isSending: true});
        
        let raw = {
            phone: phone,
            userName: username,
        }

        Axios.post('http://165.232.177.52:8090/auth/password/forgot', raw)
        .then(res=>{
            if(res.data.error !== undefined){
                this.setState({isSending: false});
                this.props.openSnack({type: 'error', message: res.data.error});
                return;
            }

            this.props.openSnack({type: 'success', message: 'OTP sent to the registered mobile no.'})
            this.setState({otpSent: true, isSending: false})
        })
        .catch(e=>{
            this.setState({isSending: false})
            this.props.openSnack({type: 'error', message: 'Invalid Credentials or server error.'})
        })
    }

    // Handler to perform the final password reset
    resetPassword(event) {
        event.preventDefault();
        const { phone, username, otp, newPassword, confirmPassword } = this.state;
        
        if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            this.props.openSnack({type: 'error', message: 'Please fill all password reset fields.'});
            return;
        }

        if (newPassword !== confirmPassword) {
             this.props.openSnack({type: 'error', message: 'New passwords must match.'});
             return;
        }

        this.setState({isSending: true});

        let raw = {
            phone: phone,
            userName: username,
            newPassword: confirmPassword, 
            otp: otp,
        }

        Axios.post('http://165.232.177.52:8090/auth/password/change/by_otp', raw)
        .then(res=>{
            if(res.data.error !== undefined){
                this.setState({isSending: false});
                this.props.openSnack({type: 'error', message: res.data.error});
                return;
            }

            this.setState({isSending: false});
            this.props.openSnack({type: 'success', message: 'Password changed successfully!'});
            setTimeout(()=>{
                this.props.history.push('/login')
            },2000)
        })
        .catch(e=>{
            this.setState({isSending: false})
            this.props.openSnack({type: 'error', message: 'Unable to change password.'})
        })
    }

    render() {
        const { otpSent, isSending } = this.state;
        
        // Determine which handler to use for form submission
        const currentHandler = otpSent ? this.resetPassword : this.handleSubmit;

        return (
            <Box sx={{backgroundColor: '#f9f9f9', minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
                <Grid container>
                    {/* Left Side: Animation */}
                    <Grid item xs={12} md={7} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Box sx={{ p: 4, pt: 8 }}>
                            <ForgotPasswordAnim />
                        </Box>
                    </Grid>

                    {/* Right Side: Form */}
                    <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h4" component="h3" sx={{ mt: { xs: 4, md: 8 }, mb: 2, ml: 2, fontWeight: 'bold', alignSelf: 'flex-start' }}>
                            Forgot Password
                        </Typography>

                        <Paper elevation={4} sx={{ width: '90%', maxWidth: 400, mx: 2, mt: 2 }}>
                            
                            <Box component="form" onSubmit={currentHandler} noValidate>
                                
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
                                        disabled={otpSent || isSending}
                                        size="small"
                                    />
                                    
                                    {/* Phone Field */}
                                    <TextField 
                                        name="phone" 
                                        label="Phone" 
                                        placeholder="Enter Phone No." 
                                        type="tel" 
                                        fullWidth 
                                        required 
                                        margin="normal"
                                        value={this.state.phone}
                                        onChange={this.handleInputChange}
                                        disabled={otpSent || isSending}
                                        size="small"
                                    />

                                    {/* Conditional Fields (OTP, New Password) */}
                                    {otpSent && (
                                        <>
                                            {/* OTP Field */}
                                            <TextField 
                                                name="otp" 
                                                label="OTP" 
                                                placeholder="Enter OTP" 
                                                type="number" 
                                                fullWidth 
                                                required 
                                                margin="normal"
                                                value={this.state.otp}
                                                onChange={this.handleInputChange}
                                                disabled={isSending}
                                                size="small"
                                            />
                                            {/* New Password Field */}
                                            <TextField 
                                                name="newPassword" 
                                                label="New Password" 
                                                placeholder="Enter New Password" 
                                                type="password" 
                                                fullWidth 
                                                required 
                                                margin="normal"
                                                value={this.state.newPassword}
                                                onChange={this.handleInputChange}
                                                disabled={isSending}
                                                size="small"
                                            />
                                            {/* Confirm Password Field */}
                                            <TextField 
                                                name="confirmPassword" 
                                                label="Confirm Password" 
                                                placeholder="Confirm Password" 
                                                type="password" 
                                                fullWidth 
                                                required 
                                                margin="normal"
                                                value={this.state.confirmPassword}
                                                onChange={this.handleInputChange}
                                                disabled={isSending}
                                                size="small"
                                            />
                                        </>
                                    )}
                                </Box>
                                
                                {/* Action Buttons */}
                                <Box sx={{ p: 4 }}>
                                    <MuiButton 
                                        style={{ height: 45 }} 
                                        variant="contained" 
                                        color="primary" 
                                        type="submit" 
                                        fullWidth
                                        disabled={isSending}
                                    >
                                        {isSending ? 'Please Wait...' : (otpSent ? 'Reset Password' : 'Continue')}
                                    </MuiButton>

                                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                                        <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
                                            <i className="mdi mdi-lock"></i> Login?
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

export default connect(null, { openSnack })(ForgotPassword);
