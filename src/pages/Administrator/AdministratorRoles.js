import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select';
import { withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED

import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
import Swal from 'sweetalert2'; // ADDED: Modern Alert Library
import withReactContent from 'sweetalert2-react-content'; // ADDED: React wrapper

// --- END KEY CHANGES ---

const MySwal = withReactContent(Swal); // Initialize SweetAlert2

const ROLES = [
    {
        label: "Status",
        options: [
            { label: "Active", value: "Active", isOptionSelected: true },
        ]
    }
];

class AdministratorRoles extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: {label:'Active', value: 'Active'}, 
            selectedMulti: null,
            // success_msg: false, // REMOVED: No longer needed by SweetAlert2
            isAdding: false,
            isDeleting: false,
            modal_delete: false,
            delete_sid: '',
            modal_sample: false,
            modal_roles: false,

            // --- KEY CHANGE (DATAGRID COLUMNS) ---
            // MDBDataTable format is different. This is the new format for MUI DataGrid.
            columns: [
                {
                    field: 'slno',
                    headerName: 'SL',
                    width: 100
                },
                {
                    field: 'name',
                    headerName: 'Role Name',
                    width: 270
                },
                {
                    field: 'status',
                    headerName: 'STATUS',
                    width: 150,
                    // renderCell tells DataGrid to render the JSX span
                    renderCell: (params) => (params.value) 
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 300,
                    sortable: false,
                    // renderCell tells DataGrid to render the JSX buttons
                    renderCell: (params) => (params.value)
                }
            ],
            // --- END KEY CHANGE ---

            tableData : {
                // columns property is removed from here
                rows: [
                    {
                        // DataGrid requires a unique 'id' field
                        id: 1, // ADDED
                        slno: 1,
                        name: 'Support Engineer',
                        status: <span className="badge badge-success p-1">Active</span>,
                        action: <div><Button onClick={()=>this.tog_sample()} type="button" color="primary" size="sm" className="waves-effect waves-light mr-2">Edit</Button>
                                   <Button onClick={()=>this.tog_roles()} type="button" color="primary" size="sm" className="waves-effect waves-light mr-2">Set Roles</Button>
                                   <Button onClick={()=>this.tog_delete(1)} type="button" color="danger" size="sm" className="waves-effect">Delete</Button></div>

                    }
                ]
            },
        };
        this.addClientGroup = this.addClientGroup.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);        
        this.tog_sample = this.tog_sample.bind(this);
        this.tog_roles = this.tog_roles.bind(this);
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
    tog_sample() {
        this.setState(prevState => ({
            modal_sample: !prevState.modal_sample
        }));
        this.removeBodyCss();
    }
    tog_roles() {
        this.setState(prevState => ({
            modal_roles: !prevState.modal_roles
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
            // this.setState({success_msg: true, success_message: data.response, isAdding: false}); // REMOVED
            this.setState({ isAdding: false });
            MySwal.fire({
                title: 'Success!',
                text: data.response,
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
            
            // --- KEY CHANGE (Ensure 'id' for DataGrid) ---
            data.map((item, index)=>{
                item.slno = index + 1; // Add slno
                item.status = (item.isDeleted === 'Active')?(<span className="badge badge-success p-1">Active</span>):(<span className="badge badge-danger p-1">In Active</span>);
                item.action = <div><Button onClick={()=>null} type="button" color="primary" size="sm" className="waves-effect waves-light mr-2">Manage</Button>
                                   <Button onClick={()=>this.tog_delete(item.id)} type="button" color="danger" size="sm" className="waves-effect">Delete</Button></div>;
                // 'item.id' is already present from the API, which is perfect.
                return item; // ensure map returns the modified item
            }); 
            // let newTableDataRows = [...this.state.tableData.rows]; // Old logic
            // newTableDataRows = data; // Old logic
            // this.setState({tableData: {...this.state.tableData, rows: newTableDataRows}}) // Old logic
            
            // New logic: Just update the rows
            this.setState({tableData: {...this.state.tableData, rows: data}})
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
                                <h4 className="page-title">Administrator Roles</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="4">
                            <Card>
                                <CardBody>

                                    <h4 className="mt-0 header-title">Add Administrator Roles</h4>

                                    <AvForm onValidSubmit={this.addClientGroup}>
                                        <AvField name="group_name" label="ROLE NAME"
                                            type="text" errorMessage="Enter ROLE Name"
                                            validate={{ required: { value: true } }} />

                                        


                                        <Label>STATUS </Label>
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

                                    </AvForm>

                                </CardBody>
                            </Card>
                        </Col>

                        <Col sm="12" lg="8">
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">Administrator Roles</h4>

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
                                        // DataGrid requires a stable 'id' for each row.
                                        getRowId={(row) => row.id} 
                                        disableSelectionOnClick
                                      />
                                    </Box>
                                    {/* --- END KEY CHANGE --- */}

                                </CardBody>
                            </Card>
                        </Col>

                    </Row>

                    {/* --- KEY CHANGE (SWEETALERT REPLACEMENT) --- */}
                    {/* The old SweetAlert component is removed from the render method.
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
                    </Modal>

                    <Modal isOpen={this.state.modal_sample} toggle={this.tog_sample} >
                        {/* ... (Modal code remains unchanged) ... */}
                    </Modal>

                    <Modal isOpen={this.state.modal_roles} toggle={this.tog_roles} >
                        {/* ... (Modal code remains unchanged) ... */}
                    </Modal>


                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(AdministratorRoles));