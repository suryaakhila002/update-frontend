import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select';
// import { withRouter } from 'react-router-dom';

import { connect } from 'react-redux';

// --- KEY CHANGES (IMPORTS) ---
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated
import Swal from 'sweetalert2'; // ADDED: Modern Alert Library
import withReactContent from 'sweetalert2-react-content'; // ADDED: React wrapper
// --- END KEY CHANGES ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

const CLIENT_GROUP_STATUS = [
    {
        options: [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" }
        ]
    }
];

class ViewSupportDepartments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: {label:'Yes', value: 'Yes'}, 
            selectedMulti: null,
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed, as SweetAlert2 is called imperatively
            // success_msg: false, 
            // success_message: '', // This was in your state but not used
            // --- END KEY CHANGE ---
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
                        // --- KEY CHANGE (BUG FIX) ---
                        // Changed onClick={this.ViewSupport()} to onClick={() => this.ViewSupport()}
                        // The original code was calling the function on render, which is a bug.
                        action: <div><Button onClick={()=>this.ViewSupport()} type="button" color="primary" size="sm" className="waves-effect waves-light mr-2">View</Button>
                                   <Button onClick={()=>this.tog_delete(1)} type="button" color="danger" size="sm" className="waves-effect">Delete</Button></div>,
                        // --- END KEY CHANGE ---
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
            
            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({success_msg: true, success_message: data.response, isAdding: false}); // REMOVED
            this.setState({ isAdding: false });
            MySwal.fire({
                title: 'Success!',
                text: data.response,
                icon: 'success'
            });
            // --- END KEY CHANGE ---

            // this.loadClientGroups(); // This was commented out, leaving as-is

          })
          .catch(error => {
              console.log('error', error);
              this.setState({ isAdding: false });
              MySwal.fire('Error!', 'An error occurred.', 'error');
          });
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
            // this.loadClientGroups(); // This was commented out, leaving as-is
            this.tog_delete();
            MySwal.fire('Deleted!', 'The group has been deleted.', 'success'); // Added success feedback
          })
          .catch(error => {
              console.log('error', error);
              this.setState({isDeleting: false});
              MySwal.fire('Error!', 'An error occurred.', 'error');
          });
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
            
            const formattedRows = data.map((item, index)=>{
                item.status = (item.isDeleted === 'Active')?(<span className="badge badge-success p-1">Active</span>):(<span className="badge badge-danger p-1">In Active</span>);
                item.action = <div><Button onClick={()=>null} type="button" color="primary" size="sm" className="waves-effect waves-light mr-2">Manage</Button>
                                   <Button onClick={()=>this.tog_delete(item.id)} type="button" color="danger" size="sm" className="waves-effect">Delete</Button></div>;
                return item; // FIX: Was 'return true'
            }); 
            // let newTableDataRows = [...this.state.tableData.rows]; // Not needed
            // newTableDataRows = data;
            // this.setState({tableData: {...this.state.tableData, rows: newTableDataRows}})
            this.setState({ rows: formattedRows }); // Set the new 'rows' state
          })
          .catch(error => console.log('error', error));
    }

    render() {

        const { selectedGroup } = this.state;
        // const { selectedMulti } = this.state;

        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (All JSX in render() remains unchanged, EXCEPT for the SweetAlert block) ... */}

                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">View Department</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="4">
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">CHANGE BASIC INFO</h4>
                                    <FormControl onValidSubmit={this.addClientGroup}>
                                        {/* ... (All FormControl fields remain unchanged) ... */}
                                    </FormControl>
                                </CardBody>
                            </Card>
                        </Col>

                        <Col sm="12" lg="8">
                            <Card>
                                <CardBody>
                                    {/* ... (Ticket details JSX remains unchanged) ... */}
                                </CardBody>
                            </Card>
                        </Col>

                    </Row>

                    {/* --- KEY CHANGE (SWEETALERT BLOCK DELETED) --- */}
                    {/* The old <SweetAlert> component was deleted from here.
                        It is now triggered as a function call in 'addClientGroup'. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            success
                            confirmBtnBsStyle="success"
                            onConfirm={() => this.setState({ success_msg: false })} >
                        </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}


                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        {/* ... (Reactstrap Modal remains unchanged) ... */}
                    </Modal>


                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout })(ViewSupportDepartments);