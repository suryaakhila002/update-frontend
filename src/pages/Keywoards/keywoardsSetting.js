import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Select from 'react-select';

const BOOLEAN_SELECT = [
    {
        options: [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" }
        ]
    }
];

class KeywoardsSetting extends Component {
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

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">

                            <Col sm="6">
                                <h4 className="page-title">KEYWORD SETTINGS</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="7">
                            <Card>
                                <CardBody>

                                    <h4 className="mt-0 header-title">KEYWORD SETTINGS</h4>

                                    <AvForm>
                                        <Label>SHOW IN CLIENT</Label>
                                        <Select
                                            className="mb-3"
                                            value={selectedGroup}
                                            onChange={this.handleSelectGroup}
                                            options={BOOLEAN_SELECT}
                                        />
                                        
                                        <Label>OPT IN SMS KEYWORD <small>Insert keyword using comma (,)</small></Label>
                                        <AvField name="opt_in_sms_keyword" 
                                            rows={3} type="textarea"
                                            validate={{ required: { value: false } }} />
                                        
                                        <Label>OPT OUT SMS KEYWORD <small>Insert keyword using comma (,)</small></Label>
                                        <AvField name="opt_out_sms_keyword" 
                                            rows={3} type="textarea"
                                            validate={{ required: { value: false } }} />
                                        
                                        <Label>CUSTOM GATEWAY SUCCESS RESPONSE STATUS <small>Insert keyword using comma (,)</small></Label>
                                        <AvField name="custom_gateway_success_response_status" 
                                            rows={3} type="textarea"
                                            validate={{ required: { value: false } }} />

                                        <FormGroup className="mb-0">
                                            <div>
                                                <Button type="submit" color="success" className="mr-1">
                                                    Update
                                                </Button>
                                            </div>
                                        </FormGroup>

                                    </AvForm>

                                </CardBody>
                            </Card>
                        </Col>

                    </Row>

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(KeywoardsSetting));