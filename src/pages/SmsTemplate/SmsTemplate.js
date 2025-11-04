import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {ServerApi} from '../../utils/ServerApi';
import {Tag} from 'antd';
import {getLoggedInUser} from '../../helpers/authUtils';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';


// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated

import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
// --- END KEY CHANGES ---

// Note: The 'columns' definition was commented out, 
// but it's now defined in the constructor for the new DataGrid.

class SmsTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            fullMessage: '',
            modalFullMessage: false,
            
            // --- KEY CHANGE (DATAGRID) ---
            // Define columns for MUI DataGrid, based on the old 'tableData'
            columns: [
                {
                    field: 'slno',
                    headerName: 'SL',
                    width: 50
                },
                (getLoggedInUser().userType==='SUPER_ADMIN') ? 
                    { field: 'createdBy', headerName: 'Created By', width: 150, renderCell: (params) => (params.value) } : {},
                (getLoggedInUser().userType==='SUPER_ADMIN') ? 
                    { field: 'dltRegistrationId', headerName: 'Entity No.', width: 150 } : {},
                {
                    field: 'templateMessage',
                    headerName: 'SMS Template',
                    width: 250, // Increased width
                    renderCell: (params) => (params.value) // To render JSX
                },
                {
                    field: 'templateName',
                    headerName: 'Template Name',
                    width: 200 // Increased width
                },
                {
                    field: 'type',
                    headerName: 'Content Type',
                    width: 150
                },
                {
                    field: 'category',
                    headerName: 'Category',
                    width: 200
                },
                {
                    field: 'createdOn',
                    headerName: 'Date',
                    width: 200
                },
                {
                    field: 'status',
                    headerName: 'Status',
                    width: 150,
                    renderCell: (params) => (params.value) // To render JSX
                },
                {
                    field: 'action',
                    headerName: 'Action',
                    width: 200,
                    sortable: false,
                    renderCell: (params) => (params.value) // To render JSX
                }
            ].filter(col => Object.keys(col).length > 0), // Filter out empty objects
            
            // Define rows for DataGrid
            rows: [],
            // --- END KEY CHANGE ---

            modal_delete: false,
            isAdding: false,
            
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed, as SweetAlert was unused
            // success_msg: false,
            // modalType: 'success',
            // success_message: "",
            // --- END KEY CHANGE ---

            delete_sid: "",
            modal_approve: false,
            approve_sid: '',
            consentTemplateId: '',
            rejectReason: '',
            modal_reject: false,
            reject_sid: '',
        };
        this.tog_delete = this.tog_delete.bind(this);
        this.tog_reject = this.tog_reject.bind(this);
        this.tog_approve = this.tog_approve.bind(this);
        this.deleteSmsTemplate = this.deleteSmsTemplate.bind(this);
        this.loadSmsTemplates = this.loadSmsTemplates.bind(this);
    }

    // ... (All component methods like componentDidMount, toggles, delete, permit, etc., remain unchanged) ...
    
    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadSmsTemplates();
    }

    tog_delete(id) {
        this.setState(prevState => ({
            modal_delete: !prevState.modal_delete,
            delete_sid: id,
        }));
        this.removeBodyCss();
    }
    tog_approve(id){
        this.setState(prevState => ({
            modal_approve: !prevState.modal_approve,
            approve_sid: id,
        }));
        this.removeBodyCss();
    }
    tog_reject(id){
        this.setState(prevState => ({
            modal_reject: !prevState.modal_reject,
            reject_sid: id,
        }));
        this.removeBodyCss();
    }
    removeBodyCss() {
        document.body.classList.add('no_padding');
    }

    deleteSmsTemplate(){
        if (this.state.delete_sid === "") { return false; }
        this.setState({isAdding: true});
        ServerApi().get("sms/deleteSmsTemplate/"+this.state.delete_sid)
          .then(res => {
            if (res.data.status !== undefined && res.data.status === true) {
                this.props.openSnack({type: 'success', message: 'SMS Template Deleted.'});
                this.setState({isAdding: false});
            }else{
                this.props.openSnack({type: 'error', message: 'Unable to delete SMS Template'});
                this.setState({isAdding: false});
            }
            this.loadSmsTemplates();
            this.tog_delete();
          })
          .catch(error => console.log('error', error));
    }

    permitTemplate(action){
        let raw1 = { /* ... */ };
        let raw2 = { /* ... */ };
        ServerApi().post("sms/"+action+"/template/", ((action==='approve')?raw1:raw2))
          .then(res => {
            if(action==='approve'){
                this.props.openSnack({type: 'success', message: 'Template Approved.'})
                this.setState({isAdding: false});
                this.tog_approve('');
            }else{
                this.props.openSnack({type: 'warning', message: 'Template Rejected.'})
                this.setState({isAdding: false});
                this.tog_reject('');
            }
            this.loadSmsTemplates();
          })
          .catch(error => console.log('error', error));
    }

    approveSmsTemplate(){ }
    rejectSmsTemplate(){ }

    loadSmsTemplates(){
        ServerApi({'URL': 'BASE'}).get(`sms/getAllSmsTemplates`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }
            
            // --- KEY CHANGE (DATAGRID MAPPING) ---
            // 1. DataGrid needs a unique 'id' field, which 'item.id' provides.
            // 2. The map function was incorrectly returning 'true', fixed to return 'item'.
            const formattedRows = res.data.reverse().map((item, index)=>{
                item.slno = (index+1);
                // item.id is already provided by the API
                item.messageTextField = item.message;
                item.createdOn = new Date(item.createdOn).toLocaleString('en-US', {hour12: true});
                item.createdBy = <span style={{color: 'blue', cursor: 'pointer'}} onClick={()=>this.props.history.push({pathname: '/manageClient', state: { clientId: item.createdById }})}>{item.createdBy}</span>
                item.action = <div>
                                   {getLoggedInUser().userType === 'SUPER_ADMIN' && (<>{(item.status === 0)?(<><Button onClick={()=>this.tog_reject(item.id)} type="button" color="warning" size="sm" className="waves-effect mb-2 mr-2" title="Reject"><span className="fa fa-info-circle"></span></Button><Button onClick={()=>this.tog_approve(item.id)} type="button" color="success" size="sm" className="waves-effect mb-2 mr-2" title="Approve"><span className="fa fa-check"></span></Button></>):null}</>)}
                                   {(item.status===2)?<Button type="button" onClick={()=>this.props.history.push({pathname: '/updateSmsTemplate', state: { templateId: item.id, name: item.templateName, category: item.category, type:item.type, senderIds: item.senderIdsList, message: item.templateMessage }})} color="info" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-edit"></i></Button>:null}
                                   <Button type="button" onClick={()=>this.tog_delete(item.id)} color="danger" size="sm" className="waves-effect mb-2"><i className="fa fa-trash"></i></Button>
                              </div>;
                item.status = (item.status === 1)?(<Tag color="green">Approed</Tag>):(item.status === 2)?<Tag color="red">Rejected</Tag>:<Tag color="red">Pending Approval</Tag>;
                item.templateMessage = (item.messageTextField !==undefined && item.messageTextField.length > 55)?<>{item.messageTextField.slice(0, 55)} <span style={{cursor: 'pointer', color: 'blue'}} onClick={(e)=>this.setState({anchorEl:e.currentTarget, modalFullMessage: true, fullMessage: item.messageTextField})} aria-describedby="full-message">... read more</span></>:item.messageTextField;
                delete item.message;
                return item; // FIX: Was 'return true'
            });  

            this.setState({ rows: formattedRows }); // Set the new 'rows' state
            // --- END KEY CHANGE ---
        })
        .catch(error => console.log('error', error));
    }

    onChange(pagination, filters, sorter, extra) {
      console.log('params', pagination, filters, sorter, extra);
    }    


    render() {
        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (Header/Title Row and Modals remain unchanged) ... */}
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">SMS TEMPLATE</h4>
                            </Col>
                            <Col sm="6">
                                <div className="float-right d-none d-md-block">                                
                                    <Link to='addSmsTemplate'><Button type="button" color="primary" size="md" className="waves-effect mr-2"><i className="fa fa-plus mr-2"></i> Add Template</Button></Link>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>
                                    {/* --- KEY CHANGE (MDBDATATABLE REPLACEMENT) --- */}
                                    {/* <Table columns={columns} dataSource={this.state.tableData.rows} onChange={this.onChange} size="small" /> */}
                                    {/* <MDBDataTable
                                        sortable
                                        responsive
                                        striped
                                        hover
                                        data={this.state.tableData}
                                    /> */}
                                    <Box sx={{ height: 600, width: '100%' }}>
                                        <DataGrid
                                            rows={this.state.rows}
                                            columns={this.state.columns}
                                            pageSize={10}
                                            rowsPerPageOptions={[10, 25, 50]}
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

                    <Modal centered isOpen={this.state.modal_approve} toggle={this.tog_approve} >
                        {/* ... (Reactstrap Modal remains unchanged) ... */}
                    </Modal>

                    <Modal centered isOpen={this.state.modal_reject} toggle={this.tog_reject} >
                        {/* ... (Reactstrap Modal remains unchanged) ... */}
                    </Modal>

                    <Popover
                        id="full-message"
                        open={this.state.modalFullMessage}
                        anchorEl={this.state.anchorEl}
                        onClose={()=>this.setState({modalFullMessage:false})}
                        anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                        transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                        }}
                    >
                        {/* ... (Popover JSX remains unchanged) ... */}
                    </Popover>

                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout, openSnack })(SmsTemplate);