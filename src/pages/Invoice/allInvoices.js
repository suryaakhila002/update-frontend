import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';

class AllInvoices extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        this.props.activateAuthLayout();
    }

    render() {

        const data = {
            columns: [
                {
                    label: '#' ,
                    field: 'sl',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'CLIENT NAME',
                    field: 'client_name',
                    sort: 'asc',
                    width: 270
                },
                {
                    label: 'AMOUNT',
                    field: 'amount',
                    sort: 'asc',
                    width: 200
                },
                {
                    label: 'INVOICE DATE',
                    field: 'invoice_date',
                    sort: 'asc',
                    width: 200
                },
                {
                    label: 'DUE DATE',
                    field: 'due_date',
                    sort: 'asc',
                    width: 200
                },
                {
                    label: 'STATUS',
                    field: 'status',
                    sort: 'asc',
                    width: 100
                },
                {
                    label: 'TYPE',
                    field: 'type',
                    sort: 'asc',
                    width: 200
                },
                {
                    label: 'MANAGE',
                    field: 'manage',
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
                                <h4 className="page-title">ALL INVOICES</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">ALL INVOICES</h4>

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

export default withRouter(connect(null, { activateAuthLayout })(AllInvoices));