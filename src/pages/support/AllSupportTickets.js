import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {ServerApi} from '../../utils/ServerApi';
// import { Table } from 'antd';
import {Tag} from 'antd';
import {getLoggedInUser} from '../../helpers/authUtils';
//  // This was commented out, leaving as-is

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

class AllSupportTickets extends Component {
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
                    field: 'clientName',
                    headerName: 'CLIENT NAME',
                    width: 150
                },
                {
                    field: 'email',
                    headerName: 'EMAIL',
                    width: 270
                },
                {
                    field: 'subject',
                    headerName: 'SUBJECT',
                    width: 240
                },
                {
                    field: 'date',
                    headerName: 'DATE',
                    width: 100 // Adjusted width
                },
                {
                    field: 'status',
                    headerName: 'STATUS',
                    width: 100,
                    renderCell: (params) => (params.value) // To render JSX
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 200,
                    sortable: false,
                    renderCell: (params) => (params.value) // To render JSX
                }
            ],
            // Define rows for DataGrid
            rows: [
                {
                    id: 1, // Added unique 'id'
                    slno: '1',
                    clientName: 'Shamim Rahman',
                    email: 'shamimcoc97@gmail.com',
                    subject: 'Want New Connection',
                    date: '7th Feb 20',
                    status: <span className="badge badge-success p-1">closed</span>,
                    action: <div><Button onClick={()=>this.manageClient(1)}  type="button" color="primary" size="sm" className="waves-effect waves-light mr-2 mb-2">Manage</Button>
                    <Button onClick={()=>this.tog_delete(1)} type="button" color="danger" size="sm" className="waves-effect mb-2">Delete</Button></div>
                }
            ],
            // The old 'tableData' state is no longer needed
            // --- END KEY CHANGE ---

            // --- KEY CHANGE (STATE) ---
            // These are no longer needed for SweetAlert2
            // success_msg: false,
            // modal_type: 'success',
            // success_message: '',
            // modal_standard: false,
            // --- END KEY CHANGE ---
            
            modal_delete: false,
            delete_sid: '',
            isDeleting: false,
        };
        // this.tog_standard = this.tog_standard.bind(this); // tog_standard was not used
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteCient = this.deleteCient.bind(this);
        this.manageClient = this.manageClient.bind(this)
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        // this.loadClients();
    }

    manageClient(id) {        
        this.props.history.push({pathname: '/manageTicket', state: { clientId: id }});
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

    deleteCient(){
        if (this.state.delete_sid === "") { return false; }

        this.setState({isDeleting: true});
        var userData = JSON.parse(localStorage.getItem('user'));

        var requestOptions = {
          method: 'GET',
          headers: {"Content-Type": "application/json", 'Authorization': 'Bearer '+userData.sessionToken},
          redirect: 'follow'
        };

        fetch("http://atssms.com:8090/deleteClient/"+this.state.delete_sid, requestOptions)
          .then(response => response.json())
          .then(data => {
            if (data.status === 404) {
                // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
                // this.setState({success_msg: true, success_message: 'Unable to remove user.',modal_type: 'error', isDeleting: false});
                this.setState({isDeleting: false});
                MySwal.fire({
                    title: 'Error!',
                    text: 'Unable to remove user.',
                    icon: 'error'
                });
                // --- END KEY CHANGE ---
                this.tog_delete();
                return;
            }

            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({success_msg: true, modal_type: 'success', success_message: 'User Removed.', isDeleting: false});
            this.setState({isDeleting: false});
            MySwal.fire('User Removed!', '', 'success');
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
        var token = JSON.parse(localStorage.getItem('user')).sessionToken;

        var requestOptions = {
          method: 'GET',
          headers: {'Authorization': 'Bearer '+token, "Content-Type": "application/json"},
          redirect: 'follow'
        };

        fetch("http://atssms.com:8090/getAllClients", requestOptions)
          .then(response => response.json())
          .then(data => {
            if (data === undefined) {
                return false;
            }

            // --- KEY CHANGE (DATAGRID MAPPING) ---
            const formattedRows = data.map((item, index) => {
                item.slno = (index+1);
                // item.id is already provided by the API
                item.contact_details = <p><p className="mb-0">{item.phoneNumber}</p><p>{item.email}</p></p>;
                item.other_details = <p>
                                   <p className="mb-0"><b>USER TYPE:</b> {item.userType}</p>
                                   <p className="mb-0"><b>SMS TYPE:</b> {item.smsType}</p>
                                   <p className="mb-0"><b>ROUTING:</b> </p>
                               </p>;
                item.credits = <p>
                                    <p className="mb-0"><b>ASSIGN:</b> </p>
                                    <p className="mb-0"><b>USED:</b> </p>
                                    <p className="mb-0"><b>REMANING:</b> </p>
                                 </p>;
                item.status = (item.isDeleted === false)?(<span className="badge badge-success p-1">Active</span>):(<span className="badge badge-danger p-1">Blocked</span>);
                item.action = <div><Button onClick={()=>this.manageClient(item.id)}  type="button" color="primary" size="sm" className="waves-effect waves-light mr-2 mb-2">Manage</Button>
                                        {(item.isDeleted === false)?(<Button onClick={()=>null} type="button" color="warning" size="sm" className="waves-effect mb-2">Deactivate</Button>):(<Button onClick={()=>null} type="button" color="success" size="sm" className="waves-effect mb-2">Activate</Button>)}
                                        <Button onClick={()=>this.tog_delete(item.id)} type="button" color="danger" size="sm" className="waves-effect mb-2">Delete</Button></div>
                return item; // FIX: Was 'return true'
            });  

            this.setState({ rows: formattedRows }); // Set the new 'rows' state
            // --- END KEY CHANGE ---
          })
          .catch(error => console.log('error', error));
    }

    render() {

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
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
                                    <Box sx={{ height: 400, width: '100%' }}>
                                        <DataGrid
                                            rows={this.state.rows}
                                            columns={this.state.columns}
                                            pageSize={5}
                                            rowsPerPageOptions={[5, 10, 20]}
                                            // DataGrid will use the 'id' field from your data automatically
                                            getRowId={(row) => row.id || row.slno} 
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
                        It is now triggered as a function call in 'deleteCient'. */}
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

export default connect(null, { activateAuthLayout })(AllSupportTickets);