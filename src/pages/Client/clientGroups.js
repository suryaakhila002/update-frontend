import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select';
import {  withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
import {Tag} from 'antd';
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

const CLIENT_GROUP_STATUS = [
    {
        label: "Status",
        options: [
            { label: "Active", value: "Active" },
            { label: "In Active", value: "In Active" }
        ]
    }
];

class ClientGroups extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: {label:'Active', value: 'Active'}, 
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
                    field: 'groupName',
                    headerName: 'Group Name',
                    width: 150
                },
                {
                    field: 'createdBy',
                    headerName: 'CREATED BY',
                    width: 270
                },
                {
                    field: 'status',
                    headerName: 'STATUS',
                    width: 200,
                    // renderCell is required to render JSX (<Tag>)
                    renderCell: (params) => (params.value)
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 200,
                    sortable: false,
                    // renderCell is required to render JSX (<Button>)
                    renderCell: (params) => (params.value)
                }
            ],
            // Define rows for DataGrid
            rows: []
            // The old 'tableData' state is no longer needed
            // --- END KEY CHANGE ---
        };
        this.addClientGroup = this.addClientGroup.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadClientGroups();
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

        var raw = JSON.stringify({
            requestType: "ADDGROUP",
            payload:{
                groupName: values.group_name,
                status: this.state.selectedGroup.value,
            }
        });

        ServerApi().post('groups/addGroup', raw)
          .then(res => {
            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({success_msg: true, success_message: res.data.response, isAdding: false}); // REMOVED
            this.setState({ isAdding: false });
            MySwal.fire({
                title: 'Success!',
                text: res.data.response,
                icon: 'success'
            });
            // --- END KEY CHANGE ---
            this.loadClientGroups();
          })
          .catch(error => {
              console.log('error', error);
              this.setState({ isAdding: false });
              MySwal.fire('Error!', 'Could not add group.', 'error');
          });
    }

    deleteGroup(){
        if (this.state.delete_sid === "") { return false; }
        
        this.setState({isDeleting: true});
        
        ServerApi().get("groups/deleteGroup/"+this.state.delete_sid)
          .then(res => {
            this.setState({isDeleting: false});
            this.loadClientGroups();
            this.tog_delete();
            MySwal.fire('Deleted!', 'The group has been deleted.', 'success'); // Added success feedback
          })
        .catch(error => {
            console.log('error', error);
            this.setState({isDeleting: false});
            MySwal.fire('Error!', 'Could not delete group.', 'error');
        });
    }

    loadClientGroups(){
        ServerApi().get("groups/getGroups")
          .then(res => {
            if (res.data === undefined) {
                return false;
            }
            
            // --- KEY CHANGE (DATAGRID MAPPING) ---
            // 1. DataGrid needs a unique 'id' field, which 'item.id' provides.
            // 2. The map function was incorrectly returning 'true', fixed to return 'item'.
            const formattedRows = res.data.map((item, index)=>{
                item.status = (item.isDeleted === 'Active')?(<Tag color="green">Active</Tag>):(<Tag color="red">In Active</Tag>);
                item.action = <div><Button onClick={()=>null} type="button" color="primary" size="sm" className="waves-effect waves-light mr-2">Manage</Button>
                                   <Button onClick={()=>this.tog_delete(item.id)} type="button" color="danger" size="sm" className="waves-effect">Delete</Button></div>;
                return item; // FIX: Was 'return true'
            }); 
            
            this.setState({ rows: formattedRows });
            // --- END KEY CHANGE ---
          })
          .catch(error => console.log('error', error));
    }

    render() {

        const { selectedGroup } = this.state;

        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (Header/Title Row remains unchanged) ... */}
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">CLIENT GROUP</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="4">
                            <Card>
                                <CardBody>
                                    {/* ... (Form remains unchanged) ... */}
                                    <AvForm onValidSubmit={this.addClientGroup}>
                                        <AvField name="group_name" label="GROUP NAME"
                                            type="text" errorMessage="Enter Group Name"
                                            validate={{ required: { value: true } }} />

                                            <Label>CLIENT GROUP </Label>
                                            <Select
                                                name="group_status"
                                                label="CLIENT GROUP"
                                                isSelected={true}
                                                value={selectedGroup}
                                                onChange={this.handleSelectGroup}
                                                options={CLIENT_GROUP_STATUS}
                                            />

                                        <FormGroup className="mt-3 mb-0">
                                            <div>
                                                <Button type="submit" 
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
                    {/* The old <SweetAlert> component is DELETED from the render method.
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
                        {/* ... (This is a Reactstrap Modal, NOT SweetAlert. It remains unchanged.) ... */}
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

export default withRouter(connect(null, { activateAuthLayout })(ClientGroups));