import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';

// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Select from 'react-select';

const CLIENT_GROUP = [
    {
        label: "Client Group",
        options: [
            { label: "None", value: "None" },
            { label: "SMS GATEWAY ", value: "SMS GATEWAY " },
            { label: "Twilio", value: "Twilio" },
            { label: "SMS LIMIT", value: "SMS LIMIT" },
            { label: "AVATAR", value: "AVATAR" }
        ]
    }
];

const VALIDITY = [
    {
        label: "Month",
        options: [
            { label: "2 Months", value: "2 Months" },
            { label: "3 Months", value: "3 Months" },
            { label: "6 Months", value: "6 Months" },
        ],
        // label: "Year",
        // options: [
        //     { label: "2 Years", value: "2 Years" },
        //     { label: "3 Years", value: "3 Years" },
        // ]
    }
];

const STATUS = [
    {
        options: [
            { label: "Available", value: "Available" },
            { label: "Assigned", value: "Assigned" },
        ]
    }
];

class AddNewKeywoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: null, 
            selectedMulti: null,
        };
    }

    componentDidMount() {
        this.props.activateAuthLayout();
    }

    //Select 
    handleSelectGroup = (selectedGroup) => {
        this.setState({ selectedGroup });
    }

    render() {
        const { selectedGroup } = this.state;
        // const { selectedMulti } = this.state;

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">

                            <Col sm="6">
                                <h4 className="page-title">ADD NEW KEYWORD</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="6">
                            <Card>
                                <CardBody>

                                    <h4 className="mt-0 header-title">ADD NEW KEYWORD</h4>

                                    <FormControl>
                                        <AvField name="title" label="TITLE"
                                            type="text" errorMessage="Enter The Title"
                                            validate={{ required: { value: true } }} />
                                        <AvField name="keyboard_name" label="KEYWORD NAME"
                                            type="text" errorMessage="Enter Keyboard Name"
                                            validate={{ required: { value: true } }} />
                                        <AvField name="reply_text_for_recipent" label="REPLY TEXT FOR RECIPIENT"
                                            rows={3} type="textarea"
                                            validate={{ required: { value: false } }} />
                                        <AvField name="reply_voice_for_recipent" label="REPLY VOICE FOR RECIPIENT"
                                            rows={3} type="textarea" 
                                            validate={{ required: { value: false } }} />

                                        <AvField name="import" label="REPLY MMS FOR RECIPIENT"
                                            type="file" 
                                            validate={{ required: { value: false } }} />

                                        <FormGroup>
                                            <Label>STATUS</Label>
                                                <Select
                                                    label="CLIENT GROUP"
                                                    value={selectedGroup}
                                                    onChange={this.handleSelectGroup}
                                                    options={STATUS}
                                                />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label>SELECT CLIENT</Label>
                                                <Select
                                                    label="CLIENT GROUP"
                                                    value={selectedGroup}
                                                    onChange={this.handleSelectGroup}
                                                    options={CLIENT_GROUP}
                                                />
                                        </FormGroup>

                                        <AvField name="price" label="PRICE"
                                            type="text" errorMessage="Enter The Price"
                                            validate={{ required: { value: true } }} />

                                        <FormGroup>
                                            <Label>VALIDITY </Label>
                                                <Select
                                                    label="CLIENT GROUP"
                                                    value={selectedGroup}
                                                    onChange={this.handleSelectGroup}
                                                    options={VALIDITY}
                                                />
                                        </FormGroup>


                                        <FormGroup className="mb-0">
                                            <div>
                                                <Button type="submit" color="primary" className="mr-1">
                                                    <i className="ti ti-plus mr-2"></i> Add
                                                </Button>
                                            </div>
                                        </FormGroup>

                                    </FormControl>

                                </CardBody>
                            </Card>
                        </Col>

                    </Row>

                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout })(AddNewKeywoard);