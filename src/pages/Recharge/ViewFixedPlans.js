import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody, Table } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {ServerApi} from '../../utils/ServerApi';
import { Empty, Tag } from 'antd';
import { getLoggedInUser } from '../../helpers/authUtils';
// import {Button} from '@mui/material'; // Already imported from reactstrap

// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated

import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
import Swal from 'sweetalert2'; // ADDED: Modern Alert Library
import withReactContent from 'sweetalert2-react-content'; // ADDED: React wrapper
// --- END KEY CHANGES ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

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
                    width: 180
                },
                {
                    field: 'price',
                    headerName: 'PRICE',
                    width: 150
                },
                {
                    field: 'hsnNo',
                    headerName: 'HSNNO',
                    width: 150
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
            // These are no longer needed for SweetAlert2
            // success_msg: false,
            // modal_type: 'success',
            // success_message: '',
            // modal_standard: false,
            // showDetail: false,
            // showDetailId: 0,
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
        this.showDetailsModal = this.showDetailsModal.bind(this); // ADDED
    }

    componentDidMount() {
        console.log('All clkients components')
        this.props.activateAuthLayout();
        this.loadFixedBundles();
    }
    
    // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
    // This new function shows the details modal imperatively
    showDetailsModal = (index) => {
        const rowData = this.state.rows[index];
        MySwal.fire({
            title: <span>PLAN <small>Details</small>!</span>,
            html: (
                <Table>
                    <thead>
                        <tr>
                        <th>SMS Balance</th>
                        <th>Customer Support</th>
                        <th>Reseller Panel</th>
                        <th>API Access</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {/* Use 'netPrice' from the original item, as 'price' is formatted */}
                            <th scope="row">{rowData.netPrice}</th>
                            <td>24/7</td>
                            <td><Tag color="red">No</Tag></td>
                            <td><Tag color="red">No</Tag></td>
                        </tr>
                    </tbody>
                </Table>
            ),
            confirmButtonText: 'Buy Now',
        });
    }
    // --- END KEY CHANGE ---


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
                // Updated onClick to call the new modal function
                item.action = <div><Button title="View Features" onClick={()=>this.showDetailsModal(index)}  type="button" color="info" size="sm" className="waves-effect waves-light mr-2 mb-2"><i className="fa fa-eye"></i></Button>
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

    deleteFixedPlan(){
        if (this.state.delete_sid === "") { return false; }

        this.setState({isDeleting: true});

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).delete("api/v1/pricing/plan/delete/"+this.state.delete_sid)
          .then(res => {
            if (res.status === 404) {
                // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
                // this.setState({success_msg: true, success_message: 'Unable to remove plan.',modal_type: 'error', isDeleting: false});
                this.setState({isDeleting: false});
                MySwal.fire({
                    title: 'Error!',
                    text: 'Unable to remove plan.',
                    icon: 'error'
                });
                // --- END KEY CHANGE ---
                this.tog_delete();
                return;
            }
            
            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({success_msg: true, modal_type: 'success', success_message: 'Plan Removed.', isDeleting: false});
            this.setState({isDeleting: false});
            MySwal.fire('Plan Removed!', '', 'success');
            // --- END KEY CHANGE ---

            this.loadFixedBundles();
            this.tog_delete();
          })
          .catch(error => {
              console.log('error', error);
              this.setState({isDeleting: false});
              MySwal.fire('Error!', 'An error occurred.', 'error');
          });
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
                                <h4 className="page-title">SMS PRICE PLAN</h4>
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


                    {/* --- KEY CHANGE (SWEETALERT BLOCKS DELETED) --- */}
                    {/* Both <SweetAlert> blocks are DELETED from the render method.
                        They are now triggered as function calls. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert ... >
                        </SweetAlert> 
                    } */}
                    {/* {this.state.showDetail && (
                        <SweetAlert ... >
                        </SweetAlert>
                    )} */}
                    {/* --- END KEY CHANGE --- */}
                    
                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        {/* ... (Reactstrap Modal remains unchanged) ... */}
                    </Modal>

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(ViewFixedPlan));