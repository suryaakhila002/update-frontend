import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select';
import { withRouter } from 'react-router-dom';
import { AvForm } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
import SweetAlert from 'react-bootstrap-sweetalert';

const DEPARTMENT = [
    {
        options: [
            { label: "Support", value: "Support", isOptionSelected: true },
            { label: "Billing ", value: "Billing " },
        ]
    }
];

const STATUS = [
    {
        options: [
            { label: "Pending", value: "Pending", isOptionSelected: true },
            { label: "Answered ", value: "Answered " },
            { label: "Closed ", value: "Closed " },
        ]
    }
];

class ManageTicket extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: {label:'Support', value: 'Support'}, 
            selectedGroup1: {label:'Pending', value: 'Pending'}, 
            selectedMulti: null,
            success_msg: false,
            isAdding: false,
            isDeleting: false,
            modal_delete: false,
            delete_sid: '',
            tableData : {
                columns: [
                    {
                        label: 'SL',
                        field: 'sl',
                        sort: 'asc',
                        width: 150
                    },
                    {
                        label: 'Name',
                        field: 'name',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'User Name',
                        field: 'userName',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'Role',
                        field: 'role',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'STATUS',
                        field: 'status',
                        sort: 'asc',
                        width: 200
                    },
                    {
                        label: 'ACTION',
                        field: 'action',
                        sort: 'asc',
                        width: 100
                    }
                ],
                rows: [
                    
                ]
            },
        };
        this.addClientGroup = this.addClientGroup.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        // this.loadClientGroups();
    }
    
    //Select 
    handleSelectGroup = (selectedGroup) => {
        this.setState({ selectedGroup });
    }
    handleSelectGroup1 = (selectedGroup) => {
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
            this.setState({success_msg: true, success_message: data.response, isAdding: false});
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
            
            data.map((item, index)=>{
                item.status = (item.isDeleted === 'Active')?(<span className="badge badge-success p-1">Active</span>):(<span className="badge badge-danger p-1">In Active</span>);
                item.action = <div><Button onClick={()=>null} type="button" color="primary" size="sm" className="waves-effect waves-light mr-2">Manage</Button>
                                   <Button onClick={()=>this.tog_delete(item.id)} type="button" color="danger" size="sm" className="waves-effect">Delete</Button></div>;
                return true;
            }); 
            let newTableDataRows = [...this.state.tableData.rows];
            newTableDataRows = data;
            this.setState({tableData: {...this.state.tableData, rows: newTableDataRows}})
          })
          .catch(error => console.log('error', error));
    }

    render() {

        const { selectedGroup, selectedGroup1 } = this.state;
        // const { selectedMulti } = this.state;

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">Manage Ticket</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="4">
                            <Card>
                                <CardBody>

                                    <h4 className="mt-0 header-title">CHANGE BASIC INFO</h4>

                                    <AvForm onValidSubmit={this.addClientGroup}>
                                        <Label>Change Department</Label>
                                        <Select
                                            className="mb-3"
                                            name="department"
                                            label="Change Department"
                                            isSelected={true}
                                            value={selectedGroup}
                                            onChange={this.handleSelectGroup}
                                            options={DEPARTMENT}
                                        />

                                        <Label>Status</Label>
                                        <Select
                                            className="mb-3"
                                            name="status"
                                            label="CLIENT GROUP"
                                            isSelected={true}
                                            value={selectedGroup1}
                                            onChange={this.handleSelectGroup1}
                                            options={STATUS}
                                        />


                                        

                                        <FormGroup className="mb-0">
                                            <div>
                                                <Button type="button" 
                                                disabled={this.state.isAdding}
                                                color="primary" className="mr-1">
                                                    {!this.state.isAdding && <i className="ti ti-save mr-2"></i>} Update
                                                </Button>{' '}
                                            </div>
                               
                                       </FormGroup>

                                    </AvForm>

                                </CardBody>
                            </Card>
                        </Col>

                        <Col sm="12" lg="8">
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">TICKET MANAGEMENT</h4>

                                    <h6>TICKET DETAILS</h6>

                                    <p>Ticket For Client: Shamim Rahman
                                    Email: shamimcoc97@gmail.com
                                    Created Date: 9th Feb 20
                                    Created By: Abul Kashem
                                    Department: Support
                                    Status: Answered
                                    Subject: Want New Connection
                                    Message:
                                    Dramatically fabricate distinctive best practices rather than process-centric synergy. Completely administrate resource maximizing synergy before proactive leadership. Continually negotiate team driven niches whereas sustainable scenarios.</p>
                                </CardBody>
                            </Card>
                        </Col>

                    </Row>

                    {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            success
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

export default withRouter(connect(null, { activateAuthLayout })(ManageTicket));