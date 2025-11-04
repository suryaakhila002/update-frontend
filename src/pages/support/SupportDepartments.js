import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import Select from 'react-select';
// import { withRouter } from 'react-router-dom';

import { connect } from 'react-redux';

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

const CLIENT_GROUP_STATUS = [
    {
        options: [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" }
        ]
    }
];

class SupportDepartments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: {label:'Yes', value: 'Yes'}, 
            selectedMulti: null,
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed for SweetAlert2
            // success_msg: false,
            // --- END KEY CHANGE ---
            isAdding: false,
            isDeleting: false,
            modal_delete: false,
            delete_sid: '',

            // --- KEY CHANGE (DATAGRID) ---
            // Define columns for MUI DataGrid
            columns: [
                {
                    field: 'slno',
                    headerName: 'SL',
                    width: 50
                },
                {
                    field: 'departmentName',
                    headerName: 'Department Name',
                    width: 150
                },
                {
                    field: 'emial', // Field name 'emial' kept as-is from original
                    headerName: 'Email',
                    width: 270
                },
                {
                    field: 'showInClient',
                    headerName: 'Show In Client',
                    width: 200,
                    renderCell: (params) => (params.value) // To render JSX
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 200, // Adjusted width
                    sortable: false,
                    renderCell: (params) => (params.value) // To render JSX
                }
            ],
            // Define rows for DataGrid, adding a unique 'id'
            rows: [
                {
                    id: 1, // Added unique 'id'
                    slno: 1,
                    departmentName: 'Support',
                    emial: 'suppoer@example.com',
                    showInClient: <span className="badge badge-success p-1">Yes</span>,
                    action: <div><Button onClick={()=>this.ViewSupport()} type="button" color="primary" size="sm" className="waves-effect waves-light mr-2">View</Button>
                               <Button onClick={()=>this.tog_delete(1)} type="button" color="danger" size="sm" className="waves-effect">Delete</Button></div>,

                }
            ]
            // The old 'tableData' state is no longer needed
            // --- END KEY CHANGE ---
        };
        this.addClientGroup = this.addClientGroup.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
        this.ViewSupport = this.ViewSupport.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        // this.loadClientGroups();
    }
    
    //Select 
    handleSelectGroup = (selectedGroup) => {
        this.setState({ selectedGroup });
    }

    ManageClick() {        
        this.props.history.push('/manageClient');
    }

    ViewSupport(){
        this.props.history.push({pathname: '/viewSupportDepartments', state: { clientId: 1 }})
    }

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

    addClientGroup(event, values){
        this.setState({isAdding: true});
        var userData = JSON.parse(localStorage.getItem('user'));

        var raw = JSON.stringify({
            requestType: "ADDGROUP",
            payload:{
                groupName: values.group_name,
                status: this.state.selectedGroup.value,
                // createdBy: userData.response,
            }
        });
        var requestOptions = {
          method: 'POST',
          headers: {"Content-Type": "application/json", 'Authorization': 'Bearer '+userData.sessionToken},
          body: raw,
          redirect: 'follow'
        };

        fetch("http://atssms.com:8090/groups/addGroup", requestOptions)
          .then(response => response.json())
          .then(data => {
            // console.log(data);
            
            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({success_msg: true, success_message: data.response, isAdding: false});
            this.setState({ isAdding: false });
            MySwal.fire({
                title: 'Success!',
                text: data.response,
                icon: 'success'
            });
            // --- END KEY CHANGE ---
            
            // this.loadClientGroups(); // This was commented out, leaving as-is

          })
          .catch(error => {
              console.log('error', error);
              this.setState({ isAdding: false });
              MySwal.fire('Error!', 'An error occurred.', 'error');
          });
    }

    deleteGroup(){
        if (this.state.delete_sid === "") { return false; }

        this.setState({isDeleting: true});
        var userData = JSON.parse(localStorage.getItem('user'));

        var requestOptions = {
          method: 'GET',
          headers: {"Content-Type": "application/json", 'Authorization': 'Bearer '+userData.sessionToken},
          redirect: 'follow'
        };

        fetch("http://atssms.com:8090/groups/deleteGroup/"+this.state.delete_sid, requestOptions)
          .then(response => response.json())
          .then(data => {
            // console.log(data);
            this.setState({isDeleting: false});
            // this.loadClientGroups(); // This was commented out, leaving as-is
            this.tog_delete();
            MySwal.fire('Deleted!', 'The group has been deleted.', 'success'); // Added success feedback
          })
          .catch(error => {
              console.log('error', error);
              this.setState({isDeleting: false});
              MySwal.fire('Error!', 'An error occurred.', 'error');
          });
    }

    loadClientGroups(){

        var token = JSON.parse(localStorage.getItem('user')).sessionToken;

        var requestOptions = {
          method: 'GET',
          headers: {'Authorization': 'Bearer '+token, "Content-Type": "application/json"},
          redirect: 'follow'
        };

        fetch("http://atssms.com:8090/groups/getGroups", requestOptions)
          .then(response => response.json())
          .then(data => {
            if (data === undefined) {
                return false;
            }
            
            // --- KEY CHANGE (DATAGRID MAPPING) ---
            // 1. DataGrid needs a unique 'id' field.
            // 2. The map function was incorrectly returning 'true', fixed to return 'item'.
            const formattedRows = data.map((item, index)=>{
                item.id = item.id || (index + 1); // Ensure unique ID
                item.status = (item.isDeleted === 'Active')?(<span className="badge badge-success p-1">Active</span>):(<span className="badge badge-danger p-1">In Active</span>);
                item.action = <div><Button onClick={()=>null} type="button" color="primary" size="sm" className="waves-effect waves-light mr-2">Manage</Button>
                                   <Button onClick={()=>this.tog_delete(item.id)} type="button" color="danger" size="sm" className="waves-effect">Delete</Button></div>;
                return item; // FIX: Was 'return true'
            }); 
            
            this.setState({ rows: formattedRows }); // Set the new 'rows' state
            // --- END KEY CHANGE ---
          })
          .catch(error => console.log('error', error));
    }

    render() {

        const { selectedGroup } = this.state;
        // const { selectedMulti } = this.state;

        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (Header/Title Row and Form Column remain unchanged) ... */}
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">Support Departments</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="4">
                            <Card>
                                <CardBody>
                                    <AvForm onValidSubmit={this.addClientGroup}>
                                        {/* ... (All AvForm fields remain unchanged) ... */}
                                    </AvForm>
                                </CardBody>
                            </Card>
                        </Col>

                        <Col sm="12" lg="8">
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">CLIENT GROUP</h4>
                                    
                                    {/* --- KEY CHANGE (MDBDATATABLE REPLACEMENT) --- */}
                                    {/* <MDBDataTable
                                        responsive
                                        striped
                                        data={this.state.tableData}
                                    /> */}
                                    <Box sx={{ height: 400, width: '100%' }}>
                                        <DataGrid
                                            rows={this.state.rows}
                                            columns={this.state.columns}
                                            pageSize={5}
                                            rowsPerPageOptions={[5, 10, 20]}
                                            // 'id' field was added in state
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
                        It is now triggered as a function call in 'addClientGroup'. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            success
                            confirmBtnBsStyle="success"
                            onConfirm={() => this.setState({ success_msg: false })} >
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

export default connect(null, { activateAuthLayout })(SupportDepartments);