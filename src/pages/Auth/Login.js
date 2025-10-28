import React, { Component } from 'react';
import { Alert, Col, Row, Card } from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { loginUserSuccessful, updateSmsBalance } from '../../store/actions';
import { apiError } from '../../store/auth/login/actions';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { Button } from 'antd';
import Settings from '../../utils/ServerSettings'

// AUTH related methods
import { setLoggeedInUser } from '../../helpers/authUtils';

class Pageslogin extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            loading: false,
            username: "", 
            password: "",
            buttonLabel: "Log In",
        }
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount(){
        //add login background image class
        // document.body.classList.add('login-bg');
    }


    handleSubmit(event, values) {
        // this.setState({buttonLabel: 'Please Wait...'});
        // this.props.checkLogin(values.username, values.password, this.props.history);
        this.setState({loading: true});
        
        this.checkCredentials(values);
    }
    
    checkCredentials(values){
        var raw = JSON.stringify({"password": values.password,"username": values.username});
        var requestOptions = {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: raw,
            redirect: 'follow'
        };
        
        fetch(Settings.CLIENT_MICRO_SERVER+"auth/login/", requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log(data);
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
                console.log('login....');
                //save user data in localstorage
                data.response.sessionToken = data.sessionToken; 

                // if(data.response.userType !== "SUPER_ADMIN"){
                //     // this.props.updateSmsBalance(data.response.wallet.closingCredit);
                // }else{
                //     this.props.updateSmsBalance(0);
                // }
                
                setLoggeedInUser(data.response);
                
                //mutate state
                loginUserSuccessful(data.response);

                // document.body.classList.remove('login-bg');

                //new route
                this.props.history.push('/dashboard');

              })
              .catch(error => {
                console.log('error', error);
                this.props.apiError(['Username / password are invalid. Please enter correct username / password']);
                this.setState({loading: false})
              });
    }


    render() {

        return (
            <React.Fragment>

                <div className="container-fluid p-0" style={{backgroundColor: '#f9f9f9'}}>

                    <div className="row">
                        <div className="col-sm-12 col-md-7 hide-sm">
                            <div style={{padding: '3rem'}}>
                                <img style={{maxWidth: '75%'}} alt="bg" src="/images/login.png" className="img-fluid" />
                            </div>
                        </div>
                        <div className="col-sm-12 col-md-4">
                            <h3 style={{marginTop: '4rem',marginLeft: 16}}><b>Sign in</b></h3>

                            <Card className="overflow-hidden account-card mx-3 mt-4">

                                {this.props.user && <Alert className="mb-0 p-3" color="success">
                                            Your Login is successfull.</Alert>}

                                    {this.props.loginError && <Alert className="mb-0 p-3" color="danger">
                                        {this.props.loginError}</Alert>}


                                    <AvForm className="form-horizontal" onValidSubmit={this.handleSubmit} >
                                        
                                        <div className="account-card-content" style={{padding: '20px 20px 0px 20px'}}>
                                            <AvField name="username" label="Username" value={this.state.username} placeholder="Enter Username" type="text" required />
                                            
                                            <AvField name="password" label="Password" value={this.state.password} placeholder="Enter Password" type="password" required />
                                        
                                        </div>
                                        <div className="p-4">

                                            <Row className="">
                                                <Col sm="12" className="text-right ">
                                                    <Button style={{height: 45}} loading={this.state.loading} type="primary" block htmlType="submit">{this.state.buttonLabel}</Button>
                                                </Col>
                                            </Row>

                                            <Row className="">
                                                <Col md="12" className="text-center mt-2">
                                                    <Link to="/forget-password"><i className="mdi mdi-lock"></i> Forgot your password?</Link>
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

const mapStatetoProps = state => {
    const { user, loginError, loading } = state.Login;
    return { user, loginError, loading };
}

export default withRouter(connect(mapStatetoProps, { apiError, updateSmsBalance })(Pageslogin));



