import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';
import SweetAlert from 'react-bootstrap-sweetalert';
import {ServerApi} from '../../utils/ServerApi';
import {Tag} from 'antd';
import {getLoggedInUser} from '../../helpers/authUtils';

class SmsRoutes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_standard: false,
            modal_edit: false,
            modal_delete: false,
            isAdding: false,
            success_msg: false,
            modalType: 'success',
            success_message: "",
            delete_sid: "",
            modal_edit_index: 0,
            tableData : {
                columns: [
                    {
                        label: 'SL' ,
                        field: 'slno',
                        sort: 'asc',
                        width: 50
                    },
                    {
                        label: 'ROUTE Name' ,
                        field: 'routeName',
                        sort: 'asc',
                        width: 100
                    },
                    {
                        label: 'Host Name' ,
                        field: 'hostname',
                        sort: 'asc',
                        width: 150
                    },
                    {
                        label: 'Port',
                        field: 'port',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'System Id',
                        field: 'systemId',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'Password',
                        field: 'password',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'Transmitter',
                        field: 'transmitter',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'Transceiver',
                        field: 'transceiver',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'Receiver',
                        field: 'receiver',
                        sort: 'asc',
                        width: 270
                    },

                    {
                        label: 'STATUS',
                        field: 'statusBadge',
                        sort: 'asc',
                        width: 100
                    },
                    {
                        label: 'Type',
                        field: 'type',
                        sort: 'asc',
                        width: 100
                    },
                    {
                        label: 'ACTION',
                        field: 'action',
                        sort: 'asc',
                        width: 200
                    }
                ],
                rows: [
                ]
            },
        };
        this.tog_standard = this.tog_standard.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.tog_edit = this.tog_edit.bind(this);
        this.addSmsRoute = this.addSmsRoute.bind(this);
        this.updateSmsRoute = this.updateSmsRoute.bind(this);
        this.deleteRoute = this.deleteRoute.bind(this);
    }

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

        var raw = JSON.stringify(
            {
                creatorId: getLoggedInUser().id,
                port: values.port,
                hostname: values.hostname,
                routeName: values.routeName, 
                systemId: values.systemId, 
                password: values.password,
                transmitter: values.transmitter, 
                transceiver: values.transceiver, 
                receiver: values.receiver, 
                status: values.status, 
                systemtype: values.type, 
            }
        );

    ServerApi().post('routes/add-route', raw)
        .then(res => {
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

        var raw = JSON.stringify({
            id: values.id,
            creatorId: getLoggedInUser().id,
            port: values.port,
            hostname: values.hostname,
            routeName: values.routeName, 
            systemId: values.systemId, 
            password: values.password,
            transmitter: values.transmitter, 
            transceiver: values.transceiver, 
            receiver: values.receiver, 
            status: values.status, 
            type: values.type, 
        });

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
            
            res.data.map((item, index)=>{
                item.slno = (index+1);
                // item.createdTime = new Date(item.createdTime).toLocaleString('en-US', {hour12: false})
                item.statusBadge = (item.status === 'Active')?(<Tag color="green">{item.status}</Tag>):(<Tag color="red">{item.status}</Tag>);
                item.action = <div><Button type="button" onClick={()=>this.tog_edit(index)} color="info" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-edit"></i></Button>
                                   <Button type="button" onClick={()=>this.tog_delete(item.id)} color="danger" size="sm" className="waves-effect mb-2"><i className="fa fa-trash"></i></Button>
                                   <Button title="Restart" type="button" onClick={()=>null} color="warning" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-refresh"></i></Button>
                                   <Button title="Shutdown" type="button" onClick={()=>null} color="danger" size="sm" className="waves-effect mb-2"><i className="mdi mdi-power"></i></Button></div>;
                return true;
            });  

            let newTableDataRows = [...this.state.tableData.rows];
            newTableDataRows = res.data;
            this.setState({tableData: {...this.state.tableData, rows: newTableDataRows}})
        })
        .catch(error => console.log('error', error));
    }

    render() {

        return (
            <React.Fragment>
                <Container fluid>
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
                                    <ModalBody>
                                        <button type="button" onClick={() => this.setState({ modal_standard: false })} className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>

                                        <AvForm onValidSubmit={this.addSmsRoute}>
                                            <FormGroup >
                                                <AvField name="routeName" label="RouteName"
                                                    placeholder="Enter RouteName" type="text" 
                                                    errorMessage="Enter RouteName"
                                                    validate={{ required: { value: true } }} />
                                            </FormGroup>
                                            <FormGroup >
                                                <AvField name="hostname" label="HostName"
                                                    placeholder="Enter HostName" type="text" 
                                                    errorMessage="Enter HostName"
                                                    validate={{ required: { value: true } }} />
                                            </FormGroup>

                                            <FormGroup >
                                                <AvField name="port" label="Port"
                                                    placeholder="Enter Port" type="text" 
                                                    errorMessage="Enter Port"
                                                    validate={{ required: { value: true } }} />
                                            </FormGroup>

                                            <FormGroup >
                                                <AvField name="systemId" label="SystemID"
                                                    placeholder="Enter SystemID" type="text" 
                                                    errorMessage="Enter SystemID"
                                                    validate={{ required: { value: true } }} />
                                            </FormGroup>

                                            <FormGroup >
                                                <AvField name="password" label="Password "
                                                    placeholder="Enter Password"  type="text" 
                                                    errorMessage="Enter Password "
                                                    validate={{ required: { value: true } }} />
                                            </FormGroup>

                                            <FormGroup >
                                                <AvField name="transmitter" label="Transmitter"
                                                    placeholder="Enter Transmitter" type="text" 
                                                    errorMessage="Enter Transmitter"
                                                    validate={{ required: { value: true } }} />
                                            </FormGroup>

                                            <FormGroup >
                                                <AvField name="transceiver" label="Transceiver"
                                                    placeholder="Enter Transceiver" type="text" 
                                                    errorMessage="Enter Transceiver"
                                                    validate={{ required: { value: true } }} />
                                            </FormGroup>

                                            <FormGroup >
                                                <AvField name="receiver" label="Receiver"
                                                    placeholder="Enter Receiver" type="text" 
                                                    errorMessage="Enter Receiver"
                                                    validate={{ required: { value: true } }} />
                                            </FormGroup>

                                            <FormGroup >
                                                <AvField name="status" label="Status"
                                                    placeholder="Enter Status" type="text" 
                                                    errorMessage="Enter Status"
                                                    validate={{ required: { value: true } }} />
                                            </FormGroup>

                                            <FormGroup className="mb-3">
                                                <AvField name="type" label="Type"
                                                    placeholder="Enter Type" type="text" 
                                                    errorMessage="Enter Type"
                                                    validate={{ required: { value: true } }} />
                                            </FormGroup>


                                            <FormGroup className="float-right">
                                                <Button disabled={this.state.isAdding} type="submit" color="success" className="mr-1">
                                                    {(this.state.isAdding)?'Please Wait...':'Add Route'}
                                                </Button>
                                            </FormGroup >
                                        </AvForm>

                                    </ModalBody>
                                </Modal>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>

                                    <MDBDataTable
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
                                <Button onClick={this.deleteRoute} type="button" color="danger" className="mr-1">
                                    Delete
                                </Button>
                                <Button type="button" color="secondary" className="mr-1" onClick={() => this.setState({ modal_delete: false })} data-dismiss="modal" aria-label="Close">
                                    Cancel
                                </Button>
                            </FormGroup >

                        </ModalBody>
                    </Modal>


                    <Modal isOpen={this.state.modal_edit} toggle={this.tog_edit} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_edit: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>

                            {this.state.modal_edit && 

                            <AvForm onValidSubmit={this.updateSmsRoute}>
                                <FormGroup >
                                    <AvField name="id" 
                                        placeholder="Id" type="hidden" 
                                        value={this.state.tableData.rows[this.state.modal_edit_index].id}
                                       />
                                </FormGroup>
                                <FormGroup >
                                    <AvField name="routeName" label="RouteName"
                                        placeholder="Enter RouteName" type="text" 
                                        errorMessage="Enter RouteName"
                                        value={this.state.tableData.rows[this.state.modal_edit_index].routeName}
                                        validate={{ required: { value: true } }} />
                                </FormGroup>
                                <FormGroup >
                                    <AvField name="hostname" label="HostName"
                                        placeholder="Enter HostName" type="text" 
                                        errorMessage="Enter HostName"
                                        value={this.state.tableData.rows[this.state.modal_edit_index].hostname}
                                        validate={{ required: { value: true } }} />
                                </FormGroup>

                                <FormGroup >
                                    <AvField name="port" label="Port"
                                        placeholder="Enter Port" type="text" 
                                        value={this.state.tableData.rows[this.state.modal_edit_index].port}
                                        errorMessage="Enter Port"
                                        validate={{ required: { value: true } }} />
                                </FormGroup>

                                <FormGroup >
                                    <AvField name="systemId" label="SystemID"
                                        placeholder="Enter SystemID" type="text" 
                                        value={this.state.tableData.rows[this.state.modal_edit_index].systemId}
                                        errorMessage="Enter SystemID"
                                        validate={{ required: { value: true } }} />
                                </FormGroup>

                                <FormGroup >
                                    <AvField name="password" label="Password "
                                        placeholder="Enter Password"  type="text" 
                                        value={this.state.tableData.rows[this.state.modal_edit_index].password}
                                        errorMessage="Enter Password "
                                        validate={{ required: { value: true } }} />
                                </FormGroup>

                                <FormGroup >
                                    <AvField name="transmitter" label="Transmitter"
                                        placeholder="Enter Transmitter" type="text" 
                                        value={this.state.tableData.rows[this.state.modal_edit_index].transmitter || '0'}
                                        errorMessage="Enter Transmitter"
                                        validate={{ required: { value: true } }} />
                                </FormGroup>

                                <FormGroup >
                                    <AvField name="transceiver" label="Transceiver"
                                        placeholder="Enter Transceiver" type="text" 
                                        value={this.state.tableData.rows[this.state.modal_edit_index].transceiver || '0'}
                                        errorMessage="Enter Transceiver"
                                        validate={{ required: { value: true } }} />
                                </FormGroup>

                                <FormGroup >
                                    <AvField name="receiver" label="Receiver"
                                        placeholder="Enter Receiver" type="text" 
                                        value={this.state.tableData.rows[this.state.modal_edit_index].receiver || '0'}
                                        errorMessage="Enter Receiver"
                                        validate={{ required: { value: true } }} />
                                </FormGroup>

                                <FormGroup >
                                    <AvField name="status" label="Status"
                                        placeholder="Enter Status" type="text" 
                                        value={this.state.tableData.rows[this.state.modal_edit_index].status}
                                        errorMessage="Enter Status"
                                        validate={{ required: { value: true } }} />
                                </FormGroup>

                                <FormGroup className="mb-3">
                                    <AvField name="type" label="Type"
                                        placeholder="Enter Type" type="text" 
                                        value={this.state.tableData.rows[this.state.modal_edit_index].type}
                                        errorMessage="Enter Type"
                                        validate={{ required: { value: true } }} />
                                </FormGroup>

                                <FormGroup className="mb-3">
                                    <AvField name="id" 
                                        type="hidden" 
                                        value={this.state.tableData.rows[this.state.modal_edit_index].id}
                                        validate={{ required: { value: true } }} />
                                </FormGroup>


                                <FormGroup className="float-right">
                                    <Button disabled={this.state.isAdding} type="submit" color="success" className="mr-1">
                                        {(this.state.isAdding)?'Please Wait...':'Update Route'}
                                    </Button>
                                </FormGroup >
                            </AvForm>

                            }

                        </ModalBody>
                    </Modal>

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, openSnack })(SmsRoutes));