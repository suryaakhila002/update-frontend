import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';
import SweetAlert from 'react-bootstrap-sweetalert';
import {ServerApi} from '../../utils/ServerApi';
import { Tag, Empty } from 'antd';
import { getLoggedInUser } from '../../helpers/authUtils';

class AllClients extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData : {
                columns: [
                    {
                        label: 'SL' ,
                        field: 'slno',
                        sort: 'asc',
                        width: 50
                    },
                    {
                        label: 'USERNAME' ,
                        field: 'userName',
                        sort: 'asc',
                        width: 80
                    },
                    // {
                    //     label: 'DETAILS',
                    //     field: 'contact_details',
                    //     sort: 'asc',
                    //     width: 100
                    // },
                    {
                        label: 'USER TYPE',
                        field: 'userType',
                        sort: 'asc',
                        width: 250
                    },
                    // {
                    //     label: 'CREATEDBY',
                    //     field: 'createdBy',
                    //     sort: 'asc',
                    //     width: 70
                    // },
                    {
                        label: 'DATE',
                        field: 'createdTime',
                        sort: 'asc',
                        width: 100
                    },
                    {
                        label: 'Wallet',
                        field: 'wallet',
                        sort: 'asc',
                        width: 100
                    },
                    {
                        label: 'STATUS',
                        field: 'status',
                        sort: 'asc',
                        width: 100
                    },
                    {
                        label: 'ACTION',
                        field: 'action',
                        sort: 'asc',
                        width: 280
                    }
                ],
                rows: []
            },
            success_msg: false,
            modal_type: 'success',
            success_message: '',
            modal_standard: false,
            modal_delete: false,
            delete_sid: '',
            isDeleting: false,
            isLoading: true,
        };
        this.tog_standard = this.tog_standard.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteCient = this.deleteCient.bind(this);
        this.manageClient = this.manageClient.bind(this);
    }

    componentDidMount() {
        console.log('All clkients components')
        this.props.activateAuthLayout();

        this.loadClients();

    }

    manageClient(id) {        
        this.props.history.push({pathname: '/manageClient', state: { clientId: id }});
    }

    tog_standard() {
        this.setState(prevState => ({
            modal_standard: !prevState.modal_standard
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

    deleteCient(){
        if (this.state.delete_sid === "") { return false; }

        this.setState({isDeleting: true});

        var raw = {
            clientId: this.state.delete_sid,
        }

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).post('auth/deleteUser/', raw)
          .then(res => {
            if (res.status === 404) {
                this.setState({success_msg: true, success_message: 'Unable to remove user.',modal_type: 'error', isDeleting: false});
                this.tog_delete();
                return;
            }
            this.setState({success_msg: true, modal_type: 'success', success_message: 'User Removed.', isDeleting: false});
            this.loadClients();
            this.tog_delete();

          })
          .catch(error => console.log('error', error));
    }

    loadClients(){
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(`getAllClients/${getLoggedInUser().id}`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }

            // if(getLoggedInUser().userType !== "SUPER_ADMIN"){
            //     this.setState({tableData: {columns: this.state.tableData.columns.filter(e => e.field !== e.createdBy), rows: []}});
            // }

            res.data.map((item, index)=>{
                item.slno = (index+1);
                // item.contact_details = <p><p className="mb-0">{item.phoneNumber}</p><p>{item.email}</p></p>;
                // item.user_type = <p>
                //                    <p className="mb-0"><b>USER TYPE:</b> {item.userType}</p>
                //                    <p className="mb-0"><b>SMS TYPE:</b> {item.smsType}</p>
                //                    <p className="mb-0"><b>ROUTING:</b> {item.routeName}</p>
                //                </p>;
                item.createdTime = new Date(item.createDate).toDateString(); 
                item.userType = (item.userType === 'ADMIN')?(<Tag color="green">ADMIN</Tag>):(item.userType === 'RESELLER')?(<Tag color="blue">{item.userType}</Tag>):(<Tag color="red">{item.userType}</Tag>);
                item.wallet = <p>{Math.round((parseFloat(item.wallet.closingCredit) + Number.EPSILON) * 1000000) / 1000000}</p>;
                item.action = <div><Button title="Manage" onClick={()=>this.manageClient(item.id)}  type="button" color="primary" size="sm" className="waves-effect waves-light mr-2 mb-2"><i className="fa fa-edit"></i></Button>
                        {/* <Button title="Delete" onClick={()=>this.tog_delete(item.id)} type="button" color="danger" size="sm" className="waves-effect mr-2 mb-2"><i className="fa fa-trash"></i></Button> */}
                        {(item.status === 'ACTIVE')?(<Button onClick={()=>this.permitClientId(false, item.id)} type="button" color="warning" title="Deactivate" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-info"></i></Button>):(<Button title="Activate" onClick={()=>this.permitClientId(true, item.id)} type="button" color="success" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-check"></i></Button>)}</div>
                item.status = (item.status === 'ACTIVE')?(<Tag color="green">Active</Tag>):(<Tag color="red">Inactive</Tag>);
                return true;
            });  

            let newTableDataRows = [...this.state.tableData.rows];
            newTableDataRows = res.data;
            this.setState({isLoading: false, tableData: {...this.state.tableData, rows: newTableDataRows}})

          })
          .catch(error => {
               console.log('error', error);
               this.setState({isLoading: false});
            });
    }

    permitClientId(status, id){
        if (id === "") { return false; }

        var raw = {
            clientId: id,
            creatorId: "string",
            description: "string",
            status: status
          }

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).post(`auth/activateUser/`, raw)
          .then(res => {
            this.loadClients();
            this.setState({success_msg: true, success_message: 'Client Updated.', isAdding: false});
          })
          .catch(error => console.log('error', error));
    }

    render() {

        if (this.state.isLoading) { return(<Empty imageStyle={{marginTop: 100}} description="Loading Data Please Wait..."></Empty>) }

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">All Clients</h4>
                            </Col>
                            <Col sm="6">
                                <div className="float-right d-none d-md-block">
                                    {getLoggedInUser().userType === 'SUPER_ADMIN' && (
                                        <Button onClick={()=>this.props.history.push('/superadminCreateClients')} type="button" color="primary" size="sm" className="waves-effect"><i className="fa fa-plus mr-2"></i> Add New Client</Button>
                                    )}
                                    {getLoggedInUser().userType === 'ADMIN' && (
                                        <Button onClick={()=>this.props.history.push('/adminCreateClients')} type="button" color="primary" size="sm" className="waves-effect"><i className="fa fa-plus mr-2"></i> Add New Client</Button>
                                    )}
                                    {getLoggedInUser().userType === 'RESELLER' && (
                                        <Button onClick={()=>this.props.history.push('/resellerCreateClients')} type="button" color="primary" size="sm" className="waves-effect"><i className="fa fa-plus mr-2"></i> Add New Client</Button>
                                    )}
                                </div>
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
                                        hover
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
                            confirmBtnBsStyle={this.state.modal_type}
                            onConfirm={() => this.setState({ success_msg: false })} 
                            type={this.state.modal_type} >
                        </SweetAlert> 
                    }

                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_delete: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h6 className="text-center">Are You Sure You want to delete ?</h6>

                            <FormGroup className="mt-5 text-center">
                                <Button onClick={this.deleteCient} type="button" color="danger" className="mr-1">
                                    {(this.state.isDeleting)?'Please Wait...':'Delete'}
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

export default withRouter(connect(null, { activateAuthLayout })(AllClients));