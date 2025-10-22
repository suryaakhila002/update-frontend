import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Button } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {ServerApi} from '../../utils/ServerApi';
// import {getLoggedInUser} from '../../helpers/authUtils';
import SweetAlert from 'react-bootstrap-sweetalert';

class ChangePassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            success_msg: false,
            success_message: '',
            modalType:'success',
            isAdding: false,
        };

        this.changePassword = this.changePassword.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
    }

    changePassword(event, values){
        //API
        this.setState({isAdding: true});

        var raw = {
            newPassword: values.confirm_password,
            oldPassword: values.old_password,
        };

        ServerApi().post("client/password/change", raw)
          .then(res => {
            
            if (res.data.error !== undefined || res.data.status === 'NOT_FOUND') {
                this.props.openSnack({type: 'error', message: res.data.message})
                this.setState({isAdding: false});
                return false;
            }
            this.props.openSnack({type: 'success', message: 'Password Changed!'})
            this.setState({isAdding: false});

            this.form && this.form.reset();

          })
          .catch(error => {
            this.setState({success_msg: true, modalType:'error', success_message : 'Invalid Current Password', isAdding: false});
          });
    }

    render() {

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">

                            <Col sm="6">
                                <h4 className="page-title">Change Password</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="6">
                            <Card>
                                <CardBody>

                                    <AvForm onValidSubmit={this.changePassword} ref={c => (this.form = c)}>
                                        <AvField label="OLD PASSWORD" name="old_password" type="password"
                                            placeholder="Password" errorMessage="Enter old password"
                                            validate={{ required: { value: true } }} />

                                        <AvField label="NEW PASSWORD" name="new_password" type="password"
                                            placeholder="Password" errorMessage="Enter new password"
                                            validate={{ required: { value: true } }} />

                                        <AvField label="CONFIRM PASSWORD" name="confirm_password" type="password"
                                            placeholder="Re-type Password" errorMessage="Re-type Password"
                                            validate={{ required: { value: true }, match: { value: 'new_password' } }} />

                                        <FormGroup className="mb-0">
                                            <div>
                                                <Button 
                                                    type="submit" 
                                                    color="success"
                                                    disabled={this.state.isAdding} 
                                                    className="mr-1">
                                                    <i className="fa fa-save mr-2"></i>  {(this.state.isAdding)?'Please Wait...':'Save'}
                                                    </Button>{' '}
                                                <Button onClick={()=>this.props.history.push('/dashboard')} type="button" color="secondary">
                                                    Cancel
                                                </Button>
                                            </div>
                                        </FormGroup>

                                    </AvForm>

                                </CardBody>
                            </Card>
                        </Col>

                    </Row>

                    {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            type={this.state.modalType}
                            confirmBtnBsStyle={this.state.modalType}
                            onCancel={()=>this.setState({success_msg:false})}
                            showCloseButton={(this.state.modalType === 'success')?false:true}
                            showConfirm={(this.state.modalType === 'success')?true:false}
                            onConfirm={() => this.props.history.push('/allClients')} >
                        </SweetAlert> 
                    }

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, openSnack })(ChangePassword));