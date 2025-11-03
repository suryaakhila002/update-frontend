import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Tag, Empty } from 'antd';
import { getLoggedInUser } from '../../helpers/authUtils';
import {ServerApi} from '../../utils/ServerApi';

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

class AllClients extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // --- KEY CHANGE (DATAGRID COLUMNS) ---
            // We define columns directly in state, matching the DataGrid API
            columns: [
                {
                    field: 'slno',
                    headerName: 'SL',
                    width: 50
                },
                {
                    field: 'userName',
                    headerName: 'USERNAME',
                    width: 120
                },
                {
                    field: 'userType',
                    headerName: 'USER TYPE',
                    width: 150,
                    // renderCell tells DataGrid how to render JSX
                    renderCell: (params) => (params.value)
                },
                {
                    field: 'createdTime',
                    headerName: 'DATE',
                    width: 120
                },
                {
                    field: 'wallet',
                    headerName: 'Wallet',
                    width: 100,
                    renderCell: (params) => (params.value)
                },
                {
                    field: 'status',
                    headerName: 'STATUS',
                    width: 100,
                    renderCell: (params) => (params.value)
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 280,
                    sortable: false,
                    renderCell: (params) => (params.value)
                }
            ],
            // We will store just the rows in a separate state property
            rows: [],
            // --- END KEY CHANGE ---
            
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed, as SweetAlert2 is called imperatively
            // success_msg: false,
            // modal_type: 'success',
            // success_message: '',
            // modal_standard: false,
            // --- END KEY CHANGE ---

            modal_delete: false,
            delete_sid: '',
            isDeleting: false,
            isLoading: true,
        };
        // this.tog_standard = this.tog_standard.bind(this); // tog_standard was not used
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteCient = this.deleteCient.bind(this);
        this.manageClient = this.manageClient.bind(this);
    }

    componentDidMount() {
        console.log('All clkients components')
        this.props.activateAuthLayout();
        this.loadClients();
    }

    manageClient(id) {        
        this.props.history.push({pathname: '/manageClient', state: { clientId: id }});
    }

    // tog_standard() { // This function was not used
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

    deleteCient(){
        if (this.state.delete_sid === "") { return false; }

        this.setState({isDeleting: true});

        var raw = {
            clientId: this.state.delete_sid,
        }

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).post('auth/deleteUser/', raw)
          .then(res => {
            if (res.status === 404) {
                // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
                // this.setState({success_msg: true, success_message: 'Unable to remove user.',modal_type: 'error', isDeleting: false});
                MySwal.fire({
                    title: 'Error!',
                    text: 'Unable to remove user.',
                    icon: 'error'
                });
                this.setState({isDeleting: false});
                // --- END KEY CHANGE ---
                this.tog_delete();
                return;
            }
            
            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({success_msg: true, modal_type: 'success', success_message: 'User Removed.', isDeleting: false});
            MySwal.fire({
                title: 'User Removed!',
                icon: 'success'
            });
            this.setState({isDeleting: false});
            // --- END KEY CHANGE ---

            this.loadClients();
            this.tog_delete();

          })
          .catch(error => {
              console.log('error', error);
              this.setState({isDeleting: false});
              MySwal.fire('Error!', 'An error occurred.', 'error');
          });
    }

    loadClients(){
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(`getAllClients/${getLoggedInUser().id}`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }

            // --- KEY CHANGE (DATAGRID MAPPING) ---
            // DataGrid requires a unique 'id' field, which 'item.id' already provides
            const formattedRows = res.data.map((item, index)=>{
                item.slno = (index+1);
                item.createdTime = new Date(item.createDate).toDateString(); 
                item.userType = (item.userType === 'ADMIN')?(<Tag color="green">ADMIN</Tag>):(item.userType === 'RESELLER')?(<Tag color="blue">{item.userType}</Tag>):(<Tag color="red">{item.userType}</Tag>);
                item.wallet = <p>{Math.round((parseFloat(item.wallet.closingCredit) + Number.EPSILON) * 1000000) / 1000000}</p>;
                item.action = <div><Button title="Manage" onClick={()=>this.manageClient(item.id)}  type="button" color="primary" size="sm" className="waves-effect waves-light mr-2 mb-2"><i className="fa fa-edit"></i></Button>
                        {(item.status === 'ACTIVE')?(<Button onClick={()=>this.permitClientId(false, item.id)} type="button" color="warning" title="Deactivate" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-info"></i></Button>):(<Button title="Activate" onClick={()=>this.permitClientId(true, item.id)} type="button" color="success" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-check"></i></Button>)}</div>
                item.status = (item.status === 'ACTIVE')?(<Tag color="green">Active</Tag>):(<Tag color="red">Inactive</Tag>);
                // item.id is already present, so DataGrid will find it.
                return item;
            });  

            this.setState({isLoading: false, rows: formattedRows}); // Use the new 'rows' state
            // --- END KEY CHANGE ---

          })
          .catch(error => {
               console.log('error', error);
               this.setState({isLoading: false});
            });
    }

    permitClientId(status, id){
        if (id === "") { return false; }

        var raw = {
            clientId: id,
            creatorId: "string",
            description: "string",
            status: status
          }

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).post(`auth/activateUser/`, raw)
          .then(res => {
            this.loadClients();
            
            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({success_msg: true, success_message: 'Client Updated.', isAdding: false});
            MySwal.fire({
                title: 'Success!',
                text: 'Client Updated.',
                icon: 'success'
            });
            this.setState({isAdding: false}); // This was in the original, keeping it
            // --- END KEY CHANGE ---
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
                                <h4 className="page-title">All Clients</h4>
                            </Col>
                            <Col sm="6">
                                <div className="float-right d-none d-md-block">
                                    {getLoggedInUser().userType === 'SUPER_ADMIN' && (
                                        <Button onClick={()=>this.props.history.push('/superadminCreateClients')} type="button" color="primary" size="sm" className="waves-effect"><i className="fa fa-plus mr-2"></i> Add New Client</Button>
                                    )}
                                    {getLoggedInUser().userType === 'ADMIN' && (
                                        <Button onClick={()=>this.props.history.push('/adminCreateClients')} type="button" color="primary" size="sm" className="waves-effect"><i className="fa fa-plus mr-2"></i> Add New Client</Button>
                                    )}
                                    {getLoggedInUser().userType === 'RESELLER' && (
                                        <Button onClick={()=>this.props.history.push('/resellerCreateClients')} type="button" color="primary" size="sm" className="waves-effect"><i className="fa fa-plus mr-2"></i> Add New Client</Button>
                                    )}
                                </div>
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
                                        data={this.state.tableData}
                                        footer={false}
                                        foot={false}
                                    /> */}
                                    <Box sx={{ height: 600, width: '100%' }}>
                                        <DataGrid
                                            rows={this.state.rows}
                                            columns={this.state.columns}
                                            pageSize={10}
                                            rowsPerPageOptions={[10, 25, 100]}
                                            // 'id' is already in the data from the API
                                            // getRowId={(row) => row.id} // Not needed if 'id' field exists
                                            disableSelectionOnClick
                                        />
                                    </Box>
                                    {/* --- END KEY CHANGE --- */}

                                </CardBody>
                            </Card>
                        </Col>
                    </Row>


                    {/* --- KEY CHANGE (SWEETALERT BLOCK DELETED) --- */}
                    {/* The old <SweetAlert> component is DELETED from the render method.
                        It is now triggered as a function call in class methods. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert ... >
                        </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}


                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        {/* ... (This is a Reactstrap Modal, NOT SweetAlert. It remains unchanged.) ... */}
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_delete: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h6 className="text-center">Are You Sure You want to delete ?</h6>

                            <FormGroup className="mt-5 text-center">
                                <Button onClick={this.deleteCient} type="button" color="danger" className="mr-1">
                                    {(this.state.isDeleting)?'Please Wait...':'Delete'}
                                </Button>
                                <Button type="button" color="secondary" className="mr-1" onClick={() => this.setState({ modal_delete: false })} data-dismiss="modal" aria-label="Close">
                                    Cancel
                                </Button>
                            </FormGroup >

                        </ModalBody>
                    </Modal>

                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout })(AllClients);