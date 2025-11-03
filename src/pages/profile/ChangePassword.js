import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Button } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';

// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {ServerApi} from '../../utils/ServerApi';
// import {getLoggedInUser} from '../../helpers/authUtils';

// --- KEY CHANGES (IMPORTS) ---
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated
import Swal from 'sweetalert2'; // ADDED: Modern Alert Library
import withReactContent from 'sweetalert2-react-content'; // ADDED: React wrapper
// --- END KEY CHANGES ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

class ChangePassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed, as SweetAlert2 is called imperatively
            // success_msg: false,
            // success_message: '',
            // modalType:'success',
            // --- END KEY CHANGE ---
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
            
            // This logic was already good and uses your modern openSnack
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
            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({success_msg: true, modalType:'error', success_message : 'Invalid Current Password', isAdding: false}); // REMOVED
            this.setState({ isAdding: false });
            MySwal.fire({
                title: 'Error!',
                text: 'Invalid Current Password or a server error occurred.',
                icon: 'error'
            });
            // --- END KEY CHANGE ---
          });
    }

    render() {

        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (All JSX in render() remains unchanged, EXCEPT for the SweetAlert block) ... */}

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
                                    <FormControl onValidSubmit={this.changePassword} ref={c => (this.form = c)}>
                                        {/* ... (All FormControl fields remain unchanged) ... */}
                                    </FormControl>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    {/* --- KEY CHANGE (SWEETALERT BLOCK DELETED) --- */}
                    {/* The old <SweetAlert> component was deleted from here.
                        It is now triggered as a function call in the 'changePassword' catch block. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert ... >
                        </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}

                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout, openSnack })(ChangePassword);