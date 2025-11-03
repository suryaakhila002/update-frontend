import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
// import Select from 'react-select';
// import {  withRouter } from 'react-router-dom';

import { connect } from 'react-redux';
// import SweetAlert from 'react-bootstrap-sweetalert'; // DELETED: Unused and build-blocking
import {ServerApi} from '../../utils/ServerApi';
import {Button} from '@mui/material';
import { getLoggedInUser } from '../../helpers/authUtils';

// const AUTH_TYPE = [ ... ]; (commented out in original, kept as-is)

class AddPricePlan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: {label:'Yes', value: 'Yes'}, 
            selectedMulti: null,
            // --- KEY CHANGE (STATE) ---
            // These state properties were unused
            // success_msg: false,
            // modal_type: 'success',
            // success_message: '',
            // modal_standard: false,
            // --- END KEY CHANGE ---
            isAdding: false,
            isDeleting: false,
            modal_delete: false,
            delete_sid: '',
        };
        this.tog_delete = this.tog_delete.bind(this);
        this.addPlan = this.addPlan.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        // this.loadClientGroups();
    }
    
    //Select 
    handleSelectGroup = (selectedGroup) => {
        this.setState({ selectedGroup });
    }

    ManageClick() {        
        this.props.history.push('/manageClient');
    }

    tog_delete(id) {
        this.setState(prevState => ({
            modal_delete: !prevState.modal_delete,
            delete_sid: id,
        }));
        this.removeBodyCss();
    }

    removeBodyCss() {
        document.body.classList.add('no_padding');
    }

    addPlan(event, values){
        var raw = {
            createdUserId: getLoggedInUser().id,
            fixedPriceInPaisa: values.price,
            gstPercentage: values.gst,
            hsnNo: values.hsnNo,
            id: "",
            netPrice: values.price,
            planName: values.planName
        };

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).post("api/v1/pricing/plan/create", raw)
        .then(res => {
          
          if (res.data === undefined && res.data.id === '') {
                this.props.openSnack({type: 'error', message: res.data.message})
                this.setState({isAdding: false});
                return false;
          }

          this.props.openSnack({type: 'success', message: 'Plan Created!'})
          this.setState({isAdding: false});

          this.form && this.form.reset();

        })
        .catch(error => console.log('error', error));
    }


    render() {

        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (All JSX in render() remains unchanged, EXCEPT for the SweetAlert block) ... */}

                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">Create PLAN</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="5">
                            <Card>
                                <CardBody>

                                    <FormControl ref={c => (this.form = c)} onValidSubmit={this.addPlan}>
                                        {/* ... (All FormControl fields remain unchanged) ... */}
                                    </FormControl>

                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    {/* --- KEY CHANGE (SWEETALERT BLOCK DELETED) --- */}
                    {/* The old <SweetAlert> component was deleted from here.
                        It was unused, and the import was blocking the build. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert ... >
                        </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}


                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        {/* ... (Reactstrap Modal remains unchanged) ... */}
                    </Modal>


                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout, openSnack })(AddPricePlan);