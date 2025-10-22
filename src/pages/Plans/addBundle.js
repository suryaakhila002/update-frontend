import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
// import Select from 'react-select';
import SweetAlert from 'react-bootstrap-sweetalert';
import {ServerApi} from '../../utils/ServerApi';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import {getLoggedInUser} from '../../helpers/authUtils';

// const GST_TYPE = [
//     {
//         label: "GST Type",
//         options: [
//             { label: "Inclusive", value: "Inclusive" },
//             { label: "Exclusive", value: "Exclusive" }
//         ]
//     }
// ];

class AddBundle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: [],
            gst_type: {label:'Exclusive', value: 'Exclusive'},
            success_msg: false,
            modal_type: 'success',
            success_message: '',
            modal_standard: false,
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

        if(this.state.rows.length > 0){
            for (let index = 0; index <= this.state.rows.length; index++) {
                bundles.push(
                    {
                        endingUnit: values["unitTo-"+index],
                        startingUnit: values["unitFrom-"+index],
                    }
                );
            }
        }

        var raw = {
            bundles: bundles,
            creatorId: getLoggedInUser().id,
            planName: values.planName
        };

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).post("api/v1/pricing/bundle/create", raw)
        .then(res => {
          
          if (res.data === undefined && res.data.id === '') {
              this.setState({success_msg: true, modalType:'error', success_message : res.data.message, isAdding: false});
              return false;
          }
          
          this.setState({success_msg: true, modalType:'success', success_message : "Plan Created!", isAdding: false});

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
                                <h4 className="page-title">Add Bundle Plan</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col md="8">
                            <Card>
                                <CardBody>

                                <AvForm onValidSubmit={this.addBundle} >

                                    <Row> 
                                        <Col lg="10" sm="12" className="mb-3">
                                            {/* <Label>PLAN NAME </Label>
                                            <Input type="text" id="planName" /> */}
                                            <AvField name="planName" label="PLAN NAME"
                                                type="text" errorMessage="Enter PLAN NAME"
                                                validate={{ required: { value: true } }} />
                                        </Col>
                                        {/*<Col lg="2" sm="12" className="mb-3">
                                             <Label for="gst">GST (%)</Label>
                                            <Input type="number" id="gst" /> 
                                            <AvField name="gstPercentage" label="GST (%)"
                                                type="number" errorMessage="Enter GST (%)"
                                                validate={{ required: { value: true } }} />
                                        </Col>
                                        <Col lg="4" sm="12" className="mb-3">
                                            <Label>GST Type </Label>
                                            <Select
                                                name="gstType"
                                                label="GST Type"
                                                isSelected={true}
                                                value={this.state.gst_type}
                                                onChange={(e)=>this.setState({gst_type: e})}
                                                options={GST_TYPE}
                                            />
                                        </Col>*/}

                                    </Row>

                                    <table style={{ width: "100%" }}>
                                        <tbody>
                                            <tr id="addr0" key="">
                                                <td>
                                                    <div onValidSubmit={this.updateClient} ref={c => (this.form = c)} className="repeater">
                                                        <div data-repeater-list="group-a">
                                                            <Row data-repeater-item>
                                                                <Col lg="3" className="form-group">
                                                                    {/* <Label for="name">UNIT FROM</Label> */}
                                                                    {/* <Input type="number" id="from" name="untyped-input" /> */}
                                                                    <AvField name="unitFrom-0" label="UNIT FROM"
                                                                        type="number" errorMessage="Enter UNIT FROM"
                                                                        validate={{ required: { value: true } }} />
                                                                </Col>

                                                                <Col lg="3" className="form-group">
                                                                    {/* <Label for="email">UNIT TO</Label>
                                                                    <Input type="number" id="to" /> */}
                                                                    <AvField name="unitTo-0" label="UNIT TO"
                                                                        type="number" errorMessage="Enter UNIT TO"
                                                                        validate={{ required: { value: true } }} />
                                                                </Col>

                                                                <Col lg="4" className="form-group">
                                                                    {/* <Label for="subject">PRICE</Label>
                                                                    <Input type="number" id="price" /> */}
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
                                                        <div className="repeater" enctype="multipart/form-data">
                                                            <div data-repeater-list="group-a">
                                                                <Row data-repeater-item>
                                                                    <Col lg="3" className="form-group">
                                                                        {/* <Label for="name">Name</Label> */}
                                                                        {/* <Input type="number" id="from" name="untyped-input" /> */}
                                                                        <AvField name={`unitFrom-${idx+1}`} label=""
                                                                            type="number" errorMessage="Enter UNIT FROM"
                                                                            validate={{ required: { value: true } }} />
                                                                    </Col>

                                                                    <Col lg="3" className="form-group">
                                                                        {/* <Label for="email">Email</Label> */}
                                                                        {/* <Input type="number" id="to" /> */}
                                                                        <AvField name={`unitTo-${idx+1}`} label=""
                                                                            type="number" errorMessage="Enter UNIT TO"
                                                                            validate={{ required: { value: true } }} />
                                                                    </Col>

                                                                    <Col lg="4" className="form-group">
                                                                        {/* <Label for="subject">Subject</Label> */}
                                                                        {/* <Input type="number" id="price" /> */}
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

                    {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            confirmBtnBsStyle={this.state.modal_type}
                            onConfirm={() => this.props.history.push('/viewBundlePlan')} 
                            type={this.state.modal_type} >
                        </SweetAlert> 
                    }

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(AddBundle));