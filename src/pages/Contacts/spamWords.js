import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Button } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';

// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
// --- END KEY CHANGES ---

class SpamWords extends Component {
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
                    field: 'words',
                    headerName: 'WORDS',
                    width: 200 // Adjusted width
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 270,
                    sortable: false
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
                                <h4 className="page-title">SPAM WORDS</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="5">
                            <Card>
                                <CardBody>
                                    <h5 className="mt-0 header-title">ADD NEW WORD</h5>

                                    <AvForm>
                                        <FormGroup>
                                            <AvField name="spam_words" label="SPAM WORDS"
                                            type="text"  
                                            validate={{ required: { value: true } }} />
                                        </FormGroup>

                                        <FormGroup className="mb-0">
                                            <div>
                                                <Button type="submit" color="success" className="mr-1">
                                                    <i className="ti ti-plus mr-2"></i> Add
                                                </Button>
                                            </div>
                               
                                       </FormGroup>

                                    </AvForm>

                                </CardBody>
                            </Card>
                        </Col>

                        <Col sm="12" lg="7">
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">SPAM WORDS</h4>

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
                                            // When you load data, you must provide a unique 'id'
                                            // or use getRowId to point to a unique field (like 'words').
                                            getRowId={(row) => row.words} 
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

export default withRouter(connect(null, { activateAuthLayout })(SpamWords));