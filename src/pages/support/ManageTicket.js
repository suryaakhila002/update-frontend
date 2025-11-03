import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select';
// import { withRouter } from 'react-router-dom';
import { FormControl } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';

// --- KEY CHANGES (IMPORTS) ---
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated
import Swal from 'sweetalert2'; // ADDED: Modern Alert Library
import withReactContent from 'sweetalert2-react-content'; // ADDED: React wrapper
// --- END KEY CHANGES ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

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
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed, as SweetAlert2 is called imperatively
            // success_msg: false,
            // --- END KEY CHANGE ---
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
                    // ... (rest of columns)
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
        // ... (deleteGroup method remains unchanged)
    }

    loadClientGroups(){
        // ... (loadClientGroups method remains unchanged)
    }

    render() {

        const { selectedGroup, selectedGroup1 } = this.state;
        // const { selectedMulti } = this.state;

        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (All JSX in render() remains unchanged, EXCEPT for the SweetAlert block) ... */}

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
                        It is now triggered as a function call in the 'addClientGroup' method. */}
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

export default connect(null, { activateAuthLayout })(ManageTicket);