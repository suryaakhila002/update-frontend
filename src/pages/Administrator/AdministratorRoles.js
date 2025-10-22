import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select';
import { withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';
import SweetAlert from 'react-bootstrap-sweetalert';

const ROLES = [
    {
        label: "Status",
        options: [
            { label: "Active", value: "Active", isOptionSelected: true },
        ]
    }
];

class AdministratorRoles extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: {label:'Active', value: 'Active'}, 
            selectedMulti: null,
            success_msg: false,
            isAdding: false,
            isDeleting: false,
            modal_delete: false,
            delete_sid: '',
            modal_sample: false,
            modal_roles: false,
            tableData : {
                columns: [
                    {
                        label: 'SL',
                        field: 'slno',
                        sort: 'asc',
                        width: 150
                    },
                    {
                        label: 'Role Name',
                        field: 'name',
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
                    {
                        slno:1,
                        name: 'Support Engineer',
                        status: <span className="badge badge-success p-1">Active</span>,
                        action: <div><Button onClick={()=>this.tog_sample()} type="button" color="primary" size="sm" className="waves-effect waves-light mr-2">Edit</Button>
                                   <Button onClick={()=>this.tog_roles()} type="button" color="primary" size="sm" className="waves-effect waves-light mr-2">Set Roles</Button>
                                   <Button onClick={()=>this.tog_delete(1)} type="button" color="danger" size="sm" className="waves-effect">Delete</Button></div>

                    }
                ]
            },
        };
        this.addClientGroup = this.addClientGroup.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);        
        this.tog_sample = this.tog_sample.bind(this);
        this.tog_roles = this.tog_roles.bind(this);
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

    tog_delete(id) {
        this.setState(prevState => ({
            modal_delete: !prevState.modal_delete,
            delete_sid: id,
        }));
        this.removeBodyCss();
    }
    tog_sample() {
        this.setState(prevState => ({
            modal_sample: !prevState.modal_sample
        }));
        this.removeBodyCss();
    }
    tog_roles() {
        this.setState(prevState => ({
            modal_roles: !prevState.modal_roles
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

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">Administrator Roles</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="4">
                            <Card>
                                <CardBody>

                                    <h4 className="mt-0 header-title">Add Administrator Roles</h4>

                                    <AvForm onValidSubmit={this.addClientGroup}>
                                        <AvField name="group_name" label="ROLE NAME"
                                            type="text" errorMessage="Enter ROLE Name"
                                            validate={{ required: { value: true } }} />

                                        


                                        <Label>STATUS </Label>
                                        <Select
                                            className="mb-3"
                                            name="group_status"
                                            label="CLIENT GROUP"
                                            isSelected={true}
                                            value={selectedGroup}
                                            onChange={this.handleSelectGroup}
                                            options={ROLES}
                                        />

                                        <FormGroup className="mb-0">
                                            <div>
                                                <Button type="button" 
                                                disabled={this.state.isAdding}
                                                color="primary" className="mr-1">
                                                    {!this.state.isAdding && <i className="ti ti-plus mr-2"></i>}Add
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
                                    <h4 className="mt-0 header-title">Administrator Roles</h4>

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

                    <Modal isOpen={this.state.modal_sample} toggle={this.tog_sample} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_sample: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>

                            <h6>Edit Role</h6>


                            <AvForm onValidSubmit={this.addClientGroup}>
                                    <AvField name="group_name" label="ROLE NAME"
                                        type="text" errorMessage="Enter ROLE Name"
                                        value="Support Engineer"
                                        validate={{ required: { value: true } }} />

                                    <Label>STATUS </Label>
                                    <Select
                                        className="mb-3"
                                        name="group_status"
                                        label="CLIENT GROUP"
                                        isSelected={true}
                                        value={selectedGroup}
                                        onChange={this.handleSelectGroup}
                                        options={ROLES}
                                    />

                                    <FormGroup className="mb-0">
                                        <div>
                                            <Button type="button" 
                                            disabled={this.state.isAdding}
                                            color="primary" className="mr-1">
                                                {!this.state.isAdding && <i className="ti ti-save mr-2"></i>} Update
                                            </Button>{' '}
                                            <Button type="reset" color="secondary">
                                                Cancel
                                            </Button>
                                        </div>
                           
                                   </FormGroup>

                                </AvForm>

                        </ModalBody>
                    </Modal>

                    <Modal isOpen={this.state.modal_roles} toggle={this.tog_roles} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_roles: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>

                            <h6>SET RULES</h6>


                            <AvForm >

                                <AvField name="checkAll" label="Check All"
                                    type="checkbox" 
                                    validate={{ required: { value: false } }} />

                                <hr />

                                <AvField name="DASHBOARD" label="DASHBOARD"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />

                                <AvField name="ALL CLIENTS" label="ALL CLIENTS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="ADD NEW CLIENT" label="ADD NEW CLIENT"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="MANAGE CLIENT" label="MANAGE CLIENT"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="EXPORT AND IMPORT CLIENTS" label="EXPORT AND IMPORT CLIENTS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="CLIENT GROUP" label="CLIENT GROUP"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="EDIT CLIENT GROUP" label="EDIT CLIENT GROUP"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="ALL INVOICES" label="ALL INVOICES"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="RECURRING INVOICES" label="RECURRING INVOICES"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="MANAGE INVOICES" label="MANAGE INVOICES"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="ADD NEW INVOICE" label="ADD NEW INVOICE"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SEND BULK SMS" label="SEND BULK SMS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SEND SMS FROM FILE" label="SEND SMS FROM FILE"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SEND SCHEDULE SMS" label="SEND SCHEDULE SMS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SCHEDULE SMS FROM FILE" label="SCHEDULE SMS FROM FILE"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SMS HISTORY" label="SMS HISTORY"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SMS GATEWAY" label="SMS GATEWAY"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="ADD SMS GATEWAY" label="ADD SMS GATEWAY"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="MANAGE SMS GATEWAY" label="MANAGE SMS GATEWAY"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SMS PRICE PLAN" label="SMS PRICE PLAN"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="ADD PRICE PLAN" label="ADD PRICE PLAN"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="COVERAGE" label="COVERAGE"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SENDER ID MANAGEMENT" label="SENDER ID MANAGEMENT"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SMS TEMPLATES" label="SMS TEMPLATES"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SMS API" label="SMS API"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SUPPORT TICKETS" label="SUPPORT TICKETS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="CREATE NEW TICKET" label="CREATE NEW TICKET"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="MANAGE SUPPORT TICKETS" label="MANAGE SUPPORT TICKETS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SUPPORT DEPARTMENT" label="SUPPORT DEPARTMENT"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="ADMINISTRATORS" label="ADMINISTRATORS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="ADMINISTRATOR ROLES" label="ADMINISTRATOR ROLES"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SYSTEM SETTINGS" label="SYSTEM SETTINGS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="LOCALIZATION" label="LOCALIZATION"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="EMAIL TEMPLATES" label="EMAIL TEMPLATES"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="LANGUAGE SETTINGS" label="LANGUAGE SETTINGS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="PAYMENT GATEWAYS" label="PAYMENT GATEWAYS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SEND QUICK SMS" label="SEND QUICK SMS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="PRICE BUNDLES" label="PRICE BUNDLES"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="PRICE BUNDLES" label="PRICE BUNDLES"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="IMPORT CONTACTS" label="IMPORT CONTACTS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SPAM WORDS" label="SPAM WORDS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="BLACKLIST CONTACTS" label="BLACKLIST CONTACTS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="BLOCK MESSAGE" label="BLOCK MESSAGE"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="RECURRING SMS" label="RECURRING SMS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SEND RECURRING SMS" label="SEND RECURRING SMS"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />
                                <AvField name="SEND RECURRING SMS FIL" label="SEND RECURRING SMS FIL"
                                    type="checkbox" checked
                                    validate={{ required: { value: false } }} />

                                <FormGroup className="mt-5 text-center">
                                    <Button type="button" color="success" className="mr-1">
                                        Update
                                    </Button>
                                    <Button type="button" color="secondary" className="mr-1" onClick={() => this.setState({ modal_roles: false })} data-dismiss="modal" aria-label="Close">
                                        Cancel
                                    </Button>
                                </FormGroup >


                            </AvForm>

                        </ModalBody>
                    </Modal>


                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(AdministratorRoles));