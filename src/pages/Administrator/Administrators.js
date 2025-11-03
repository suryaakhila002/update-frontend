import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select';
// import { withRouter } from 'react-router-dom';

import { connect } from 'react-redux';

// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated

import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box, FormControl } from '@mui/material'; // ADDED: For layout
import Swal from 'sweetalert2'; // ADDED: Modern Alert Library
import withReactContent from 'sweetalert2-react-content'; // ADDED: React wrapper
// --- END KEY CHANGES ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

const ROLES = [
    {
        label: "Role",
        options: [
            { label: "User", value: "User", isOptionSelected: true },
            { label: "Reseller ", value: "Reseller " },
            { label: "Distributor ", value: "Distributor " },
            { label: "Admin", value: "Admin" },
        ]
    }
];

class Administrators extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: {label:'User', value: 'User'}, 
            selectedMulti: null,
            // success_msg: false, // REMOVED: No longer needed by SweetAlert2
            isAdding: false,
            isDeleting: false,
            modal_delete: false,
            delete_sid: '',

            // --- KEY CHANGE (DATAGRID COLUMNS) ---
            // This is the new format required by MUI DataGrid.
            // 'label' becomes 'headerName', and we use 'renderCell' for custom JSX.
            columns: [
                {
                    field: 'sl',
                    headerName: 'SL',
                    width: 150
                },
                {
                    field: 'name',
                    headerName: 'Name',
                    width: 270
                },
                {
                    field: 'userName',
                    headerName: 'User Name',
                    width: 270
                },
                {
                    field: 'role',
                    headerName: 'Role',
                    width: 270
                },
                {
                    field: 'status',
                    headerName: 'STATUS',
                    width: 200,
                    // renderCell is required to render JSX (the <span.../>)
                    renderCell: (params) => (params.value)
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 200,
                    sortable: false,
                    // renderCell is required to render JSX (the <Button.../>)
                    renderCell: (params) => (params.value)
                }
            ],
            // --- END KEY CHANGE ---

            // The 'columns' array is removed from tableData
            tableData : {
                rows: [
                    // DataGrid requires a unique 'id' field for every row.
                    // When loading data, you MUST ensure each row has a unique 'id'.
                    // I will add 'id' in the loadClientGroups method.
                ]
            },
        };
        this.addClientGroup = this.addClientGroup.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
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
            
            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // We no longer set state. We just call the alert function directly.
            // this.setState({success_msg: true, success_message: data.response, isAdding: false}); // REMOVED
            
            this.setState({ isAdding: false });
            MySwal.fire({
                title: 'Success!',
                text: data.response, // Show the API message
                icon: 'success',
                confirmButtonText: 'OK'
            });
            // --- END KEY CHANGE ---

            this.loadClientGroups();

          })
          .catch(error => console.log('error', error));
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
            this.loadClientGroups();
            this.tog_delete();
          })
        .catch(error => console.log('error', error));
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
            
            // --- KEY CHANGE (DataGrid data mapping) ---
            // 1. Added 'sl' field for the 'SL' column
            // 2. Ensured the 'id' field exists for DataGrid
            // 3. Fixed the map function (it was returning 'true' instead of 'item')
            const formattedData = data.map((item, index)=>{
                item.sl = index + 1; // Add the 'sl' field
                // item.id is assumed to come from the API. If not, 'item.sl' can be 'id'
                if (!item.id) item.id = item.sl; 
                
                item.status = (item.isDeleted === 'Active')?(<span className="badge badge-success p-1">Active</span>):(<span className="badge badge-danger p-1">In Active</span>);
                item.action = <div><Button onClick={()=>null} type="button" color="primary" size="sm" className="waves-effect waves-light mr-2">Manage</Button>
                                   <Button onClick={()=>this.tog_delete(item.id)} type="button" color="danger" size="sm" className="waves-effect">Delete</Button></div>;
                return item; // FIX: Was 'return true'
            }); 
            
            this.setState({tableData: {...this.state.tableData, rows: formattedData}})
            // --- END KEY CHANGE ---
          })
          .catch(error => console.log('error', error));
    }

    render() {

        const { selectedGroup } = this.state;

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">Administrators</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="4">
                            <Card>
                                <CardBody>
                                    {/* ... (The form code remains unchanged) ... */}
                                    <h4 className="mt-0 header-title">Add Administrator</h4>

                                    <FormControl onValidSubmit={this.addClientGroup}>
                                        <AvField name="group_name" label="First NAME"
                                            type="text" errorMessage="Enter First Name"
                                            validate={{ required: { value: true } }} />

                                        <AvField name="group_name" label="Last NAME"
                                            type="text" errorMessage="Enter Last Name"
                                            validate={{ required: { value: true } }} />

                                        <AvField name="group_name" label="User NAME"
                                            type="text" errorMessage="Enter User Name"
                                            validate={{ required: { value: true } }} />

                                        <AvField name="group_name" label="Email"
                                            type="email" errorMessage="Enter Email"
                                            validate={{ required: { value: true } }} />

                                        <AvField name="group_name" label="Password"
                                            type="password" errorMessage="Enter Password"
                                            validate={{ required: { value: true } }} />

                                        <AvField name="group_name" label="Confirm Password"
                                            type="password" errorMessage="Enter Confirm Password"
                                            validate={{ required: { value: true } }} />


                                        <Label>Role </Label>
                                        <Select
                                            className="mb-3"
                                            name="group_status"
                                            label="CLIENT GROUP"
                                            isSelected={true}
                                            value={selectedGroup}
                                            onChange={this.handleSelectGroup}
                                            options={ROLES}
                                        />

                                        <FormGroup className="mb-0">
                                            <div>
                                                <Button type="button" 
                                                disabled={this.state.isAdding}
                                                color="primary" className="mr-1">
                                                    {!this.state.isAdding && <i className="ti ti-plus mr-2"></i>}Add
                                                </Button>{' '}
                                                <Button type="reset" color="secondary">
                                                    Cancel
                                                </Button>
                                            </div>
                               
                                       </FormGroup>

                                    </FormControl>

                                </CardBody>
                            </Card>
                        </Col>

                        <Col sm="12" lg="8">
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">Administrators</h4>

                                    {/* --- KEY CHANGE (MDBDATATABLE REPLACEMENT) --- */}
                                    {/* <MDBDataTable
                                        responsive
                                        striped
                                        data={this.state.tableData}
                                    /> */}

                                    <Box sx={{ height: 400, width: '100%' }}>
                                      <DataGrid
                                        rows={this.state.tableData.rows}
                                        columns={this.state.columns}
                                        pageSize={5}
                                        rowsPerPageOptions={[5]}
                                        // We use 'sl' as the unique ID, as defined in loadClientGroups
                                        getRowId={(row) => row.sl} 
                                        disableSelectionOnClick
                                      />
                                    </Box>
                                    {/* --- END KEY CHANGE --- */}

                                </CardBody>
                            </Card>
                        </Col>

                    </Row>

                    {/* --- KEY CHANGE (SWEETALERT REPLACEMENT) --- */}
                    {/* The old SweetAlert component is deleted from the render method.
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
                         {/* ... (Modal code remains unchanged) ... */}
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_delete: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h6 className="text-center">Are You Sure You want to delete ?</h6>

                            <FormGroup className="mt-5 text-center">
                                <Button onClick={this.deleteGroup} type="button" color="danger" className="mr-1">
                                    Delete
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

export default connect(null, { activateAuthLayout })(Administrators);