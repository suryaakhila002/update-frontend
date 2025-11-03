import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
// --- END KEY CHANGES ---

class SmsHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_standard: false,

            // --- KEY CHANGE (DATAGRID) ---
            // Define columns for MUI DataGrid
            columns: [
                {
                    field: 'slno',
                    headerName: 'SL',
                    width: 50
                },
                {
                    field: 'smsMsisdn', // Renamed from 'msisdn' to match data
                    headerName: 'MSISDN',
                    width: 150
                },
                {
                    field: 'sender_id',
                    headerName: 'SENDER ID',
                    width: 150
                },
                {
                    field: 'smsMessage', // Renamed from 'messageText' to match data
                    headerName: 'MESSAGE',
                    width: 150
                },
                {
                    field: 'message_id',
                    headerName: 'MESSAGE ID',
                    width: 150
                },
                {
                    field: 'submit_date',
                    headerName: 'SUBMIT DATE',
                    width: 150
                },
                {
                    field: 'deliver_date',
                    headerName: 'DELIVER DATE',
                    width: 150 // Adjusted width
                },
                {
                    field: 'status',
                    headerName: 'DLR STATUS',
                    width: 150, // Adjusted width
                    renderCell: (params) => (params.value) // To render JSX
                },
            ],
            // Define rows for DataGrid
            rows: [
                {
                    id: 1, // Added unique 'id'
                    slno: '1',
                    smsMsisdn: '1234567890', // Renamed field
                    sender_id: 'VOTTRS',
                    smsMessage: 'टेस्ट मैसेज టెస్ట్', // Renamed field
                    message_id: '3r519465013287560',
                    submit_date: '01/15/2020 3:21PM',
                    deliver_date: '01/15/2020 3:21PM',
                    status: <span className="badge badge-success p-1">DELIVERED</span>,
                },
            ]
            // --- END KEY CHANGE ---
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

        // --- KEY CHANGE (DATAGRID) ---
        // The old 'data' constant was removed from the render method
        // and its 'columns' and 'rows' were moved to the state.
        // --- END KEY CHANGE ---

        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (Header/Title Row remains unchanged) ... */}
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

                                    {/* --- KEY CHANGE (MDBDATATABLE REPLACEMENT) --- */}
                                    {/* <MDBDataTable
                                        sortable
                                        responsive
                                        striped
                                        hover
                                        data={data}
                                        footer={false}
                                        foot={false}
                                    /> */}
                                    <Box sx={{ height: 400, width: '100%' }}>
                                        <DataGrid
                                            rows={this.state.rows}
                                            columns={this.state.columns}
                                            pageSize={5}
                                            rowsPerPageOptions={[5, 10, 20]}
                                            disableSelectionOnClick
                                            // DataGrid needs a unique 'id' field for each row.
                                            // 'id' field was added in state
                                            getRowId={(row) => row.id} 
                                        />
                                    </Box>
                                    {/* --- END KEY CHANGE --- */}

                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout })(SmsHistory);