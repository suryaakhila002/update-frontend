import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Coverages from '../../utils/Coverages';

// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
// --- END KEY CHANGES ---

class Coverage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // --- KEY CHANGE (DATAGRID) ---
            // Define columns for MUI DataGrid
            columns: [
                {
                    field: 'id',
                    headerName: 'SL#',
                    width: 100 // Adjusted width
                },
                {
                    field: 'country_name',
                    headerName: 'COUNTRY',
                    width: 200 // Adjusted width
                },
                {
                    field: 'iso_code',
                    headerName: 'ISO CODE',
                    width: 150
                },
                {
                    field: 'country_code',
                    headerName: 'COUNTRY CODE',
                    width: 150
                },
                {
                    field: 'plain_tariff',
                    headerName: 'PLAIN PRICE',
                    width: 150
                },
                {
                    field: 'voice_tariff',
                    headerName: 'VOICE PRICE',
                    width: 150
                },
                {
                    field: 'mms_tariff',
                    headerName: 'MMS PRICE',
                    width: 150
                },
                {
                    field: 'active',
                    headerName: 'STATUS',
                    width: 150
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 350, // Increased width for all buttons
                    sortable: false,
                    // renderCell is required to render JSX (<Button>)
                    renderCell: (params) => (params.value)
                }
            ],
            // Define rows for DataGrid
            rows: []
            // --- END KEY CHANGE ---
        };
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadCoverageData(); // Load data on mount
    }

    // --- KEY CHANGE (DATAGRID) ---
    // Moved the data processing from render() to its own method
    // This is more efficient and required for DataGrid
    loadCoverageData = () => {
        const rows = Coverages.map(v => ({
            ...v, 
            // 'v.id' is already present in Coverages, so DataGrid will use it
            action: <div>
                        <Button onClick={()=>this.ManageClick()}  type="button" color="success" size="sm" className="mb-2 waves-effect waves-light mr-2">Manage</Button>
                        <Button onClick={()=>this.ManageClick()}  type="button" color="primary" size="sm" className="mb-2 waves-effect waves-light mr-2">Add Operator</Button>
                        <Button onClick={()=>this.ManageClick()}  type="button" color="info" size="sm" className="waves-effect waves-light mr-2">View Operator</Button>
                    </div>
        }));
        this.setState({ rows: rows });
    }
    // --- END KEY CHANGE ---

    ManageClick() {        
        this.props.history.push('/manageClient');
    }

    render() {

        // --- KEY CHANGE (DATAGRID) ---
        // The 'data' constant was removed from here
        // --- END KEY CHANGE ---

        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (Header/Title Row remains unchanged) ... */}
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

                                    {/* --- KEY CHANGE (MDBDATATABLE REPLACEMENT) --- */}
                                    {/* <MDBDataTable
                                        sortable
                                        responsive
                                        striped
                                        data={data}
                                    /> */}
                                    <Box sx={{ height: 600, width: '100%' }}>
                                        <DataGrid
                                            rows={this.state.rows}
                                            columns={this.state.columns}
                                            pageSize={10}
                                            rowsPerPageOptions={[10, 25, 50]}
                                            // 'id' field is in the data, so getRowId is not needed
                                            // getRowId={(row) => row.id} 
                                            disableSelectionOnClick
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

export default withRouter(connect(null, { activateAuthLayout })(Coverage));