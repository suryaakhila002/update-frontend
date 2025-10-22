import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';

class Queue extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_standard: false
        };
        this.tog_standard = this.tog_standard.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
    }

    ManageClick() {        
        this.props.history.push('/manageClient');
    }

    tog_standard() {
        this.setState(prevState => ({
            modal_standard: !prevState.modal_standard
        }));
        this.removeBodyCss();
    }
    removeBodyCss() {
        document.body.classList.add('no_padding');
    }

    render() {

        const data = {
            columns: [
                {
                    label: 'SL' ,
                    field: 'slno',
                    sort: 'asc',
                    width: 50
                },
                {
                    label: 'USER NAME' ,
                    field: 'userName',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'No Of SMS In Queue',
                    field: 'queue',
                    sort: 'asc',
                    width: 250
                },
                {
                    label: 'Action',
                    field: 'action',
                    sort: 'asc',
                    width: 150
                },
            ],
            rows: [
                
                {
                    slno: '1',
                    userName: 'SureshTV',
                    queue: '100000',
                    action: <div><Button onClick={()=>null}  type="button" color="danger" size="sm" className="waves-effect waves-light mr-2 mb-2">STOP</Button>
                        <Button onClick={()=>null} type="button" color="info" size="sm" className="waves-effect mb-2">VIEW</Button></div>
                },
            ]
        };

        const data2 = {
            columns: [
                {
                    label: 'SL' ,
                    field: 'slno',
                    sort: 'asc',
                    width: 50
                },
                {
                    label: 'USER NAME' ,
                    field: 'userName',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'No Of SMS In Queue',
                    field: 'queue',
                    sort: 'asc',
                    width: 250
                },
                {
                    label: 'Action',
                    field: 'action',
                    sort: 'asc',
                    width: 150
                },
            ],
            rows: [
                
                {
                    slno: '1',
                    userName: 'NANI',
                    queue: '10000000',
                    action: <div><Button onClick={()=>null}  type="button" color="primary" size="sm" className="waves-effect waves-light mr-2 mb-2">ACTIVE</Button>
                        <Button onClick={()=>null} type="button" color="info" size="sm" className="waves-effect mb-2">VIEW</Button></div>
                },
            ]
        };

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">SMS HISTORY</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>

                                    <h4 className="page-title mb-3">In Queue</h4>

                                    <MDBDataTable
                                        sortable
                                        responsive
                                        striped
                                        hover
                                        data={data}
                                        footer={false}
                                        foot={false}
                                    />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>


                    <Row>
                        <Col>
                            <Card>
                                <CardBody>

                                    <h4 className="page-title mb-3">Stopped Queue</h4>

                                    <MDBDataTable
                                        sortable
                                        responsive
                                        striped
                                        hover
                                        data={data2}
                                        footer={false}
                                        foot={false}
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

export default withRouter(connect(null, { activateAuthLayout })(Queue));