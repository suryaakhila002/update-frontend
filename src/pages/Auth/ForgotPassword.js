import React, { Component } from 'react';
import { Col, Row, Card } from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { Button } from 'antd';
import { openSnack } from '../../store/actions';
import { connect } from 'react-redux';
import ForgotPasswordAnim from '../../components/Loading/ForgotPasswordAnim';
import Axios from 'axios';

class ForgotPassword extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            loading: false,
            isSending: false,
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
    }

    componentDidMount(){
        //add login background image class
        // document.body.classList.add('login-bg');
    }

    handleSubmit(event, values) {
        this.setState({isSending: true});

        let raw = {
            phone: values.phone,
            userName: values.username,
        }

        Axios.post('http://165.232.177.52:8090/auth/password/forgot', raw)
        .then(res=>{
            if(res.data.error !== undefined){
                this.setState({isSending: false});
                this.props.openSnack({type: 'error', message: res.data.error});
                return;
            }

            this.props.openSnack({type: 'success', message: 'OTP sent to the registered mobilr no.'})
            this.setState({otpSent: true, isSending: false})
            console.log(res.data)
        })
        .catch(e=>{
            console.log(e)
            this.setState({isSending: false})
            this.props.openSnack({type: 'error', message: 'Invalid Credentials.'})
        })
    }

    resetPassword(event, values) {
        this.setState({isSending: true});

        let raw = {
            phone: values.phone,
            userName: values.username,
            newPassword: values.confirmPassword,
            otp: values.otp,
        }

        Axios.post('http://165.232.177.52:8090/auth/password/change/by_otp', raw)
        .then(res=>{
            if(res.data.error !== undefined){
                this.setState({isSending: false});
                this.props.openSnack({type: 'error', message: res.data.error});
                return;
            }

            this.setState({isSending: false});
            this.props.openSnack({type: 'success', message: 'Password Changes successfully!'});
            setTimeout(()=>{
                this.props.history.push('/login')
            },2000)
        })
        .catch(e=>{
            this.setState({isSending: false})
            console.log(e)
            this.props.openSnack({type: 'error', message: 'Unable to change password.'})
        })
    }

    render() {

        return (
            <React.Fragment>

                <div className="container-fluid p-0" style={{backgroundColor: '#f9f9f9'}}>

                    <div className="row">
                        <div className="col-sm-12 col-md-7 hide-sm">
                            <div>
                                <ForgotPasswordAnim />
                                {/* <img style={{maxWidth: '75%'}} alt="bg" src="/images/login.png" className="img-fluid" /> */}
                            </div>
                        </div>
                        <div className="col-sm-12 col-md-4">
                            <h3 style={{marginTop: '4rem',marginLeft: 16}}><b>Forgot Password</b></h3>

                            <Card className="overflow-hidden account-card mx-3 mt-4">


                                    <AvForm className="form-horizontal" onValidSubmit={(this.state.otpSent)?this.resetPassword:this.handleSubmit} >
                                        
                                        <div className="account-card-content" style={{padding: '20px 20px 0px 20px'}}>
                                            <AvField disabled={this.state.otpSent} name="username" label="Username" placeholder="Enter Username" type="text" required />
                                            
                                            <AvField disabled={this.state.otpSent} name="phone" label="Phone" placeholder="Enter Phone No." required />

                                            {this.state.otpSent && (
                                                <><AvField name="otp" label="OTP" placeholder="Enter OTP" required />
                                                <AvField name="new_password" label="New Password" placeholder="Enter New Password" type="password" required />
                                                <AvField name="confirmPassword" label="Confirm Password" placeholder="Confirm Password" type="password" validate={{ required: { value: true }, match: { value: 'new_password' } }} /></>
                                            )}
                                        
                                        </div>
                                        <div className="p-4">

                                            <Row className="">
                                                <Col sm="12" className="text-right ">
                                                    <Button style={{height: 45}} loading={this.state.isSending} disabled={this.state.isSending} type="primary" block htmlType="submit">{(!this.state.isSending)?'Continue':'Please Wait...'}</Button>
                                                </Col>
                                            </Row>

                                            <Row className="">
                                                <Col md="12" className="text-center mt-2">
                                                    <Link to="/login"><i className="mdi mdi-lock"></i> Login?</Link>
                                                </Col>
                                            </Row>
                                        </div>
                                        
                                    </AvForm>
                                
                            </Card>
                        </div>
                    </div>


                    <div style={{backgroundColor: 'rgb(19 96 239)'}} class="py-11 position-relative" data-bg-img="/images/bg/03.png">
                        <div class="shape-1" style={{height: 150, overflow: 'hidden'}}>
                            <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{height: '100%', width: '100%'}}><path d="M0.00,49.98 C150.00,150.00 271.49,-50.00 500.00,49.98 L500.00,0.00 L0.00,0.00 Z" style={{stroke: 'none', fill: '#f9f9f9'}}></path></svg>
                        </div>
                    </div>


                    {/* <div className="m-t-40 text-center">
                        <p>Don't have an account ? <Link to="/register" className="font-500 text-primary"> Signup now </Link> </p>
                        <p>© {new Date().getFullYear()} Crafted with <i className="mdi mdi-heart text-danger"></i> by TechConductro</p>
                    </div> */}

                </div>
            </React.Fragment>
        );
    }
}

// const mapStatetoProps = state => {
//     const { user, loginError, loading } = state.Login;
//     return { user, loginError, loading };
// }

export default withRouter(connect(null,{openSnack})(ForgotPassword));


