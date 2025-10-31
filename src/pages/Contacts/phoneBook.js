import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';

// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
// --- END KEY CHANGES ---

class PhoneBook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: null, 
            selectedMulti: null,
            
            // --- KEY CHANGE (DATAGRID) ---
            // Define columns for MUI DataGrid
            columns: [
                {
                    field: 'sl',
                    headerName: 'SL',
                    width: 150
                },
                {
                    field: 'list_name',
                    headerName: 'LIST NAME',
                    width: 270
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 200,
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
    }
    
    //Select 
    handleSelectGroup = (selectedGroup) => {
        this.setState({ selectedGroup });
    }

    render() {
        // --- KEY CHANGE (DATAGRID) ---
        // The old 'data' constant was removed from the render method
        // and its 'columns' and 'rows' were moved to the state.
        // --- END KEY CHANGE ---

        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (Header/Title Row and Form Column remain unchanged) ... */}
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

                                    {/* --- KEY CHANGE (MDBDATATABLE REPLACEMENT) --- */}
                                    {/* <MDBDataTable
                                        responsive
                                        striped
                                        data={data}
                                    /> */}
                                    <Box sx={{ height: 400, width: '100%' }}>
                                        <DataGrid
                                            rows={this.state.rows}
                                            columns={this.state.columns}
                                            pageSize={5}
                                            rowsPerPageOptions={[5]}
                                            disableSelectionOnClick
                                            // DataGrid needs a unique 'id' field for each row.
                                            // Since the data is empty, we'll assume the 'sl' field
                                            // will be the unique identifier when data is loaded.
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

export default withRouter(connect(null, { activateAuthLayout })(PhoneBook));