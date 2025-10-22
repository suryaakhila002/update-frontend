import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';
import SweetAlert from 'react-bootstrap-sweetalert';

class AllSupportTickets extends Component {
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
                        label: 'CLIENT NAME' ,
                        field: 'clientName',
                        sort: 'asc',
                        width: 150
                    },
                    {
                        label: 'EMAIL',
                        field: 'email',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'SUBJECT',
                        field: 'subject',
                        sort: 'asc',
                        width: 240
                    },
                    {
                        label: 'DATE',
                        field: 'date',
                        sort: 'asc',
                        width: 70
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
                        width: 200
                    }
                ],
                rows: [
                    {
                        slno: '1',
                        clientName: 'Shamim Rahman',
                        email: 'shamimcoc97@gmail.com',
                        subject: 'Want New Connection',
                        date: '7th Feb 20',
                        status: <span className="badge badge-success p-1">closed</span>,
                        action: <div><Button onClick={()=>this.manageClient(1)}  type="button" color="primary" size="sm" className="waves-effect waves-light mr-2 mb-2">Manage</Button>
                        <Button onClick={()=>this.tog_delete()} type="button" color="danger" size="sm" className="waves-effect mb-2">Delete</Button></div>
                    }
                ]
            },
            success_msg: false,
            modal_type: 'success',
            success_message: '',
            modal_standard: false,
            modal_delete: false,
            delete_sid: '',
            isDeleting: false,
        };
        this.tog_standard = this.tog_standard.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteCient = this.deleteCient.bind(this);
        this.manageClient = this.manageClient.bind(this)
    }

    componentDidMount() {
        this.props.activateAuthLayout();

        // this.loadClients();

    }

    manageClient(id) {        
        this.props.history.push({pathname: '/manageTicket', state: { clientId: id }});
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
        var userData = JSON.parse(localStorage.getItem('user'));

        var requestOptions = {
          method: 'GET',
          headers: {"Content-Type": "application/json", 'Authorization': 'Bearer '+userData.sessionToken},
          redirect: 'follow'
        };

        fetch("http://atssms.com:8090/deleteClient/"+this.state.delete_sid, requestOptions)
          .then(response => response.json())
          .then(data => {
            if (data.status === 404) {
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
        var token = JSON.parse(localStorage.getItem('user')).sessionToken;

        var requestOptions = {
          method: 'GET',
          headers: {'Authorization': 'Bearer '+token, "Content-Type": "application/json"},
          redirect: 'follow'
        };

        fetch("http://atssms.com:8090/getAllClients", requestOptions)
          .then(response => response.json())
          .then(data => {
            if (data === undefined) {
                return false;
            }

            data.map((item, index) => {
                item.slno = (index+1);
                // item.userName = item.userName;
                item.contact_details = <p><p className="mb-0">{item.phoneNumber}</p><p>{item.email}</p></p>;
                item.other_details = <p>
                                   <p className="mb-0"><b>USER TYPE:</b> {item.userType}</p>
                                   <p className="mb-0"><b>SMS TYPE:</b> {item.smsType}</p>
                                   <p className="mb-0"><b>ROUTING:</b> </p>
                               </p>;
                item.credits = <p>
                                    <p className="mb-0"><b>ASSIGN:</b> </p>
                                    <p className="mb-0"><b>USED:</b> </p>
                                    <p className="mb-0"><b>REMANING:</b> </p>
                                 </p>;
                item.status = (item.isDeleted === false)?(<span className="badge badge-success p-1">Active</span>):(<span className="badge badge-danger p-1">Blocked</span>);
                item.action = <div><Button onClick={()=>this.manageClient(item.id)}  type="button" color="primary" size="sm" className="waves-effect waves-light mr-2 mb-2">Manage</Button>
                                        {(item.isDeleted === false)?(<Button onClick={()=>null} type="button" color="warning" size="sm" className="waves-effect mb-2">Deactivate</Button>):(<Button onClick={()=>null} type="button" color="success" size="sm" className="waves-effect mb-2">Activate</Button>)}

                                        
                                        <Button onClick={()=>this.tog_delete(item.id)} type="button" color="danger" size="sm" className="waves-effect mb-2">Delete</Button></div>
                return true;

            });  

            let newTableDataRows = [...this.state.tableData.rows];
            newTableDataRows = data;
            this.setState({tableData: {...this.state.tableData, rows: newTableDataRows}})

          })
          .catch(error => console.log('error', error));
    }

    render() {

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
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

export default withRouter(connect(null, { activateAuthLayout })(AllSupportTickets));