import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import { Link, withRouter } from 'react-router-dom';
// import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import {ServerApi} from '../../utils/ServerApi';
// import { Table } from 'antd';
import { MDBDataTable } from 'mdbreact';
import {Tag} from 'antd';
import {getLoggedInUser} from '../../helpers/authUtils';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { AvForm, AvField } from 'availity-reactstrap-validation';

class SmsTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            fullMessage: '',
            modalFullMessage: false,
            tableData : {
                columns: [
                    {
                        label: 'SL' ,
                        field: 'slno',
                        sort: 'asc',
                        width: 50
                    },
                    (getLoggedInUser().userType==='SUPER_ADMIN')?{label: 'Created By' ,field: 'createdBy'}:{},
                    (getLoggedInUser().userType==='SUPER_ADMIN')?{label: 'Entity No.' ,field: 'dltRegistrationId'}:{},
                    {
                        label: 'SMS Template' ,
                        field: 'templateMessage',
                        sort: 'asc',
                        width: 150
                    },
                    {
                        label: 'Template Name',
                        field: 'templateName',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'Content Type',
                        field: 'type',
                        sort: 'asc',
                        width: 200
                    },
                    {
                        label: 'Category',
                        field: 'category',
                        sort: 'asc',
                        width: 200
                    },
                    {
                        label: 'Date',
                        field: 'createdOn',
                        sort: 'asc',
                        width: 200
                    },
                    {
                        label: 'Status',
                        field: 'status',
                        sort: 'asc',
                        width: 200
                    },
                    {
                        label: 'Action',
                        field: 'action',
                        sort: 'asc',
                        width: 200
                    }
                ],
                rows: [
                    
                ]
            },
            modal_delete: false,
            isAdding: false,
            success_msg: false,
            modalType: 'success',
            success_message: "",
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

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadSmsTemplates();
    }


    tog_delete(id) {
        // console.log('delete Id: '+id);
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
        let raw1 = {
            consentTemplateId: this.state.consentTemplateId,
            templateId: this.state.approve_sid
        }

        let raw2 = {
            rejectReason: this.state.rejectReason,
            templateId: this.state.reject_sid
        }
        

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
            // this.LoadingBar.complete()
          })
          .catch(error => console.log('error', error));
    }

    approveSmsTemplate(){

    }

    rejectSmsTemplate(){

    }

    loadSmsTemplates(){
        ServerApi({'URL': 'BASE'}).get(`sms/getAllSmsTemplates`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }
            
            res.data.reverse().map((item, index)=>{
                item.slno = (index+1);
                item.messageTextField = item.message;
                item.createdOn = new Date(item.createdOn).toLocaleString('en-US', {hour12: true});
                item.createdBy = <span style={{color: 'blue', cursor: 'pointer'}} onClick={()=>this.props.history.push({pathname: '/manageClient', state: { clientId: item.createdById }})}>{item.createdBy}</span>
                item.action = <div>
                                   {getLoggedInUser().userType === 'SUPER_ADMIN' && (<>{(item.status === 0)?(<><Button onClick={()=>this.tog_reject(item.id)} type="button" color="warning" size="sm" className="waves-effect mb-2 mr-2" title="Reject"><span className="fa fa-info-circle"></span></Button><Button onClick={()=>this.tog_approve(item.id)} type="button" color="success" size="sm" className="waves-effect mb-2 mr-2" title="Approve"><span className="fa fa-check"></span></Button></>):null}</>)}
                                   {(item.status===2)?<Button type="button" onClick={()=>this.props.history.push({pathname: '/updateSmsTemplate', state: { templateId: item.id, name: item.templateName, category: item.category, type:item.type, senderIds: item.senderIdsList, message: item.templateMessage }})} color="info" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-edit"></i></Button>:null}
                                   <Button type="button" onClick={()=>this.tog_delete(item.id)} color="danger" size="sm" className="waves-effect mb-2"><i className="fa fa-trash"></i></Button>
                              </div>;
                item.status = (item.status === 1)?(<Tag color="green">Approed</Tag>):(item.status === 2)?<Tag color="red">Rejected</Tag>:<Tag color="red">Pending Approval</Tag>;
                // item.messageTextField = item.message;
                item.templateMessage = (item.messageTextField !==undefined && item.messageTextField.length > 55)?<>{item.messageTextField.slice(0, 55)} <span style={{cursor: 'pointer', color: 'blue'}} onClick={(e)=>this.setState({anchorEl:e.currentTarget, modalFullMessage: true, fullMessage: item.messageTextField})} aria-describedby="full-message">... read more</span></>:item.messageTextField;
                delete item.message;
                return true;
            });  

            let newTableDataRows = [...this.state.tableData.rows];
            newTableDataRows = res.data;
            this.setState({tableData: {...this.state.tableData, rows: newTableDataRows}})
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
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">SMS TEMPLATE</h4>
                            </Col>
                            <Col sm="6">
                                <div className="float-right d-none d-md-block">                                
                                    <Link to='addSmsTemplate'><Button type="button" color="primary" size="md" className="waves-effect mr-2"><i className="fa fa-plus mr-2"></i> Add Template</Button></Link>
                                    {/*<Button onClick={this.tog_sample} type="button" color="primary" size="md" className="waves-effect"><i className="fa fa-plus mr-2"></i> Add Sample Code</Button>*/}
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>

                                    {/* <Table columns={columns} dataSource={this.state.tableData.rows} onChange={this.onChange} size="small" /> */}

                                    <MDBDataTable
                                        sortable
                                        responsive
                                        striped
                                        hover
                                        data={this.state.tableData}
                                    />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            type={this.state.modalType}
                            confirmBtnBsStyle="success"
                            onConfirm={() => this.setState({ success_msg: false })} >
                        </SweetAlert> 
                    }

                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_delete: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h6 className="text-center">Are You Sure You want to delete ?</h6>

                            <FormGroup className="mt-5 text-center">
                                <Button onClick={this.deleteSmsTemplate} type="button" color="danger" className="mr-1">
                                    Delete
                                </Button>
                                <Button type="button" color="secondary" className="mr-1" onClick={() => this.setState({ modal_delete: false })} data-dismiss="modal" aria-label="Close">
                                    Cancel
                                </Button>
                            </FormGroup >

                        </ModalBody>
                    </Modal>

                    <Modal centered isOpen={this.state.modal_approve} toggle={this.tog_approve} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_approve: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h6 className="text-center">Approve Template</h6>

                            <AvForm onValidSubmit={()=>this.permitTemplate('approve')} >

                                <div className="p-3">
                                    <AvField name="templateId" 
                                        label='Template ID'
                                        className="mt-2"
                                        onChange={(e)=>this.setState({consentTemplateId: e.target.value})}
                                        placeholder="" type="text" 
                                        errorMessage="Enter Template Id"
                                        validate={{ required: { value: true } }} />
                                </div>

                                <div className="text-center">
                                    <Button value="submit" type="submit" color="success" className="mr-1">
                                        Approve
                                    </Button>
                                    <Button type="button" color="secondary" className="mr-1" onClick={() => this.setState({ modal_approve: false })} data-dismiss="modal" aria-label="Close">
                                        Cancel
                                    </Button>
                                </div >

                            </AvForm>

                        </ModalBody>
                    </Modal>

                    <Modal centered isOpen={this.state.modal_reject} toggle={this.tog_reject} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_reject: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h6 className="text-center">Reject Template</h6>

                            <AvForm onValidSubmit={()=>this.permitTemplate('reject')} >

                                <div className="p-3">
                                    {/* <AvField name="templateId" 
                                        label='Template ID'
                                        className="mt-2"
                                        placeholder="" type="text" 
                                        onChange={(e)=>this.setState({reject_sid: e.target.value})}
                                        errorMessage="Enter Template Id"
                                        validate={{ required: { value: true } }} /> */}
                                    
                                    <AvField name="rejectReason" 
                                        label='Reject Reason'
                                        className="mt-2"
                                        placeholder="" type="text" 
                                        onChange={(e)=>this.setState({rejectReason: e.target.value})}
                                        errorMessage="Enter Reject Reason"
                                        validate={{ required: { value: true } }} />
                                </div>

                                <div className="text-center">
                                    <Button value="submit" type="submit" color="danger" className="mr-1">
                                        Reject
                                    </Button>
                                    <Button type="button" color="secondary" className="mr-1" onClick={() => this.setState({ modal_reject: false })} data-dismiss="modal" aria-label="Close">
                                        Cancel
                                    </Button>
                                </div >

                            </AvForm>

                        </ModalBody>
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
                        <div className="p-3" style={{maxWidth: 440}}>
                            <Typography component="h6" variant="caption" style={{borderBottom: '1px dashed grey'}} className="mb-2 text-center">
                                SMS Template
                            </Typography>

                            <Typography variant="body2" >{this.state.fullMessage}</Typography>
                        </div>
                    </Popover>

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, openSnack })(SmsTemplate));