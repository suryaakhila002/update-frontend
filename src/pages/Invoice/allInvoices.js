import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
// --- END KEY CHANGES ---

class AllInvoices extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // --- KEY CHANGE (DATAGRID) ---
            // Define columns for MUI DataGrid
            columns: [
                {
                    field: 'sl',
                    headerName: '#', // Changed from 'SL#'
                    width: 100
                },
                {
                    field: 'client_name',
                    headerName: 'CLIENT NAME',
                    width: 270
                },
                {
                    field: 'amount',
                    headerName: 'AMOUNT',
                    width: 150 // Adjusted width
                },
                {
                    field: 'invoice_date',
                    headerName: 'INVOICE DATE',
                    width: 150 // Adjusted width
                },
                {
                    field: 'due_date',
                    headerName: 'DUE DATE',
                    width: 150 // Adjusted width
                },
                {
                    field: 'status',
                    headerName: 'STATUS',
                    width: 100
                },
                {
                    field: 'type',
                    headerName: 'TYPE',
                    width: 100 // Adjusted width
                },
                {
                    field: 'manage',
                    headerName: 'MANAGE',
                    width: 150, // Adjusted width
                    sortable: false
                }
            ],
            // Define rows for DataGrid
            rows: [] 
            // The old 'data' object in render() is no longer needed
            // --- END KEY CHANGE ---
        };
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        // You would typically load your row data here, e.g.:
        // this.loadInvoiceData();
    }

    // --- KEY CHANGE (DATAGRID) ---
    // This is where you would load your data from an API
    // and format it for the DataGrid
    // loadInvoiceData = () => {
    //     // Example:
    //     const apiData = [
    //         { sl: 1, client_name: 'Client A', amount: 100, ... },
    //         { sl: 2, client_name: 'Client B', amount: 200, ... }
    //     ];
    //     // DataGrid needs a unique 'id' field
    //     const formattedRows = apiData.map(row => ({ ...row, id: row.sl }));
    //     this.setState({ rows: formattedRows });
    // }
    // --- END KEY CHANGE ---

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
                                <h4 className="page-title">ALL INVOICES</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">ALL INVOICES</h4>

                                    {/* --- KEY CHANGE (MDBDATATABLE REPLACEMENT) --- */}
                                    {/* <MDBDataTable
                                        sortable
                                        responsive
                                        striped
                                        data={data}
                                    /> */}
                                    <Box sx={{ height: 400, width: '100%' }}>
                                        <DataGrid
                                            rows={this.state.rows}
                                            columns={this.state.columns}
                                            pageSize={5}
                                            rowsPerPageOptions={[5, 10, 20]}
                                            disableSelectionOnClick
                                            // DataGrid needs a unique 'id' field for each row.
                                            // We'll tell it to use the 'sl' field as the unique ID.
                                            getRowId={(row) => row.sl} 
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

export default withRouter(connect(null, { activateAuthLayout })(AllInvoices));