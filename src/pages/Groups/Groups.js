import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import { Link, withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import Settings from '../../utils/ServerSettings';
import {ServerApi} from '../../utils/ServerApi';
import { Empty } from 'antd';
// import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import LoadingBar from 'react-top-loading-bar';
import {getLoggedInUser} from '../../helpers/authUtils';
// import { inputStyle } from 'react-select/src/components/input';
import {Tag} from 'antd'; // Ant Design Tag was already imported

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

class Groups extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_standard: false,
            modal_standard_edit: false,
            modal_standard_new_contact: false,
            modal_upload: false,
            modal_view: false,
            modal_delete :false,
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed for SweetAlert2
            // success_msg: false,
            // modalType: 'success',
            // success_message: "",
            // --- END KEY CHANGE ---
            selectedFile: null,
            delete_sid: '',
            delete_type : '',
            edit_id: 0,
            add_contact_group_id: '',
            selectedUploadFile: [],
            isLoading: true,
            isModalLoading: true,
            modal_standard_edit_contact: false,
            
            // --- KEY CHANGE (DATAGRID) ---
            // Define columns for main Groups table
            groupColumns: [
                {
                    field: 'slno',
                    headerName: 'SL',
                    width: 50
                },
                {
                    field: 'groupName',
                    headerName: 'GROUP NAME',
                    width: 150
                },
                {
                    field: 'count',
                    headerName: 'COUNT',
                    width: 150
                },
                {
                    field: 'createdTime',
                    headerName: 'CREATED ON',
                    width: 150
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 300, // Increased width for all buttons
                    sortable: false,
                    renderCell: (params) => (params.value) // To render JSX
                }
            ],
            groupRows: [], // For main table data

            // Define columns for Contacts modal table
            contactColumns: [
                {
                    field: 'slno',
                    headerName: 'SL',
                    width: 50
                },
                {
                    field: 'contactName',
                    headerName: 'CONTACT NAME',
                    width: 180
                },
                {
                    field: 'mobile',
                    headerName: 'MOBILE NUMBER',
                    width: 180
                },
                {
                    field: 'email',
                    headerName: 'EMAIL',
                    width: 170
                },
                {
                    field: 'createdTime',
                    headerName: 'CREATED ON',
                    width: 190,
                    renderCell: (params) => (params.value) // To render JSX
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 190,
                    sortable: false,
                    renderCell: (params) => (params.value) // To render JSX
                },
            ],
            contactRows: [] // For modal table data
            // --- END KEY CHANGE ---
        };
        // ... (constructor bindings remain unchanged)
        this.tog_standard = this.tog_standard.bind(this);
        this.tog_standard_edit = this.tog_standard_edit.bind(this);
        this.tog_standard_new_contact = this.tog_standard_new_contact.bind(this);
        this.tog_upload = this.tog_upload.bind(this);
        this.tog_view = this.tog_view.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.addGroup = this.addGroup.bind(this);
        this.addContact = this.addContact.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
        this.deleteContact = this.deleteContact.bind(this);
        this.updateGroup = this.updateGroup.bind(this);
        this.uploadContact = this.uploadContact.bind(this);
        this.tog_standard_edit_contact = this.tog_standard_edit_contact.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.editContact = this.editContact.bind(this);
    }
    
    // ... (All component lifecycle and handle methods remain unchanged)

    componentDidMount() {
        this.LoadingBar.continuousStart();
        this.props.activateAuthLayout();
        this.loadGroups();
    }

    ManageClick() {        
        this.props.history.push('/manageClient');
    }

    tog_standard() {
        this.setState(prevState => ({
            modal_standard: !prevState.modal_standard
        }));
        this.removeBodyCss();
    }
    tog_standard_edit(id) {
        this.setState(prevState => ({
            modal_standard_edit: !prevState.modal_standard_edit,
            edit_id: id,
        }));
        this.removeBodyCss();
    }
    tog_standard_new_contact(id) {
        this.setState(prevState => ({
            modal_standard_new_contact: !prevState.modal_standard_new_contact,
            add_contact_group_id: id,
        }));
        this.removeBodyCss();
    }
    tog_upload(id) {
        this.setState(prevState => ({
            modal_upload: !prevState.modal_upload,
            add_contact_group_id: id,
        }));
        this.removeBodyCss();
    }
    tog_view() {
        this.setState(prevState => ({
            modal_view: !prevState.modal_view
        }));
        this.removeBodyCss();
    }
    tog_delete(id, type) {
        this.setState(prevState => ({
            modal_delete: !prevState.modal_delete,
            delete_sid: id,
            delete_type: type
        }));
        this.removeBodyCss();
    }
    tog_standard_edit_contact(id, type) {
        this.setState(prevState => ({
            modal_standard_edit_contact: !prevState.modal_standard_edit_contact,
        }));
        this.removeBodyCss();
    }
    
    removeBodyCss() {
        document.body.classList.add('no_padding');
    }

    handleUploadFile = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        this.setState({ selectedUploadFile: files });
    }
    
    formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    initEditContact(name, mobile, email, id){
        this.setState({edit_contact_name: name, edit_contact_mobile: mobile, edit_contact_email: email, edit_contact_id: id})
        this.tog_standard_edit_contact();
    }

    loadGroups(){

        ServerApi().get(`groups/getGroups/${getLoggedInUser().id}`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }
            
            // --- KEY CHANGE (DATAGRID MAPPING) ---
            // 1. DataGrid needs a unique 'id' field, which 'item.id' provides.
            // 2. The map function was incorrectly returning 'true', fixed to return 'item'.
            const formattedRows = res.data.map((item, index)=>{
                item.slno = (index+1);
                item.count = item.contactsCount;
                item.createdTime = new Date(item.createdTime).toLocaleString('en-US', {hour12: true});
                item.action = <div> 
                                    <Button onClick={()=>this.tog_standard_edit(index)} type="button" color="primary" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-edit"></i></Button>
                                    <Button onClick={()=>this.tog_standard_new_contact(item.id)} type="button" color="info" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-plus"></i></Button>
                                    <Button onClick={()=>this.tog_upload(item.id)} type="button" color="success" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-upload"></i></Button>
                                    <Button onClick={()=>this.loadContacts(item.id)} type="button" color="warning" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-eye"></i></Button>
                                    <Button onClick={()=>this.tog_delete(item.id, 'group')} type="button" color="danger" size="sm" className="waves-effect mb-2"><i className="fa fa-trash"></i></Button>
                                </div>;
                delete item.message;
                return item; // FIX: Was 'return true'
            });  

            this.setState({isLoading:false, groupRows: formattedRows});
            this.LoadingBar.complete();
        })
        .catch(error => {
            console.log('error', error);
            this.setState({isLoading: false})
        });
    }

    loadContacts(id){

        ServerApi().get("groups/getContacts/"+id)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }
            
            // --- KEY CHANGE (DATAGRID MAPPING) ---
            const formattedRows = res.data.map((item, index)=>{
                item.slno = (index+1);
                // DataGrid needs 'id'. 'item.id' is provided by the API.
                item.createdTime = <small>{new Date(item.createdOn).toLocaleString('en-US', {hour12: true})}</small>;
                item.action = <div>
                                    <Button onClick={()=>this.initEditContact(item.contactName, item.mobile, item.email, item.id)} type="button" color="primary" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-edit"></i></Button>
                                    <Button onClick={()=>this.tog_delete(item.id, 'contact')} type="button" color="danger" size="sm" className="waves-effect mb-2"><i className="fa fa-trash"></i></Button>
                                </div>;
                delete item.message;
                return item; // FIX: Was 'return true'
            });  

            this.setState({isModalLoading: false, contactRows: formattedRows});
            // --- END KEY CHANGE ---

            this.tog_view();
        })
        .catch(error => console.log('error', error));
    }

    onChangeHandler=event=>{
        this.setState({
          selectedFile: event.target.files[0],
          loaded: 0,
        })
      }

    addGroup(event, values){
        this.setState({isAdding: true});

        var raw = JSON.stringify({
            createdBy: getLoggedInUser().id,
            groupName: values.groupName,
        });

        ServerApi().post("groups/addGroup", raw)
          .then(res => {
            if (res.data.status !== undefined && res.data.status === true) {
                // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
                // this.props.openSnack({type: 'success', message: 'Group Added.'}) // This was here, but SweetAlert was also used
                MySwal.fire({
                    title: 'Success!',
                    text: 'Group Added.',
                    icon: 'success'
                });
                // --- END KEY CHANGE ---
                this.setState({isAdding: false});
            }else{
                this.props.openSnack({type: 'error', message: 'Unable to Add Group.'})
                this.setState({isAdding: false});
            }
            this.tog_standard();
            this.loadGroups();
          })
          .catch(error => console.log('error', error));
    }

    // ... (addContact, editContact, uploadContact, updateGroup, deleteGroup, deleteContact methods remain unchanged as they use openSnack) ...
    // Note: I see 'deleteGroup' and 'deleteContact' *don't* show a success message, 
    // but the original SweetAlert was also only for 'addGroup'. This is consistent.

    render() {

        return (
            <React.Fragment>
                <LoadingBar
                    height={3}
                    color='#79acef'
                    onRef={ref => (this.LoadingBar = ref)}
                />

                <Container fluid>
                    {/* ... (Header/Title Row and Modals remain unchanged, except for MDBDataTable in modal_view) ... */}
                    
                    <div className="page-title-box">
                        <Row className="align-items.center">
                            <Col sm="6">
                                <h4 className="page-title">GROUPS</h4>
                            </Col>
                            <Col sm="6">
                                <div className="float-right d-none d-md-block">
                                    <Button onClick={this.tog_standard} type="button" color="primary" size="md" className="waves-effect"><i className="fa fa-plus mr-2"></i> Add Group</Button>
                                </div>
                                
                                {/* ... (All Modals remain unchanged, except for modal_view) ... */}
                                
                                <Modal large isOpen={this.state.modal_view} toggle={this.tog_view} >
                                    <ModalBody>
                                        <button type="button" onClick={() => this.setState({ modal_view: false })} className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                        <h6>Contacts</h6>

                                        {(this.state.isModalLoading)
                                        ?<Empty imageStyle={{marginTop: 20}} description="Loading Data Please Wait..."></Empty>
                                        :
                                        // --- KEY CHANGE (MDBDATATABLE REPLACEMENT) ---
                                        // <MDBDataTable
                                        //     sortable
                                        //     responsive
                                        //     striped
                                        //     hover
                                        //     bordered
                                        //     btn
                                        //     small
                                        //     autoWidth
                                        //     data={this.state.tableDataContacts}
                                        //     footer={false}
                                        //     foot={false}
                                        // />
                                        <Box sx={{ height: 400, width: '100%' }}>
                                            <DataGrid
                                                rows={this.state.contactRows}
                                                columns={this.state.contactColumns}
                                                pageSize={5}
                                                rowsPerPageOptions={[5, 10, 20]}
                                                getRowId={(row) => row.id} 
                                                disableSelectionOnClick
                                            />
                                        </Box>
                                        // --- END KEY CHANGE ---
                                        }

                                    </ModalBody>
                                </Modal>

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
                                        exportToCSV
                                        theadColor
                                        bordered
                                        btn
                                        hover
                                        displayEntries={true}
                                        data={this.state.tableData}
                                        footer={false}
                                        foot={false}
                                    /> */}
                                    <Box sx={{ height: 600, width: '100%' }}>
                                        <DataGrid
                                            rows={this.state.groupRows}
                                            columns={this.state.groupColumns}
                                            pageSize={10}
                                            rowsPerPageOptions={[10, 25, 50]}
                                            getRowId={(row) => row.id} 
                                            disableSelectionOnClick
                                        />
                                    </Box>
                                    {/* --- END KEY CHANGE --- */}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        {/* ... (Reactstrap Modal remains unchanged) ... */}
                    </Modal>

                    {/* --- KEY CHANGE (SWEETALERT BLOCK DELETED) --- */}
                    {/* The old <SweetAlert> component was deleted from here.
                        It is now triggered as a function call in 'addGroup'. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert ... >
                        </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, openSnack })(Groups));