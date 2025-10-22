import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';
import Coverages from '../../utils/Coverages';

class Coverage extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        this.props.activateAuthLayout();
    }

    ManageClick() {        
        this.props.history.push('/manageClient');
    }

    render() {

        const data = {
            columns: [
                {
                    label: 'SL#' ,
                    field: 'id',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'COUNTRY',
                    field: 'country_name',
                    sort: 'asc',
                    width: 270
                },
                {
                    label: 'ISO CODE',
                    field: 'iso_code',
                    sort: 'asc',
                    width: 200
                },
                {
                    label: 'COUNTRY CODE',
                    field: 'country_code',
                    sort: 'asc',
                    width: 200
                },
                {
                    label: 'PLAIN PRICE',
                    field: 'plain_tariff',
                    sort: 'asc',
                    width: 200
                },
                {
                    label: 'VOICE PRICE',
                    field: 'voice_tariff',
                    sort: 'asc',
                    width: 100
                },
                {
                    label: 'MMS PRICE',
                    field: 'mms_tariff',
                    sort: 'asc',
                    width: 200
                },
                {
                    label: 'STATUS',
                    field: 'active',
                    sort: 'asc',
                    width: 200
                },
                {
                    label: 'ACTION',
                    field: 'action',
                    sort: 'asc',
                    width: 200
                }

            ],
            rows: Coverages.map(v => ({...v, action: <div><Button onClick={()=>this.ManageClick()}  type="button" color="success" size="sm" className="mb-2 waves-effect waves-light mr-2">Manage</Button><Button onClick={()=>this.ManageClick()}  type="button" color="primary" size="sm" className="mb-2 waves-effect waves-light mr-2">Add Operator</Button><Button onClick={()=>this.ManageClick()}  type="button" color="info" size="sm" className="waves-effect waves-light mr-2">View Operator</Button></div>}))
        };

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">All Clients</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">All Clients</h4>

                                    <MDBDataTable
                                        sortable
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

export default withRouter(connect(null, { activateAuthLayout })(Coverage));