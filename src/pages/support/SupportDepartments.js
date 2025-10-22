import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select';
import { withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';
import SweetAlert from 'react-bootstrap-sweetalert';

const CLIENT_GROUP_STATUS = [
    {
        options: [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" }
        ]
    }
];

class SupportDepartments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: {label:'Yes', value: 'Yes'}, 
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
                        field: 'slno',
                        sort: 'asc',
                        width: 50
                    },
                    {
                        label: 'Department Name',
                        field: 'departmentName',
                        sort: 'asc',
                        width: 150
                    },
                    {
                        label: 'Email',
                        field: 'emial',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'Show In Client',
                        field: 'showInClient',
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
                    {
                        slno: 1,
                        departmentName: 'Support',
                        emial: 'suppoer@example.com',
                        showInClient: <span className="badge badge-success p-1">Yes</span>,
                        action: <div><Button onClick={()=>this.ViewSupport()} type="button" color="primary" size="sm" className="waves-effect waves-light mr-2">View</Button>
                                   <Button onClick={()=>this.tog_delete(1)} type="button" color="danger" size="sm" className="waves-effect">Delete</Button></div>,

                    }
                ]
            },
        };
        this.addClientGroup = this.addClientGroup.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
        this.ViewSupport = this.ViewSupport.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        // this.loadClientGroups();
    }
    
    //Select 
    handleSelectGroup = (selectedGroup) => {
        this.setState({ selectedGroup });
    }

    ManageClick() {        
        this.props.history.push('/manageClient');
    }

    ViewSupport(){
        this.props.history.push({pathname: '/viewSupportDepartments', state: { clientId: 1 }})
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

        const { selectedGroup } = this.state;
        // const { selectedMulti } = this.state;

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">Support Departments</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="4">
                            <Card>
                                <CardBody>

                                    <AvForm onValidSubmit={this.addClientGroup}>
                                        <AvField name="group_name" label="Department NAME"
                                            type="text" errorMessage="Enter Department Name"
                                            validate={{ required: { value: true } }} />
                                        <AvField name="group_name" label="Department Email"
                                            type="email" errorMessage="Enter Department Email"
                                            validate={{ required: { value: true } }} />

                                            <Label>SHOW IN CLIENT </Label>
                                            <Select
                                                name="group_status"
                                                label="SHOW IN CLIENT"
                                                isSelected={true}
                                                value={selectedGroup}
                                                onChange={this.handleSelectGroup}
                                                options={CLIENT_GROUP_STATUS}
                                            />

                                        <FormGroup className="mb-0 mt-3">
                                            <div>
                                                <Button type="submit" 
                                                disabled={this.state.isAdding}
                                                color="primary" className="mr-1">
                                                    {!this.state.isAdding && <i className="ti ti-plus mr-2"></i>} Add New
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

                                    <MDBDataTable
                                        responsive
                                        striped
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

export default withRouter(connect(null, { activateAuthLayout })(SupportDepartments));