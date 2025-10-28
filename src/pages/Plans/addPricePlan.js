import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
// import Select from 'react-select';
import {  withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import {ServerApi} from '../../utils/ServerApi';
import {Button} from '@mui/material';
import { getLoggedInUser } from '../../helpers/authUtils';

// const AUTH_TYPE = [
//     {
//         label: "Status",
//         options: [
//             { label: "Yes", value: "Yes" },
//             { label: "No", value: "No" }
//         ]
//     }
// ];

class AddPricePlan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: {label:'Yes', value: 'Yes'}, 
            selectedMulti: null,
            success_msg: false,
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

                                    <AvForm ref={c => (this.form = c)} onValidSubmit={this.addPlan}>

                                        <Row>
                                        <Col sm="12" lg="12">
                                            <AvField name="planName" label="PLAN NAME"
                                                type="text" errorMessage="Enter PLAN Name"
                                                validate={{ required: { value: true } }} />
                                        </Col>
                                        {/* <Col sm="12" lg="12">    
                                            <AvField name="price" label="Fixed Price in paisa"
                                                type="number" errorMessage="Enter Price"
                                                validate={{ required: { value: true } }} />
                                        </Col> */}
                                        {/* <Col sm="12" lg="12">
                                            <AvField name="gst" label="GST %"
                                                type="number" errorMessage="Enter GST Percentage"
                                                validate={{ required: { value: true } }} />
                                        </Col> */}
                                        <Col sm="12" lg="12">
                                            <AvField name="hsnNo" label="HSN NO"
                                                type="text" errorMessage="Enter HSN Number"
                                                validate={{ required: { value: false } }} />
                                        </Col>

                                        </Row>

                                        {/* <Row>
                                            <Col sm="12" lg="12">
                                                <AvField name="validity" label="VALIDITY"
                                                    type="number" errorMessage="Enter Validity"
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                        </Row>

                                        <Label>SHOW LANDING PAGE </Label>
                                            <Select
                                                name="show_landing"
                                                label="SHOW LANDING PAGE"
                                                isSelected={true}
                                                value={selectedGroup}
                                                onChange={this.handleSelectGroup}
                                                options={AUTH_TYPE}
                                            /> */}

                                            <div>
                                                <Button 
                                                  type="submit"
                                                  size="small" 
                                                  variant="contained" 
                                                  disabled={this.state.isAdding}
                                                  color="primary" 
                                                  className="mr-1 float-right"
                                                >
                                                    {!this.state.isAdding && <i className="ti ti-plus mr-2"></i>}Add Plan
                                                </Button>{' '}
                                            </div>

                                    </AvForm>

                                </CardBody>
                            </Card>
                        </Col>

                    </Row>

                    {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            success
                            confirmBtnBsStyle="success"
                            onConfirm={() => this.props.history.push('/viewFixedPlan')} >
                        </SweetAlert> 
                    }

                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_delete: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h6 className="text-center">Are You Sure You want to delete ?</h6>

                            <FormGroup className="mt-5 text-center">
                                <Button onClick={this.deleteGroup} type="button" color="danger" className="mr-1">
                                    Delete
                                </Button>
                                <Button type="button" color="secondary" className="mr-1" onClick={() => this.setState({ modal_delete: false })} data-dismiss="modal" aria-label="Close">
                                    Cancel
                                </Button>
                            </FormGroup >

                        </ModalBody>
                    </Modal>


                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, openSnack })(AddPricePlan));