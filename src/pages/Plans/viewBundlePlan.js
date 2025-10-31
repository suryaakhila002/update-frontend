import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody, Table } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {ServerApi} from '../../utils/ServerApi';
import { Empty } from 'antd';
import { getLoggedInUser } from '../../helpers/authUtils';

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

class viewBundlePlan extends Component {
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
            // --- END KEY CHANGE ---
            
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed for SweetAlert2
            // success_msg: false,
            // modal_type: 'success',
            // success_message: '',
            // modal_standard: false,
            // showDetail: false,
            // showDetailId: '',
            // --- END KEY CHANGE ---

            modal_delete: false,
            delete_sid: '',
            isDeleting: false,
            isLoading: false,
        };
        // this.tog_standard = this.tog_standard.bind(this); // tog_standard was not used
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteBundlePlan = this.deleteBundlePlan.bind(this);
        this.showDetailsModal = this.showDetailsModal.bind(this); // ADDED
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadBundlePlans();
    }

    deleteBundlePlan(){
        if (this.state.delete_sid === "") { return false; }

        this.setState({isDeleting: true});

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).delete("api/v1/pricing/bundle/delete/"+this.state.delete_sid)
          .then(res => {
            if (res.status === 404) {
                // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
                // this.setState({success_msg: true, success_message: 'Unable to remove plan.',modal_type: 'error', isDeleting: false});
                this.setState({ isDeleting: false });
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
            this.setState({ isDeleting: false });
            MySwal.fire('Plan Removed!', '', 'success');
            // --- END KEY CHANGE ---
            
            this.loadBundlePlans(); // Changed from loadFixedBundles, which didn't exist
            this.tog_delete();
          })
          .catch(error => {
              console.log('error', error);
              this.setState({ isDeleting: false });
              MySwal.fire('Error!', 'An error occurred.', 'error');
          });
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
                        <th>#</th>
                        <th>UNIT FROM</th>
                        <th>UNIT TO</th>
                        <th>PRICE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rowData.bundles.map((i, idx) => {
                            return <tr key={idx}>
                                <th scope="row">{idx+1}</th>
                                <td>{i.startingUnit}</td>
                                <td>{i.endingUnit}</td>
                                <td>₹ {i.unitPrice}</td>
                            </tr>
                        })}
                    </tbody>
                </Table>
            ),
            // 'onConfirm' and 'onCancel' are not needed,
            // the modal will close on 'OK' by default.
        });
    }
    // --- END KEY CHANGE ---

    loadBundlePlans(){
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(`api/v1/pricing/bundle/${getLoggedInUser().id}/all`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }

            // --- KEY CHANGE (DATAGRID MAPPING) ---
            const formattedRows = res.data.map((item, index)=>{
                item.slno = (index+1);
                // item.id is already provided by the API, which DataGrid needs
                item.action = <div>
                    {/* Changed onClick to call the new modal function */}
                    <Button title="Manage" onClick={()=>this.showDetailsModal(index)}  type="button" color="info" size="sm" className="waves-effect waves-light mr-2 mb-2"><i className="fa fa-eye"></i></Button>
                    <Button title="Manage" onClick={()=>null}  type="button" color="primary" size="sm" className="waves-effect waves-light mr-2 mb-2"><i className="fa fa-edit"></i></Button>
                    <Button title="Delete" onClick={()=>this.tog_delete(item.id)} type="button" color="danger" size="sm" className="waves-effect mr-2 mb-2"><i className="fa fa-trash"></i></Button>
                </div>;
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
        this.setState(prevState => ({
            modal_delete: !prevState.modal_delete,
            delete_sid: id,
        }));
        this.removeBodyCss();
    }

    removeBodyCss() {
        document.body.classList.add('no_padding');
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
                                <h4 className="page-title">View Bundle Plans</h4>
                            </Col>
                            <Col sm="6">
                                <div className="float-right d-none d-md-block">
                                    {this.state.rows.length === 0 && ( // Changed to use new 'rows' state
                                        <Button onClick={()=>this.props.history.push('/addBundle')} type="button" color="primary" size="sm" className="waves-effect"><i className="fa fa-plus mr-2"></i> Add Bundle Plan</Button>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col md="7">
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

export default withRouter(connect(null, { activateAuthLayout })(viewBundlePlan));