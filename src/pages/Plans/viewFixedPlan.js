import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {ServerApi} from '../../utils/ServerApi';
import { Empty } from 'antd';
import { getLoggedInUser } from '../../helpers/authUtils';

// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated

import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
// --- END KEY CHANGES ---


class ViewFixedPlan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // --- KEY CHANGE (DATAGRID) ---
            // Define columns for MUI DataGrid
            columns: [
                {
                    field: 'slno',
                    headerName: 'SL',
                    width: 50
                },
                {
                    field: 'planName',
                    headerName: 'PLAN NAME',
                    width: 180 // Increased width
                },
                {
                    field: 'price',
                    headerName: 'PRICE',
                    width: 150 // Increased width
                },
                {
                    field: 'hsnNo',
                    headerName: 'HSNNO',
                    width: 150 // Increased width
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 280,
                    sortable: false,
                    // renderCell is required to render JSX (<Button>)
                    renderCell: (params) => (params.value)
                }
            ],
            // Define rows for DataGrid
            rows: [],
            // The old 'tableData' state is no longer needed
            // --- END KEY CHANGE ---

            // --- KEY CHANGE (STATE) ---
            // These are no longer needed, as SweetAlert was unused
            // success_msg: false,
            // modal_type: 'success',
            // success_message: '',
            // modal_standard: false,
            // --- END KEY CHANGE ---
            
            modal_delete: false,
            delete_sid: '',
            isDeleting: false,
            isLoading: false,
        };
        // this.tog_standard = this.tog_standard.bind(this); // tog_standard was not used
        this.tog_delete = this.tog_delete.bind(this);
        this.loadFixedBundles = this.loadFixedBundles.bind(this);
        this.deleteFixedPlan = this.deleteFixedPlan.bind(this);
    }

    componentDidMount() {
        console.log('All clkients components')
        this.props.activateAuthLayout();
        this.loadFixedBundles();
    }

    loadFixedBundles(){
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(`api/v1/pricing/price/${getLoggedInUser().id}/all`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }

            // --- KEY CHANGE (DATAGRID MAPPING) ---
            // 1. DataGrid needs a unique 'id' field, which 'item.id' provides.
            // 2. The map function was incorrectly returning 'true', fixed to return 'item'.
            const formattedRows = res.data.reverse().map((item, index)=>{
                item.slno = (index+1);
                item.price = '₹ '+item.netPrice;
                item.action = <div><Button title="Manage" onClick={()=>null}  type="button" color="info" size="sm" className="waves-effect waves-light mr-2 mb-2"><i className="fa fa-eye"></i></Button>
                <Button title="Manage" onClick={()=>null}  type="button" color="primary" size="sm" className="waves-effect waves-light mr-2 mb-2"><i className="fa fa-edit"></i></Button>
                <Button title="Delete" onClick={()=>this.tog_delete(item.id)} type="button" color="danger" size="sm" className="waves-effect mr-2 mb-2"><i className="fa fa-trash"></i></Button></div>;

                return item; // FIX: Was 'return true'
            });  

            this.setState({isLoading: false, rows: formattedRows}); // Set the new 'rows' state
            // --- END KEY CHANGE ---
        })
        .catch(error => console.log('error', error));
    }

    manageClient(id) {        
        this.props.history.push({pathname: '/manageClient', state: { clientId: id }});
    }

    // tog_standard() { // This function was unused
    //     this.setState(prevState => ({
    //         modal_standard: !prevState.modal_standard
    //     }));
    //     this.removeBodyCss();
    // }

    tog_delete(id) {
        this.setState({
            modal_delete: !this.state.modal_delete,
            delete_sid: id,
        });
        this.removeBodyCss();
    }

    removeBodyCss() {
        document.body.classList.add('no_padding');
    }

    // This function already uses openSnack, so no SweetAlert change is needed
    deleteFixedPlan(){
        if (this.state.delete_sid === "") { return false; }

        this.setState({isDeleting: true});

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).delete("api/v1/pricing/plan/delete/"+this.state.delete_sid)
          .then(res => {
            if (res.status === 404) {
                this.props.openSnack({type: 'error', message: 'Unable to remove plan.'})
                this.setState({isDeleting: false});
                this.tog_delete();
                return;
            }
            this.props.openSnack({type: 'success', message: 'Plan Removed!'})
            this.setState({isDeleting: false});
            this.loadFixedBundles();
            this.tog_delete();

          })
          .catch(error => console.log('error', error));
    }

    render() {

        if (this.state.isLoading) { return(<Empty imageStyle={{marginTop: 100}} description="Loading Data Please Wait..."></Empty>) }

        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (Header/Title Row remains unchanged) ... */}
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">View Plans</h4>
                            </Col>
                            <Col sm="6">
                                <div className="float-right d-none d-md-block">
                                    <Button onClick={()=>this.props.history.push('/addPricePlan')} type="button" color="primary" size="sm" className="waves-effect"><i className="fa fa-plus mr-2"></i> Add Fixed Plan</Button>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col md="8">
                            <Card>
                                <CardBody>

                                    {/* --- KEY CHANGE (MDBDATATABLE REPLACEMENT) --- */}
                                    {/* <MDBDataTable
                                        sortable
                                        responsive
                                        striped
                                        hover
                                        data={this.state.tableData}
                                        footer={false}
                                        foot={false}
                                    /> */}
                                    <Box sx={{ height: 400, width: '100%' }}>
                                        <DataGrid
                                            rows={this.state.rows}
                                            columns={this.state.columns}
                                            pageSize={5}
                                            rowsPerPageOptions={[5, 10, 20]}
                                            // DataGrid will use the 'id' field from your data automatically
                                            getRowId={(row) => row.id} 
                                            disableSelectionOnClick
                                        />
                                    </Box>
                                    {/* --- END KEY CHANGE --- */}

                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    {/* --- KEY CHANGE (SWEETALERT BLOCK DELETED) --- */}
                    {/* The old <SweetAlert> component was deleted from here.
                        It was unused, and the import was blocking the build. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert ... >
                        </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}


                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        {/* ... (Reactstrap Modal remains unchanged) ... */}
                    </Modal>

                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout, openSnack })(ViewFixedPlan);