import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Button } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';

class PhoneBook extends Component {
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

        const data = {
            columns: [
                {
                    label: 'SL',
                    field: 'sl',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'LIST NAME',
                    field: 'list_name',
                    sort: 'asc',
                    width: 270
                },
                {
                    label: 'ACTION',
                    field: 'action',
                    sort: 'asc',
                    width: 200
                }
            ],
            rows: []
        };

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">PHONE BOOK</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="4">
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">ADD NEW LIST</h4>

                                    <AvForm>
                                        <AvField name="list_name" label="LIST NAME"
                                            type="text" errorMessage="Enter List Name"
                                            validate={{ required: { value: true } }} />

                                        <FormGroup className="mb-0">
                                            <div>
                                                <Button type="submit" color="success" className="mr-1">
                                                    <i className="ti ti-plus mr-2"></i> Add
                                                </Button>{' '}
                                            </div>
                               
                                       </FormGroup>

                                    </AvForm>

                                </CardBody>
                            </Card>
                        </Col>

                        <Col sm="12" lg="8">
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">PHONE BOOK</h4>

                                    <MDBDataTable
                                        responsive
                                        striped
                                        data={data}
                                    />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(PhoneBook));