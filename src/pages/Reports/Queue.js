import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
// --- END KEY CHANGES ---

class Queue extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: null, 
            selectedMulti: null,
            
            // --- KEY CHANGE (DATAGRID) ---
            // Define columns and rows for the first table (In Queue)
            queueColumns: [
                {
                    field: 'slno',
                    headerName: 'SL',
                    width: 50
                },
                {
                    field: 'userName',
                    headerName: 'USER NAME',
                    width: 150
                },
                {
                    field: 'queue',
                    headerName: 'No Of SMS In Queue',
                    width: 250
                },
                {
                    field: 'action',
                    headerName: 'Action',
                    width: 200, // Increased width
                    sortable: false,
                    renderCell: (params) => (params.value) // To render JSX
                },
            ],
            queueRows: [
                {
                    id: 1, // Added unique 'id'
                    slno: '1',
                    userName: 'SureshTV',
                    queue: '100000',
                    action: <div><Button onClick={()=>null}  type="button" color="danger" size="sm" className="waves-effect waves-light mr-2 mb-2">STOP</Button>
                        <Button onClick={()=>null} type="button" color="info" size="sm" className="waves-effect mb-2">VIEW</Button></div>
                },
            ],

            // Define columns and rows for the second table (Stopped Queue)
            stoppedQueueColumns: [
                {
                    field: 'slno',
                    headerName: 'SL',
                    width: 50
                },
                {
                    field: 'userName',
                    headerName: 'USER NAME',
                    width: 150
                },
                {
                    field: 'queue',
                    headerName: 'No Of SMS In Queue',
                    width: 250
                },
                {
                    field: 'action',
                    headerName: 'Action',
                    width: 200, // Increased width
                    sortable: false,
                    renderCell: (params) => (params.value) // To render JSX
                },
            ],
            stoppedQueueRows: [
                {
                    id: 1, // Added unique 'id'
                    slno: '1',
                    userName: 'NANI',
                    queue: '10000000',
                    action: <div><Button onClick={()=>null}  type="button" color="primary" size="sm" className="waves-effect waves-light mr-2 mb-2">ACTIVE</Button>
                        <Button onClick={()=>null} type="button" color="info" size="sm" className="waves-effect mb-2">VIEW</Button></div>
                },
            ]
            // --- END KEY CHANGE ---
        };
        // this.tog_standard = this.tog_standard.bind(this); // tog_standard was not used
    }

    componentDidMount() {
        this.props.activateAuthLayout();
    }

    ManageClick() {        
        this.props.history.push('/manageClient');
    }

    // tog_standard() { // This function was not used
    //     this.setState(prevState => ({
    //         modal_standard: !prevState.modal_standard
    //     }));
    //     this.removeBodyCss();
    // }
    // removeBodyCss() { // This function was not used
    //     document.body.classList.add('no_padding');
    // }

    render() {

        // --- KEY CHANGE (DATAGRID) ---
        // The old 'data' and 'data2' constants were removed from the render method
        // and their 'columns' and 'rows' were moved to the state.
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
                                    <h4 className="page-title mb-3">In Queue</h4>

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
                                            rows={this.state.queueRows}
                                            columns={this.state.queueColumns}
                                            pageSize={5}
                                            rowsPerPageOptions={[5]}
                                            disableSelectionOnClick
                                            // 'id' field was added in state
                                            // getRowId={(row) => row.slno} // Not needed
                                        />
                                    </Box>
                                    {/* --- END KEY CHANGE --- */}

                                </CardBody>
                            </Card>
                        </Col>
                    </Row>


                    <Row>
                        <Col>
                            <Card>
                                <CardBody>
                                    <h4 className="page-title mb-3">Stopped Queue</h4>

                                    {/* --- KEY CHANGE (MDBDATATABLE REPLACEMENT) --- */}
                                    {/* <MDBDataTable
                                        sortable
                                        responsive
                                        striped
                                        hover
                                        data={data2}
                                        footer={false}
                                        foot={false}
                                    /> */}
                                    <Box sx={{ height: 400, width: '100%' }}>
                                        <DataGrid
                                            rows={this.state.stoppedQueueRows}
                                            columns={this.state.stoppedQueueColumns}
                                            pageSize={5}
                                            rowsPerPageOptions={[5]}
                                            disableSelectionOnClick
                                            // 'id' field was added in state
                                            // getRowId={(row) => row.slno} // Not needed
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

export default connect(null, { activateAuthLayout })(Queue);