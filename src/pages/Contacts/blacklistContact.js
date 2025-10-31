import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, ButtonGroup } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';

// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
// --- END KEY CHANGES ---

class BlacklistContact extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: null, 
            selectedMulti: null,
            cSelected: [],
            
            // --- KEY CHANGE (DATAGRID) ---
            // Define columns for MUI DataGrid
            columns: [
                {
                    field: 'numbers',
                    headerName: 'NUMBERS',
                    width: 150
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 270,
                    sortable: false,
                    // renderCell is required if 'action' contains JSX
                    // renderCell: (params) => (params.value) 
                },
            ],
            // Define rows for DataGrid
            rows: [] 
            // The old 'data' object in render() is no longer needed
            // --- END KEY CHANGE ---
        };
        this.onCheckboxBtnClick = this.onCheckboxBtnClick.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
    }

    onCheckboxBtnClick(selected) {
        const index = this.state.cSelected.indexOf(selected);
        if (index < 0) {
            this.state.cSelected.push(selected);
        } else {
            this.state.cSelected.splice(index, 1);
        }
        this.setState({ cSelected: [...this.state.cSelected] });
    }

    
    //Select 
    handleSelectGroup = (selectedGroup) => {
        this.setState({ selectedGroup });
    }

    render() {
        // --- KEY CHANGE (DATAGRID) ---
        // The old 'data' object was removed from the render method
        // and its 'columns' and 'rows' were moved to the state.
        // --- END KEY CHANGE ---
        
        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (Header/Title Row and Form Column remain unchanged) ... */}
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">BLACKLIST CONTACTS</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="5">
                            <Card>
                                <CardBody>
                                    <h5 className="mt-0 header-title">ADD NEW CONTACT</h5>
                                    <AvForm>
                                        {/* ... (All AvForm fields remain unchanged) ... */}
                                    </AvForm>
                                </CardBody>
                            </Card>
                        </Col>

                        <Col sm="12" lg="7">
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">BLACKLIST CONTACTS</h4>

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
                                            // If your data load later doesn't provide 'id', 
                                            // you'll need to add: getRowId={(row) => row.some_unique_key}
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

export default withRouter(connect(null, { activateAuthLayout })(BlacklistContact));