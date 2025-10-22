import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';

class SmsHistory extends Component {
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
                    label: 'MSISDN' ,
                    field: 'smsMsisdn',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'SENDER ID',
                    field: 'sender_id',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'MESSAGE',
                    field: 'smsMessage',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'MESSAGE ID',
                    field: 'message_id',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'SUBMIT DATE',
                    field: 'submit_date',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'DELIVER DATE',
                    field: 'deliver_date',
                    sort: 'asc',
                    width: 50
                },
                {
                    label: 'DLR STATUS',
                    field: 'status',
                    sort: 'asc',
                    width: 100
                },
            ],
            rows: [
                
                {
                    slno: '1',
                    msisdn: '1234567890',
                    sender_id: 'VOTTRS',
                    messageText: 'टेस्ट मैसेज టెస్ట్',
                    message_id: '3r519465013287560',
                    submit_date: '01/15/2020 3:21PM',
                    deliver_date: '01/15/2020 3:21PM',
                    status: <span className="badge badge-success p-1">DELIVERED</span>,
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

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(SmsHistory));