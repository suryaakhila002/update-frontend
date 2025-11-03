import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
// import { withRouter } from 'react-router-dom';

import { connect } from 'react-redux';
import {ServerApi} from '../../utils/ServerApi';
import {Tag} from 'antd';
import {getLoggedInUser} from '../../helpers/authUtils';

// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated

import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
// --- END KEY CHANGES ---

class SmsRoutes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_standard: false,
            modal_edit: false,
            modal_delete: false,
            isAdding: false,
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed, as SweetAlert was unused
            // success_msg: false,
            // modalType: 'success',
            // success_message: "",
            // --- END KEY CHANGE ---
            delete_sid: "",
            modal_edit_index: 0,

            // --- KEY CHANGE (DATAGRID) ---
            // Define columns for MUI DataGrid
            columns: [
                {
                    field: 'slno',
                    headerName: 'SL',
                    width: 50
                },
                {
                    field: 'routeName',
                    headerName: 'ROUTE Name',
                    width: 100
                },
                {
                    field: 'hostname',
                    headerName: 'Host Name',
                    width: 150
                },
                {
                    field: 'port',
                    headerName: 'Port',
                    width: 80
                },
                {
                    field: 'systemId',
                    headerName: 'System Id',
                    width: 120
                },
                {
                    field: 'password',
                    headerName: 'Password',
                    width: 100
                },
                {
                    field: 'transmitter',
                    headerName: 'Transmitter',
                    width: 100
                },
                {
                    field: 'transceiver',
                    headerName: 'Transceiver',
                    width: 100
                },
                {
                    field: 'receiver',
                    headerName: 'Receiver',
                    width: 100
                },
                {
                    field: 'statusBadge',
                    headerName: 'STATUS',
                    width: 100,
                    renderCell: (params) => (params.value) // To render JSX
                },
                {
                    field: 'type',
                    headerName: 'Type',
                    width: 100
                },
                {
                    field: 'action',
                    headerName: 'ACTION',
                    width: 250, // Increased width
                    sortable: false,
                    renderCell: (params) => (params.value) // To render JSX
                }
            ],
            // Define rows for DataGrid
            rows: []
            // The old 'tableData' state is no longer needed
            // --- END KEY CHANGE ---
        };
        this.tog_standard = this.tog_standard.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.tog_edit = this.tog_edit.bind(this);
        this.addSmsRoute = this.addSmsRoute.bind(this);
        this.updateSmsRoute = this.updateSmsRoute.bind(this);
        this.deleteRoute = this.deleteRoute.bind(this);
    }

    // ... (All component methods like componentDidMount, toggles, and API calls remain unchanged) ...
    
    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadSmsRoutes()
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

    tog_edit(index) {
        this.setState(prevState => ({
            modal_edit: !prevState.modal_edit,
            modal_edit_index: index,
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

    addSmsRoute(event, values){
        this.setState({isAdding: true});
        var raw = { /* ... */ }; // data setup
        ServerApi().post('routes/add-route', raw)
          .then(res => {
            // This file already uses openSnack, so no SweetAlert change is needed
            if (res.data.status !== undefined && res.data.status === true) {
                this.props.openSnack({type: 'success', message: 'SMS Route Added.'})
                this.setState({isAdding: false});
            }else{
                this.props.openSnack({type: 'error', message: 'Unable to add SMS Route.'})
                this.setState({isAdding: false});
            }
            this.loadSmsRoutes();
            this.tog_standard();
          })
          .catch(error => console.log('error', error));
    }

    updateSmsRoute(event, values){
        this.setState({isAdding: true});
        var raw = { /* ... */ }; // data setup
        ServerApi().post('routes/update-route', raw)
          .then(res => {
            if (res.data.status !== undefined && res.data.status === true) {
                this.props.openSnack({type: 'success', message: 'SMS Route Updated.'})
                this.setState({isAdding: false});
            }else{
                this.props.openSnack({type: 'error', message: 'Unable to update SMS Route'})
                this.setState({isAdding: false});
            }
            this.loadSmsRoutes();
            this.tog_edit();
          })
          .catch(error => console.log('error', error));
    }

    deleteRoute(){
        if (this.state.delete_sid === "") { return false; }
        this.setState({isAdding: true});
        ServerApi().get('routes/delete-route/'+this.state.delete_sid)
          .then(res => {
            if (res.data.status !== undefined && res.data.status === true) {
                this.props.openSnack({type: 'success', message: 'SMS Route Deleted'})
                this.setState({isAdding: false});
            }else{
                this.props.openSnack({type: 'error', message: 'Unable to delete SMS Route.'})
                this.setState({isAdding: false});
            }
            this.loadSmsRoutes();
            this.tog_delete();
          })
          .catch(error => console.log('error', error));
    }

    loadSmsRoutes(){
        ServerApi().get(`routes`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }            
            
            // --- KEY CHANGE (DATAGRID MAPPING) ---
            // 1. DataGrid needs a unique 'id' field, which 'item.id' provides.
            // 2. The map function was incorrectly returning 'true', fixed to return 'item'.
            const formattedRows = res.data.map((item, index)=>{
                item.slno = (index+1);
                item.statusBadge = (item.status === 'Active')?(<Tag color="green">{item.status}</Tag>):(<Tag color="red">{item.status}</Tag>);
                item.action = <div><Button type="button" onClick={()=>this.tog_edit(index)} color="info" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-edit"></i></Button>
                                   <Button type="button" onClick={()=>this.tog_delete(item.id)} color="danger" size="sm" className="waves-effect mb-2"><i className="fa fa-trash"></i></Button>
                                   <Button title="Restart" type="button" onClick={()=>null} color="warning" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-refresh"></i></Button>
                                   <Button title="Shutdown" type="button" onClick={()=>null} color="danger" size="sm" className="waves-effect mb-2"><i className="mdi mdi-power"></i></Button></div>;
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
                    {/* ... (Header/Title Row and Modals remain unchanged) ... */}
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">Manage SMS Routes</h4>
                            </Col>
                            <Col sm="6">
                                <div className="float-right d-none d-md-block">
                                    <Button onClick={this.tog_standard} type="button" color="primary" size="md" className="waves-effect"><i className="fa fa-plus mr-2"></i> Add SMS Route</Button>
                                </div>

                                <Modal isOpen={this.state.modal_standard} toggle={this.tog_standard} >
                                    {/* ... (Modal content unchanged) ... */}
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
                                        btn
                                        hover
                                        displayEntries={true}
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

                    {/* --- KEY CHANGE (SWEETALERT BLOCK DELETED) --- */}
                    {/* The old <SweetAlert> component was deleted from here.
                        It was unused, and the import was blocking the build. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert ... >
                        </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}


                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        {/* ... (Reactstrap Modal remains unchanged) ... */}
                    </Modal>

                    <Modal isOpen={this.state.modal_edit} toggle={this.tog_edit} >
                        {/* ... (Reactstrap Modal remains unchanged) ... */}
                    </Modal>

                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout, openSnack })(SmsRoutes);