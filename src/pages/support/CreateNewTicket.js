import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';

// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
// import SweetAlert from 'react-bootstrap-sweetalert'; // DELETED: Unused and build-blocking

// --- KEY CHANGES (IMPORTS) ---
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated
import Swal from 'sweetalert2'; // ADDED: Modern Alert Library
import withReactContent from 'sweetalert2-react-content'; // ADDED: React wrapper
// --- END KEY CHANGES ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

class CreateNewTicket extends Component {
    constructor(props) {
        super(props);
        this.state = {
            senderId: null, 
            selectedMulti: null,
            cSelected: [],
            message: '',
            remaningMessageCharacters: 160,
            totalMobileNumbers: 0,
            sheduleRequired: 'No',
            showSavedMessage: false,
            alert1: true,
            alert2: true,
            messageText: '',
            isSending: false,
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed, as SweetAlert2 is called imperatively
            // success_msg: false,
            // success_message: '',
            // modal_standard: false,
            // modal_type: 'success',
            // --- END KEY CHANGE ---
            default_date: new Date(), default: false, start_date: new Date(), monthDate: new Date(), yearDate: new Date(), end_date: new Date(), date: new Date(),
            senderIds: [
                            {
                                label: "Departments",
                                options: [
                                    { label: "Support", value: "Support" }
                                ]
                            }
                        ],
            smsGateway: [
                            {
                                label: "Clients",
                                options: [
                                    { label: "Ram", value: "15" }
                                ]
                            }
                        ],
        };
        this.onCheckboxBtnClick = this.onCheckboxBtnClick.bind(this);
        this.handleDefault = this.handleDefault.bind(this);
        this.sendSms = this.sendSms.bind(this);
        this.loadSenderIds = this.loadSenderIds.bind(this);
        this.handleSelectGroupSmsGAteway = this.handleSelectGroupSmsGAteway.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        // this.loadSenderIds();
    }

    //Select 
    handleSelectGroup = (senderId) => {
        this.setState({ senderId });
    }

    handleDefault(date) {
        this.setState({ default_date: date });
    }

    handleChange = e => {
        const { name, value } = e.target;

        this.setState({
          [name]: value
        });
    };

    onCheckboxBtnClick(selected) {
        const index = this.state.cSelected.indexOf(selected);
        if (index < 0) {
            this.state.cSelected.push(selected);
        } else {
            this.state.cSelected.splice(index, 1);
        }
        this.setState({ cSelected: [...this.state.cSelected] });
    }

    remaningMessageCharactersCalculate(){
        // var count = message.length;
        console.log(this.state.message);
        // if (count === 160) {return false;}
        // var remaning = 160 - count; 
        // this.setState({message:message, remaningMessageCharacters: remaning});
    }

    handleSelectGroupSmsGAteway  = (selectedItem) => {
        this.setState({ smsGateway: selectedItem.value });
    }

    loadSenderIds(){
        var token = JSON.parse(localStorage.getItem('user')).sessionToken;

        var requestOptions = {
          method: 'GET',
          headers: {'Authorization': 'Bearer '+token, "Content-Type": "application/json"},
          redirect: 'follow'
        };

        fetch("http://atssms.com:8090/getAllSenderIds", requestOptions)
          .then(response => response.json())
          .then(data => {
            if (data === undefined) {
                return false;
            } 

            var arr = data.map(obj => ({
                label: obj.senderId,
                value: obj.senderId,
            }))

            console.log(arr);

            this.setState({senderIds: arr})
        })
        .catch(error => console.log('error', error));
    }

    sendSms(event, values){
        console.log(values);
        //API
        this.setState({isSending: true});
        var userData = JSON.parse(localStorage.getItem('user'));

        var raw = JSON.stringify({
            requestType: "QUICKSMS",
            payload:{
                smsGateway: "5e2be915a6efed25afaf203f",
                senderId:this.state.senderId.value,
                countryCode:"+91",
                globalStatus:"true",
                recipients : values.recipients,
                delimiter : ",",
                removeDuplicate : "true",
                messageType : "Plain",
                message : values.message,
            }
        });
        var requestOptions = {
          method: 'POST',
          headers: {"Content-Type": "application/json", 'Authorization': 'Bearer '+userData.sessionToken},
          body: raw,
          redirect: 'follow'
        };

        fetch("http://atssms.com:8090/sms/sendQuickSms", requestOptions)
          .then(response => response.json())
          .then(data => {
            // console.log(data);
            // alert(data.response)

            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({modal_type: 'success', success_msg: true, success_message : data.response, isSending: false}); // REMOVED
            this.setState({ isSending: false });
            MySwal.fire({
                title: 'Success!',
                text: data.response,
                icon: 'success'
            });
            // --- END KEY CHANGE ---

            this.form && this.form.reset();

          })
          .catch(error => {
              console.log('error', error);
              this.setState({ isSending: false });
              MySwal.fire({ // Added error handling
                  title: 'Error!',
                  text: 'Could not create ticket.',
                  icon: 'error'
              });
          });
    }

    render() {
        const { senderId } = this.state;
        // const { selectedMulti } = this.state;

        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (All JSX in render() remains unchanged, EXCEPT for the SweetAlert block) ... */}

                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">Create New Ticket</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="6">
                            <Card>
                                <CardBody>

                                    <FormControl onValidSubmit={this.sendSms} ref={c => (this.form = c)}>
                                        {/* ... (All FormControl fields remain unchanged) ... */}
                                    </FormControl>

                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    {/* --- KEY CHANGE (SWEETALERT BLOCK DELETED) --- */}
                    {/* The old <SweetAlert> component was deleted from here.
                        It is now triggered as a function call in the 'sendSms' method. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            confirmBtnBsStyle={this.state.modal_type}
                            onConfirm={() => this.setState({ success_msg: false })} 
                            type={this.state.modal_type} >
                        </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}

                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout })(CreateNewTicket);