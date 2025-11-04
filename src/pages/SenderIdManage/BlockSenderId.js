import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody, Label } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
// import { Link, withRouter } from 'react-router-dom';

import { connect } from 'react-redux';
import classnames from 'classnames';
import Dropzone from 'react-dropzone';
// import Countries from '../../utils/Countries';
import defaultProfileImage from '../../images/users/default_profile.jpg';
import {ServerApi} from '../../utils/ServerApi';
import { Tag, Empty } from 'antd';
import {getLoggedInUser} from '../../helpers/authUtils';
import LoadingBar from 'react-top-loading-bar';
import {Button as MuiButton} from '@mui/material'; // Renamed to MuiButton to avoid conflict

// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated (Duplicate)

import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
import Swal from 'sweetalert2'; // ADDED: Modern Alert Library
import withReactContent from 'sweetalert2-react-content'; // ADDED: React wrapper
// --- END KEY CHANGES ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

class BlockSenderId extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_standard: false,
            modal_delete: false,
            isAdding: false,
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed for SweetAlert2
            // success_msg: false,
            // success_message: "",
            // success_type: 'success',
            // --- END KEY CHANGE ---
            modal_standard_upload: false,
            delete_sid: "",
            category: 'None',
            selectedUploadFile: [],

            // --- KEY CHANGE (DATAGRID) ---
            // Define columns for MUI DataGrid
            columns: [
                {
                    field: 'slno',
                    headerName: 'SL',
                    width: 50
                },
                {
                    field: 'senderId',
                    headerName: 'SENDER ID',
                    width: 150
                },
                {
                    field: 'reason',
                    headerName: 'BLOCK REASON',
                    width: 270
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
            rows: [
                {
                    id: 1, // Added unique 'id'
                    slno : '1',
                    senderId : 'TESTIN',
                    reason : 'Abused content.',
                    action : <Button type="button" onClick={()=>null} color="danger" size="sm" className="waves-effect mb-2"><span className="fa fa-trash"></span></Button>,
                }
            ]
            // The old 'tableData' state is no longer needed
            // --- END KEY CHANGE ---
        };
        this.tog_standard = this.tog_standard.bind(this);
        this.tog_standard_upload = this.tog_standard_upload.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.addSenderId = this.addSenderId.bind(this);
        this.deleteSenderId = this.deleteSenderId.bind(this);

        this.handleAcceptedFilesDocument = this.handleAcceptedFilesDocument.bind(this);
    }

    componentDidMount() {
        // this.LoadingBar.continuousStart();
        this.props.activateAuthLayout();
        // this.loadSenderIds()
    }

    ManageClick() {        
        this.props.history.push('/manageClient');
    }
    
    // ... (All tog_ and handle methods remain unchanged)
    tog_standard() {
        this.setState(prevState => ({
            modal_standard: !prevState.modal_standard
        }));
        this.removeBodyCss();
    }
    tog_standard_upload() {
        this.setState(prevState => ({
            modal_standard_upload: !prevState.modal_standard_upload
        }));
        this.removeBodyCss();
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
    handleSelectCategory = (selectedItem) => {
        this.setState({ category: selectedItem });
    }
    handleAcceptedFilesDocument = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));
        this.setState({ selectedFilesDocument: files });
    }
    formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    handleUploadFile = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));
        this.setState({ selectedUploadFile: files });
        // this.fetchFileDetails(); // This function doesn't exist in this file
    }
    // ... (End of unchanged methods)


    addSenderId(event, values){
        this.setState({isAdding: true});

        var raw = { /* ... raw data ... */ };
        var formdata = new FormData();
        formdata.append("request", JSON.stringify(raw));
        formdata.append("documentFile", this.state.selectedFilesDocument[0]);

        ServerApi().post('addSenderId', formdata)
          .then(res => {
            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            if (res.status === 200) {
                // this.setState({success_type: 'success', success_msg: true, success_message:'Sender Id Added.', isAdding: false});
                MySwal.fire('Sender Id Added!', '', 'success');
                this.setState({isAdding: false});
                this.loadSenderIds();
                this.tog_standard();
            } else {
                // this.setState({success_type: 'error', success_msg: true, success_message:'Unable to add Sender Id.', isAdding: false});
                MySwal.fire('Error!', 'Unable to add Sender Id.', 'error');
                this.setState({isAdding: false});
            }
            // --- END KEY CHANGE ---
          })
          .catch(error => {
              console.log('error', error);
              MySwal.fire('Error!', 'An error occurred.', 'error');
              this.setState({isAdding: false});
          });
    }

    deleteSenderId(){
        if (this.state.delete_sid === "") { return false; }

        this.setState({isAdding: true});
        
        ServerApi().get("deleteSenderId?senderId="+this.state.delete_sid)
          .then(res => {
            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({success_msg: true, success_message: 'Sender Id Deleted.', isAdding: false});
            MySwal.fire('Sender Id Deleted!', '', 'success');
            this.setState({isAdding: false});
            // --- END KEY CHANGE ---
            this.loadSenderIds();
            this.tog_delete();
          })
          .catch(error => {
              console.log('error', error);
              MySwal.fire('Error!', 'An error occurred.', 'error');
              this.setState({isAdding: false});
          });
    }

    permitSenderId(action, id){
        if (id === "") { return false; }

        this.LoadingBar.continuousStart()

        ServerApi().get("updateStatus/"+action+"/"+id)
          .then(res => {
            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({success_msg: true, success_message: 'Sender Id Updated.', isAdding: false});
            MySwal.fire('Sender Id Updated!', '', 'success');
            this.setState({isAdding: false});
            // --- END KEY CHANGE ---
            this.loadSenderIds();
            this.LoadingBar.complete()
          })
          .catch(error => console.log('error', error));
    }

    loadSenderIds(){
        ServerApi().get(`getAllSenderIds`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }
            
            // --- KEY CHANGE (DATAGRID MAPPING) ---
            const formattedRows = res.data.map((item, index)=>{
                item.slno = (index+1);
                item.id = item.id || (index+1); // Ensure unique ID
                item.createdTime = new Date(item.createdTime).toLocaleString('en-US', {hour12: false})
                item.statuss = (item.status === 'Approved')?(<Tag color="green">{item.status}</Tag>):(<Tag color="red">{item.status}</Tag>);
                
                item.action = <div>
                                {getLoggedInUser().userType === 'superadmin' && (<>{(item.status === 'Approved')?(<Button onClick={()=>this.permitSenderId('Rejected', item.id)} type="button" color="warning" size="sm" className="waves-effect mb-2 mr-2">Reject</Button>):(<Button onClick={()=>this.permitSenderId('Approved', item.id)} type="button" color="success" size="sm" className="waves-effect mb-2 mr-2">Approve</Button>)}</>)}
                                <Button type="button" onClick={()=>this.tog_delete(item.id)} color="danger" size="sm" className="waves-effect mb-2"><span className="fa fa-trash"></span></Button>
                            </div>;
                return item; // FIX: Was 'return true'
            });  

            this.setState({rows: formattedRows}); // Set the new 'rows' state
            this.LoadingBar.complete();
        })
        .catch(error => console.log('error', error));
    }

    render() {
        return (
            <React.Fragment>
                <LoadingBar
                    height={3}
                    color='#79acef'
                    onRef={ref => (this.LoadingBar = ref)}
                />

                <Container fluid>
                    {/* ... (Header/Title Row and Modals remain unchanged) ... */}
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col lg="6" sm="12">
                                <h4 className="page-title">Block Sender Id</h4>
                            </Col>
                            <Col lg="6" sm="12">
                                <div className="float-right">
                                    <Button onClick={this.tog_standard} type="button" color="primary" size="sm" className="waves-effect mr-2"><i className="fa fa-plus mr-2"></i> Add Block Sender Id</Button>
                                    <Button onClick={this.tog_standard_upload} type="button" color="primary" size="sm" className="waves-effect"><i className="fa fa-file mr-2"></i> Upload File</Button>
                                </div>
                                
                                {/* ... (All Reactstrap Modals remain unchanged) ... */}
                                <Modal isOpen={this.state.modal_standard} toggle={this.tog_standard} >
                                    {/* ... */}
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
                                            // 'id' field was added in state or mapping
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
                        It is now triggered as a function call in class methods. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert ... >
                        </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}


                    <Modal isOpen={this.state.modal_standard_upload} toggle={this.tog_standard_upload} >
                        {/* ... (Reactstrap Modal remains unchanged, note toggle should be tog_standard_upload) ... */}
                    </Modal>

                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        {/* ... (Reactstrap Modal remains unchanged) ... */}
                    </Modal>

                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout, openSnack })(BlockSenderId);