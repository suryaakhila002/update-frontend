import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';

class AllKeywoards extends Component {
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
                    label: 'TITLE' ,
                    field: 'title',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'KEYWORD',
                    field: 'keyword',
                    sort: 'asc',
                    width: 270
                },
                {
                    label: 'PRICE',
                    field: 'price',
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
                                <h4 className="page-title">ALL KEYWORDS</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">ALL KEYWORDS</h4>

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

export default withRouter(connect(null, { activateAuthLayout })(AllKeywoards));