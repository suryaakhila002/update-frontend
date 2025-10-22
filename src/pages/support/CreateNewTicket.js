import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import SweetAlert from 'react-bootstrap-sweetalert';

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
            success_msg: false,
            success_message: '',
            modal_standard: false,
            modal_type: 'success',
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
            this.setState({modal_type: 'success', success_msg: true, success_message : data.response, isSending: false});

            this.form && this.form.reset();

          })
          .catch(error => console.log('error', error));
    }

    render() {
        const { senderId } = this.state;
        // const { selectedMulti } = this.state;

        return (
            <React.Fragment>
                <Container fluid>
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

                                    <AvForm onValidSubmit={this.sendSms} ref={c => (this.form = c)}>
                                        <Label>Ticket For Client</Label>
                                            <Select
                                                className="mb-3"
                                                label="Ticket For Client"
                                                name="smsGateway"
                                                onChange={this.handleSelectGroupSmsGAteway}
                                                options={this.state.smsGateway}
                                                validate={{ required: { value: true } }} 
                                                required
                                            />

                                        <FormGroup >
                                        <AvField placeholder="" 
                                            label ="SUBJECT"
                                            name="subject"
                                            type="text" rows={3} errorMessage="Enter Subject"
                                            validate={{ required: { value: true } }} 
                                            onFocus={ () => this.setState({showSavedMessage: false}) }
                                            style={{marginBottom: 0}} />
                                        </FormGroup>


                                        <FormGroup className="mb-3" >
                                        <AvField name="message" label="MESSAGE"
                                            rows={4} type="textarea" 
                                            className="mb-0" 
                                            value={this.state.messageText}
                                            onChange={ (e) => this.setState({messageText: e.target.value}) } 
                                            validate={{ required: { value: true } }} />
                                        </FormGroup>

                                        <Label>Department</Label>
                                            <Select
                                                className="mb-3"
                                                label="Department"
                                                name="senderId"
                                                value={senderId}
                                                onChange={this.handleSelectGroup}
                                                options={this.state.senderIds}
                                                validate={{ required: { value: true } }} 
                                                required
                                            />

                                        {this.state.sheduleRequired === 'Yes' && 
                                            <FormGroup >
                                            <DatePicker
                                                className="form-control"
                                                selected={this.state.default_date}
                                                onChange={this.handleDefault}
                                                showTimeSelect
                                                dateFormat="Pp"
                                            />
                                            </FormGroup >
                                        }

                                        


                                        <FormGroup className="mt-3 mb-0">
                                            <div>
                                                <Button size="sm" type="submit" color="primary" className="mr-1">
                                                    <i className="fa fa-plus mr-2"></i> {(this.state.isSending)?'Please Wait...':' Create Ticket'}
                                                </Button>

                                            </div>
                                        </FormGroup>

                                    </AvForm>

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

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(CreateNewTicket));