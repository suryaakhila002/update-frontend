import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label, Alert } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { FormControl, TextField, AvRadioGroup, AvRadio } from 'availity-reactstrap-validation';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import { Input, TextField } from '@mui/material';

const SMS_GATEWAY = [
    {
        label: "SMS Gateway",
        options: [
            { label: "Nothing Selected", value: "" }
        ]
    }
];

const REMOVE_DUPLICATE = [
    {   
        options: [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" },

        ]
    }
];

const MESSAGE_TYPE = [
    {
        options: [
            { label: "Plain", value: "Plain" },
            { label: "Unicode", value: "Unicode" },
            { label: "Arabic", value: "Arabic" },
            { label: "Voice", value: "Voice" },
            { label: "MMS", value: "MMS" },

        ]
    }
];

class SendSheduleSms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: null, 
            selectedMulti: null,
            cSelected: [],
            sheduleRequired: 'No',
            showSavedMessage: false,
            default_date: new Date(), default: false, start_date: new Date(), monthDate: new Date(), yearDate: new Date(), end_date: new Date(), date: new Date(),
        };
        this.onCheckboxBtnClick = this.onCheckboxBtnClick.bind(this);
        this.handleDefault = this.handleDefault.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
    }

    //Select 
    handleSelectGroup = (selectedGroup) => {
        this.setState({ selectedGroup });
    }

    handleDefault(date) {
        this.setState({ default_date: date });
    }

    handleChange = e => {
        const { name, value } = e.target;

        this.setState({
          [name]: value
        });
    };

    onCheckboxBtnClick(selected) {
        const index = this.state.cSelected.indexOf(selected);
        if (index < 0) {
            this.state.cSelected.push(selected);
        } else {
            this.state.cSelected.splice(index, 1);
        }
        this.setState({ cSelected: [...this.state.cSelected] });
    }

    render() {
        const { selectedGroup } = this.state;

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">

                            <Col sm="6">
                                <h4 className="page-title">SEND BULK SMS</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="6">
                            <Card>
                                <CardBody>

                                    <h4 className="mt-0 header-title mb-2">SEND BULK SMS</h4>

                                    <FormControl>
                                            <Label>SMS GATEWAY</Label>
                                                <Select
                                                    className="mb-3"
                                                    label="SMS GATEWAY"
                                                    value={selectedGroup}
                                                    onChange={this.handleSelectGroup}
                                                    options={SMS_GATEWAY}
                                                />

                                        <TextField name="title" label="SENDER ID"
                                            type="text" errorMessage="Enter The Title"
                                            validate={{ required: { value: true } }} />
                                            

                                            <Label>COUNTRY CODE</Label>
                                                <Select
                                                    className="mb-3"
                                                    label="COUNTRY CODE"
                                                    value={selectedGroup}
                                                    onChange={this.handleSelectGroup}
                                                    options={SMS_GATEWAY}
                                                />

                                        <TextField name="keyboard_name" label="RECIPIENTS"
                                            onFocus={ () => this.setState({showSavedMessage: false}) }
                                            type="textarea" rows={3} errorMessage="Enter Keyboard Name"
                                            validate={{ required: { value: true } }} />

                                            <Label>REMOVE DUPLICATE</Label>
                                                <Select
                                                    className="mb-3"
                                                    label="REMOVE DUPLICATE"
                                                    value={selectedGroup}
                                                    onChange={this.handleSelectGroup}
                                                    options={REMOVE_DUPLICATE}
                                                />

                                        <FormGroup>
                                            <Label>MESSAGE TYPE</Label>
                                                <Select
                                                    label="MESSAGE TYPE"
                                                    value={selectedGroup}
                                                    onChange={this.handleSelectGroup}
                                                    options={MESSAGE_TYPE}
                                                />
                                        </FormGroup>

                                        <TextField name="reply_voice_for_recipent" label="MESSAGE"
                                            rows={4} max={160} type="textarea" 
                                            onFocus={ () => this.setState({showSavedMessage: true}) }
                                            validate={{ required: { value: false } }} />
                                        <span>Max 160 Characters.</span>

                                        <TextField name="form_as_header" label="GENERATE UNSUBSCRIBE MESSAGE"
                                            type="checkbox"
                                            validate={{ required: { value: false } }} />
                                        <TextField name="form_as_header" label="SCHEDULE"
                                            type="checkbox" checked={true}
                                            validate={{ required: { value: false } }} />

                                        <TextField name="reply_voice_for_recipent" label="SCHEDULE TIME"
                                            type="datetime-local" 
                                            validate={{ required: { value: false } }} />

                                        <AvRadioGroup inline value='No' name="sheduleRequired" required>
                                          <Label style={{marginRight: '10px'}}>Schedule Requried: </Label>
                                          <Input type='radio' onChange={this.handleChange} customInput label="Yes" value="Yes" />
                                          <AvRadio onChange={this.handleChange} customInput label="No" value="No" active />
                                        </AvRadioGroup>

                                        {this.state.sheduleRequired === 'Yes' && 
                                            <FormGroup >
                                            <DatePicker
                                                className="form-control"
                                                selected={this.state.default_date}
                                                onChange={this.handleDefault}
                                                showTimeSelect
                                                dateFormat="Pp"
                                            />
                                            </FormGroup >
                                        }


                                        <FormGroup className="mb-0">
                                            <div>
                                                <Button style={{float: 'right'}} type="submit" color="primary" className="mr-1">
                                                    <i className="fa fa-paper-plane mr-2"></i> Send
                                                </Button>
                                                <Button style={{float: 'right'}} type="button" color="secondary" className="mr-1">
                                                    <i className="fa fa-save mr-2"></i> Save Draft
                                                </Button>
                                            </div>
                                        </FormGroup>

                                    </FormControl>

                                </CardBody>
                            </Card>
                        </Col>

                        {this.state.showSavedMessage &&
                        <Col lg="6" >
                            <h4 className="mt-0 header-title">Saved Messages</h4>
                                <div className="">
                                    <Alert color="success" className="mb-0">
                                        <p className="mb-0">Whenever to Bulk SMS. 
                                        </p>
                                        <p> 
                                            <Link to="#"><i className="ti ti-close float-right danger mr-2"></i> </Link>
                                            <Link to="#"><i className="ti ti-check float-right success mr-2"></i></Link> 
                                        </p>

                                    </Alert>
                                </div>
                        </Col>
                        }

                    </Row>

                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout })(SendSheduleSms);