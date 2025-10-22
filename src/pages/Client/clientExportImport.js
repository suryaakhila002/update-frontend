import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select';
import {  withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';

const CLIENT_GROUP_STATUS = [
    {
        label: "Status",
        options: [
            { label: "Active", value: "Active" },
            { label: "In Active", value: "In Active" }
        ]
    }
];

const SELECT_BOOLEAN = [
    {
        options: [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" }
        ]
    }
];

class ClientExportImport extends Component {
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
                                <h4 className="page-title">EXPORT AND IMPORT CLIENTS</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="4">
                            <Card>
                                <CardBody>

                                    <Row>
                                        <Col sm="12" md="4">
                                            <small>Export Clients : </small>
                                        </Col>
                                        <Col sm="12" md="8">
                                            <Button type="submit" color="success" size="sm" className="waves-effect waves-light mr-1">
                                                Export Clients as CSV 
                                            </Button>
                                        </Col>
                                    </Row>

                                    <Row className="mt-3">
                                        <Col sm="12" md="4">
                                            <small>Sample File : </small>
                                        </Col>
                                        <Col sm="12" md="8">
                                            <Button type="submit" color="primary" size="sm" className="waves-effect waves-light mr-1">
                                                Download Sample File 
                                            </Button>
                                        </Col>
                                    </Row>

                                </CardBody>
                            </Card>
                        </Col>

                        <Col sm="12" lg="8">
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">IMPORT CLIENT</h4>

                                    <AvForm>

                                        <FormGroup>
                                            <Label>CLIENT GROUP</Label>
                                            <Select
                                                label="CLIENT GROUP"
                                                value={selectedGroup}
                                                onChange={this.handleSelectGroup}
                                                options={CLIENT_GROUP_STATUS}
                                            />
                                        </FormGroup>

                                        <FormGroup>
                                            <Label>SMS GATEWAY </Label>
                                            <Select
                                                label="SMS GATEWAY "
                                                value={selectedGroup}
                                                onChange={this.handleSelectGroup}
                                                options={SELECT_BOOLEAN}
                                            />
                                        </FormGroup>

                                        <FormGroup>
                                            <Label>RESELLER PANEL</Label>
                                            <Select
                                                label="RESELLER PANEL"
                                                value={selectedGroup}
                                                onChange={this.handleSelectGroup}
                                                options={SELECT_BOOLEAN}
                                            />
                                        </FormGroup>

                                        <FormGroup>
                                            <Label>API ACCESS</Label>
                                            <Select
                                                label="API ACCESS"
                                                value={selectedGroup}
                                                onChange={this.handleSelectGroup}
                                                options={SELECT_BOOLEAN}
                                            />
                                        </FormGroup>

                                        <AvField name="import_file" label="IMPORT FILE"
                                            type="file" errorMessage="Enter Group Name"
                                            validate={{ required: { value: true } }} />

                                        <AvField name="form_as_header" label="FIRST ROW AS HEADER"
                                            type="checkbox" 
                                            validate={{ required: { value: false } }} />

                                        <p className="text-primary">IT WILL TAKE FEW MINUTES. PLEASE DO NOT RELOAD THE PAGE</p>


                                        <FormGroup className="mb-0">
                                            <div>
                                                <Button type="submit" color="primary" className="btn-block waves-effect waves-light mr-1">
                                                    Import
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

export default withRouter(connect(null, { activateAuthLayout })(ClientExportImport));