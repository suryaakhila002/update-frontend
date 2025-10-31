import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
// import Select from 'react-select';
import {ServerApi} from '../../utils/ServerApi';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import {getLoggedInUser} from '../../helpers/authUtils';

// --- KEY CHANGES (IMPORTS) ---
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated
import Swal from 'sweetalert2'; // ADDED: Modern Alert Library
import withReactContent from 'sweetalert2-react-content'; // ADDED: React wrapper
// --- END KEY CHANGES ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

// ... (Constants like GST_TYPE remain unchanged/commented)

class AddBundle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: [],
            gst_type: {label:'Exclusive', value: 'Exclusive'},
            
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed, as SweetAlert2 is called imperatively
            // success_msg: false,
            // modal_type: 'success',
            // success_message: '',
            // modal_standard: false,
            // --- END KEY CHANGE ---
            
            modal_delete: false,
            delete_sid: '',
            isDeleting: false,
            isLoading: true,
        };
        this.addBundle = this.addBundle.bind(this);
    }

    handleAddRow = () => {
        const item = {
            name: ""
        };
        this.setState({
            rows: [...this.state.rows, item]
        });
    };

    handleRemoveRow = () => {
        this.setState({
            rows: this.state.rows.slice(0, -1)
        });
    };

    componentDidMount() {
        this.props.activateAuthLayout();
    }

    addBundle(event, values){
        var bundles = [];

        // --- FIX: Loop should go up to and including the length ---
        // Original: this.state.rows.length
        // Corrected: this.state.rows.length + 1 (to include the 0th index item)
        // But since you start at 0, it should be <= length
        for (let index = 0; index <= this.state.rows.length; index++) {
            bundles.push(
                {
                    endingUnit: values["unitTo-"+index],
                    startingUnit: values["unitFrom-"+index],
                    price: values["price-"+index] // Added price
                }
            );
        }
        // --- END FIX ---

        var raw = {
            bundles: bundles,
            creatorId: getLoggedInUser().id,
            planName: values.planName
        };

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).post("api/v1/pricing/bundle/create", raw)
        .then(res => {
          
          if (res.data === undefined || res.data.id === '') { // Modified check
              // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
              // this.setState({success_msg: true, modalType:'error', success_message : res.data.message, isAdding: false}); // REMOVED
              this.setState({ isAdding: false });
              MySwal.fire({
                  title: 'Error!',
                  text: res.data.message,
                  icon: 'error'
              });
              // --- END KEY CHANGE ---
              return false;
          }
          
          // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
          // this.setState({success_msg: true, modalType:'success', success_message : "Plan Created!", isAdding: false}); // REMOVED
          this.setState({ isAdding: false });
          MySwal.fire({
              title: 'Plan Created!',
              icon: 'success'
          }).then((result) => {
              // This logic was in the old <SweetAlert> onConfirm prop
              if (result.isConfirmed) {
                  this.props.history.push('/viewBundlePlan');
              }
          });
          // --- END KEY CHANGE ---

          this.form && this.form.reset();

        })
        .catch(error => {
            console.log('error', error);
            this.setState({ isAdding: false });
            MySwal.fire('Error!', 'An unknown error occurred.', 'error');
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
                                <h4 className="page-title">Add Bundle Plan</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col md="8">
                            <Card>
                                <CardBody>
                                    <AvForm onValidSubmit={this.addBundle} ref={c => (this.form = c)}>
                                        {/* ... (All AvForm fields remain unchanged) ... */}
                                        <Row> 
                                            <Col lg="10" sm="12" className="mb-3">
                                                <AvField name="planName" label="PLAN NAME"
                                                    type="text" errorMessage="Enter PLAN NAME"
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                        </Row>
                                        <table style={{ width: "100%" }}>
                                            <tbody>
                                                <tr id="addr0" key="">
                                                    <td>
                                                        <div className="repeater">
                                                            <div data-repeater-list="group-a">
                                                                <Row data-repeater-item>
                                                                    <Col lg="3" className="form-group">
                                                                        <AvField name="unitFrom-0" label="UNIT FROM"
                                                                            type="number" errorMessage="Enter UNIT FROM"
                                                                            validate={{ required: { value: true } }} />
                                                                    </Col>
                                                                    <Col lg="3" className="form-group">
                                                                        <AvField name="unitTo-0" label="UNIT TO"
                                                                            type="number" errorMessage="Enter UNIT TO"
                                                                            validate={{ required: { value: true } }} />
                                                                    </Col>
                                                                    <Col lg="4" className="form-group">
                                                                        <AvField name="price-0" label="PRICE"
                                                                            type="number" errorMessage="Enter PRICE"
                                                                            validate={{ required: { value: true } }} />
                                                                    </Col>
                                                                    <Col lg="2" className="form-group align-self-center">
                                                                        <Button size="sm" onClick={this.handleRemoveRow} color="danger" className="mt-4"> <i className="fa fa-trash"></i>  </Button>
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {this.state.rows.map((item, idx) => (
                                                    <tr id="addr0" key={idx}>
                                                        <td>
                                                            <div className="repeater" encType="multipart/form-data">
                                                                <div data-repeater-list="group-a">
                                                                    <Row data-repeater-item>
                                                                        <Col lg="3" className="form-group">
                                                                            <AvField name={`unitFrom-${idx+1}`} label=""
                                                                                type="number" errorMessage="Enter UNIT FROM"
                                                                                validate={{ required: { value: true } }} />
                                                                        </Col>
                                                                        <Col lg="3" className="form-group">
                                                                            <AvField name={`unitTo-${idx+1}`} label=""
                                                                                type="number" errorMessage="Enter UNIT TO"
                                                                                validate={{ required: { value: true } }} />
                                                                        </Col>
                                                                        <Col lg="4" className="form-group">
                                                                            <AvField name={`price-${idx+1}`} label=""
                                                                                type="number" errorMessage="Enter PRICE"
                                                                                validate={{ required: { value: true } }} />
                                                                        </Col>
                                                                        <Col lg="2" className="form-group align-self-center">
                                                                            <Button size="sm" onClick={this.handleRemoveRow} color="danger" className="mt-3" ><i className="fa fa-trash"></i>  </Button>
                                                                        </Col>
                                                                    </Row>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        
                                        <Button size="sm" onClick={this.handleAddRow} color="info"><i className="fa fa-plus"></i> Add  More</Button>
                                        <Button size="sm" type="submit" color="success" className="ml-2"> <i className="fa fa-check mr-1"></i> Save </Button>
                                        
                                    </AvForm>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    {/* --- KEY CHANGE (SWEETALERT BLOCK DELETED) --- */}
                    {/* The old <SweetAlert> component is DELETED from the render method.
                        It is now triggered as a function call in the 'addBundle' method. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            confirmBtnBsStyle={this.state.modal_type}
                            onConfirm={() => this.props.history.push('/viewBundlePlan')} 
                            type={this.state.modal_type} >
                        </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(AddBundle));