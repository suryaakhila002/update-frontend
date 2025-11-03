import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Label } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';

// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Select from 'react-select';
import {getLoggedInUser} from '../../helpers/authUtils';
// import Countries from '../../utils/Countries';
// import SweetAlert from 'react-bootstrap-sweetalert'; // DELETED: Unused and build-blocking
// import Dropzone from 'react-dropzone';
import {ServerApi} from '../../utils/ServerApi';


import {Button} from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // This was in your previous file, keeping it.

// ... (All constants like SENDER_ID_TYPE, CATEGORY, etc. remain unchanged)
const SENDER_ID_TYPE = [
            { label: "Select Sender Id Type", value: "0", isOptionSelected: true },
            { label: "Other", value: "OTHER" },
            { label: "Promotinal", value: "PROMOTINAL" },
        ];
const CATEGORY = [
    { label: "--Select Category--", value: "0"},
    { label: "Banking/Insurance/Financial products/ credit cards", value: "1" },
    // ...
    { label: "Fixed", value: "0" },
];


class AddSenderId extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAdding: false,
            // --- KEY CHANGE (STATE) ---
            // These state properties were unused
            // success_msg: false,
            // success_message: '',
            // modalType:'success',
            // modal_standard: false,
            // --- END KEY CHANGE ---
            sender_id_type: '0',
            category: { label: "--Select Category--", value: "0"},
            senderID: '',
            selectedFile: null,
        };

        this.addSenderId = this.addSenderId.bind(this);
        this.validateSenderID = this.validateSenderID.bind(this);
    }

    // ... (All component methods like componentDidMount, validateSenderID, addSenderId, etc., remain unchanged) ...

    componentDidMount() {
        this.props.activateAuthLayout();
    }

    validateSenderID(e){
        let val = e.target.value;

        if(this.state.sender_id_type==='PROMOTINAL'){
            var regex1 = /^(\s*|\d+)$/;
            if(regex1.test(val)){
                this.setState({senderID: val})
            }
        }else{
            var regex2 = /^[a-zA-Z]*$/;
            if(regex2.test(val)){
                this.setState({senderID: val.toUpperCase()})
            }
        }
    }


    addSenderId(event, values){
        var raw = {
            creatorId: getLoggedInUser().id,
            senderId: this.state.senderID,
            type: this.state.sender_id_type,
            category: this.state.category.label
        };
        console.log(raw);

        if (this.state.senderID === '' || this.state.sender_id_type==='0' || this.state.category.value==='0') {
            this.props.openSnack({type: 'error', message: 'Please fill all required fields'})
            return false;
        }
        if(this.state.senderID.length < 6){
            this.props.openSnack({type: 'error', message: 'Sender ID must be of length 6'})
            return false;
        }

        this.setState({isAdding: true});
        
        ServerApi().post('addSenderId', raw)
          .then(res => {
            if (res.data.status === true) {
                if(res.data.response === 'SenderId already exists'){
                    this.props.openSnack({type: 'error', message: 'SenderId already exists.'})
                    setTimeout(()=>{this.props.history.push('/senderIdManage')},800);
                    return;
                }
                if(this.state.selectedFile!==null){
                    this.uploadDocument(res.data.response.id);
                    return;
                }
                this.props.openSnack({type: 'success', message: 'Sender Id Added.'})
                this.setState({isAdding: false});
            } else {
                this.props.openSnack({type: 'error', message: 'Unable to add Sender Id.'})
                this.setState({isAdding: false});
            }
        })
        .catch(error => {
            console.log(error);
          });
    }

    uploadDocument(id){
        let formData = new FormData();
        formData.append( 
            "document", 
            this.state.selectedFile, 
            this.state.selectedFile.name 
        ); 

        ServerApi().post(`/senderId/uploadDocument/${id}`, formData)
          .then(res => {
            if (res.data.status === true) {
                this.props.openSnack({type: 'success', message: 'Sender Id Added.'})
                this.setState({isAdding: false});
                setTimeout(()=>{this.props.history.push('/senderIdManage')},800);
            } else {
                this.props.openSnack({type: 'success', message: 'Unable to add Sender Id.'})
                this.setState({isAdding: false});
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
    

    render() {
        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (All JSX in render() remains unchanged, EXCEPT for the SweetAlert block) ... */}

                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">Add New Sender Id</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    <FormControl onValidSubmit={this.addSenderId} mode={defaultValues} ref={c => (this.form = c)}>
                                        {/* ... (All FormControl fields remain unchanged) ... */}
                                    </FormControl>
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    {/* ... (Instructions Table remains unchanged) ... */}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    {/* --- KEY CHANGE (SWEETALERT BLOCK DELETED) --- */}
                    {/* The old <SweetAlert> component was deleted from here.
                        It was unused, and the import was blocking the build. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            type={this.state.modalType}
                            confirmBtnBsStyle={this.state.modalType}
                            onCancel={()=>this.setState({success_msg:false})}
                            showCloseButton={(this.state.modalType === 'success')?false:true}
                            showConfirm={(this.state.modalType === 'success')?true:false}
                            onConfirm={() => this.props.history.push('/senderIdManage')} >
                        </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}

                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout, openSnack })(AddSenderId);