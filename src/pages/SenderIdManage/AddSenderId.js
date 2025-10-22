import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Label } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Select from 'react-select';
import {getLoggedInUser} from '../../helpers/authUtils';
// import Countries from '../../utils/Countries';
import SweetAlert from 'react-bootstrap-sweetalert';
// import Dropzone from 'react-dropzone';
import {ServerApi} from '../../utils/ServerApi';


import {Button} from '@material-ui/core';

const SENDER_ID_TYPE = [
            { label: "Select Sender Id Type", value: "0", isOptionSelected: true },
            { label: "Other", value: "OTHER" },
            { label: "Promotinal", value: "PROMOTINAL" },
        ];


const CATEGORY = [
    { label: "--Select Category--", value: "0"},
    { label: "Banking/Insurance/Financial products/ credit cards", value: "1" },
    { label: "Real Estate", value: "2" },
    { label: "Education", value: "3" },
    { label: "Health", value: "4" },
    { label: "Consumer goods and automobiles", value: "5" },
    { label: "Communication/Broadcasting/Entertainment/IT", value: "6" },
    { label: "Tourism and Leisure", value: "7" },
    { label: "Food and Beverages", value: "8" },
    { label: "Others", value: "9" },
    { label: "Fixed", value: "0" },
];


class AddSenderId extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAdding: false,
            success_msg: false,
            success_message: '',
            modalType:'success',
            modal_standard: false,
            sender_id_type: '0',
            category: { label: "--Select Category--", value: "0"},
            senderID: '',
            selectedFile: null,
        };

        this.addSenderId = this.addSenderId.bind(this);
        this.validateSenderID = this.validateSenderID.bind(this);
    }

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
                // setTimeout(()=>{this.props.history.push('/senderIdManage')},800);
            } else {
                this.props.openSnack({type: 'error', message: 'Unable to add Sender Id.'})
                this.setState({isAdding: false});
            }
            
        })
        .catch(error => {
            console.log(error);
            // this.setState({success_type: 'error', success_msg: true, success_message:'Unable to add Sender Id.', isAdding: false});
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
        const defaultValues = { isResellerPanel: {label: 'Yes', value:'Yes'}, isClientNotify: 1, isApiAccess: 'Yes' };

        return (
            <React.Fragment>
                <Container fluid>
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

                                    <AvForm onValidSubmit={this.addSenderId} mode={defaultValues} ref={c => (this.form = c)}>
                                        <Row className="align-items-center">

                                            <Col sm="2" className="mt-1">
                                                <Label>Sender Id Type</Label>
                                                <Select
                                                    className="field-required"
                                                    onChange={(i)=>this.setState({ sender_id_type: i.value, senderID: '' })}
                                                    options={SENDER_ID_TYPE}
                                                />
                                            </Col>

                                            <Col sm="3" className="mt-1">
                                                <Label>Category</Label>
                                                <Select
                                                     className="field-required"
                                                    onChange={(i)=>this.setState({category: i})}
                                                    options={CATEGORY}
                                                />
                                            </Col>

                                            {this.state.sender_id_type === 'PROMOTINAL' && (
                                                <Col sm="1">
                                                    <AvField name="prefix"
                                                        label="Prefix" 
                                                        className="mt-2"
                                                        placeholder="" 
                                                        disabled={true}
                                                        value={this.state.category.value}
                                                        type="text" errorMessage=""
                                                        validate={{ required: { value: false } }} />
                                                </Col>
                                            )}

                                            <Col sm={(this.state.sender_id_type === 'PROMOTINAL')?'3':'4'}>
                                                <label>Sender Id Name</label>
                                                <input name="name" 
                                                    className="form-control uppercase mt-2"
                                                    maxLength="6"
                                                    disabled={(this.state.sender_id_type==='0' || this.state.category==='0')?true:false}
                                                    minLength="6"
                                                    required="required"
                                                    value={this.state.senderID}
                                                    onChange={e=>this.validateSenderID(e)} />
                                            </Col>

                                            <Col sm="3">
                                                <AvField name="document"
                                                    label="Document" 
                                                    className="form-control mt-2"
                                                    placeholder="" 
                                                    type="file" 
                                                    onChange={e=>this.setState({ selectedFile: e.target.files[0] })}
                                                    validate={{ required: { value: false } }} />
                                            </Col>

                                        </Row>

                                        
                                        <div className="mb-0 mt-3">
                                            <div className="float-right">

                                                <Button 
                                                    type="submit"
                                                    size="small" 
                                                    variant="contained" 
                                                    disabled={(this.state.isAdding)?true:false}
                                                    color="primary" 
                                                    >
                                                     {(this.state.isAdding)?'Please Wait...':'Add'}
                                                </Button>
                                                
                                            </div>
                                        </div>

                                    </AvForm>

                                </CardBody>

                                

                            </Card>
                        </Col>

                        <Col lg="12">

                            <Card>
                                <CardBody>

                                <div >
                                    <p  class="text-info" >Instructions:</p>
                                    <ul  class="reglist">
                                        <li ><span  class="lstSpan">P – Promotional</span> - Messages which are purely promotional in nature send to all the prospects in the database by an Entity basis on their preferences. Ex: All kind of Promotional messages.</li>
                                        <li ><span  class="lstSpan">O – Others</span>- Includes <b >Transactional</b>, <b >Service Implicit</b> and <b >Service Explicit messages</b>
                                            <br  /> (<b >Transactional</b> - Essential messages related to transaction. Ex: OTP.
                                            <br  /><b >Service Implicit</b> - Service messages that are ought to be sent basis on the business relation with the customer. Ex: Service Alert Messages
                                            <br  /><b >Service Explicit</b> - Service messages that are send by the Entity which are promotional in nature but send with prior consent. Ex: New offers) </li>
                                    </ul>
                                    <div  class="mt-3">
                                        <p  class="text-info" >Note : <span  class="text-dark small font-weight-bold">Special Character and Space not allowed in Header Name.</span></p>
                                    </div>
                                    <div  class="table-responsive mt-3">
                                        <table  class="table text-center table-bordered">
                                            <tbody >
                                                <tr >
                                                    <th  class="fb-Inst">Header Type</th>
                                                    <th  class="fb-Inst">Entity Type</th>
                                                    <th  class="fb-Inst">Type</th>
                                                    <th  class="fb-Inst"></th>
                                                    <th  class="fb-Inst">Validations</th>
                                                </tr>
                                                <tr >
                                                    <td >Promotional (P)</td>
                                                    <td >Govt/Non Govt</td>
                                                    <td >
                                                        <div  class="row mr-0 ml-0 ">
                                                            <div  class="col-md-12 p-2 w-100 border"> Numeric </div>
                                                            <div  class="col-md-12 w-100 border p-2"> Alphabetic </div>
                                                            <div  class="col-md-12 w-100 border p-2"> Alphanumeric </div>
                                                        </div>
                                                    </td>
                                                    <td >
                                                        <div  class="row mr-0 ml-0">
                                                            <div  class="col-md-12 w-100 border bg-success text-white p-2"> Allowed </div>
                                                            <div  class="col-md-12 w-100 border bg-danger text-white p-2"> Not Allowed </div>
                                                            <div  class="col-md-12 w-100 border bg-danger text-white p-2"> Not Allowed </div>
                                                        </div>
                                                    </td>
                                                    <td >Allowed Header name must be of 6 digits, including auto generated prefix</td>
                                                </tr>
                                                <tr >
                                                    <td  class="border-bottom-0">Others (O)</td>
                                                    <td >
                                                        <tbody >
                                                            <tr  class="tBorderNone ">
                                                                <td >Govt.</td>
                                                            </tr>
                                                        </tbody>
                                                    </td>
                                                    <td >
                                                        <div  class="row mr-0 ml-0">
                                                            <div  class="col-md-12 w-100 border" > Numeric (3-8 character) </div>
                                                            <div  class="col-md-12 w-100 border"> Alphabetic (3-6 character) </div>
                                                            <div  class="col-md-12 w-100 border p-1"> Alphanumeric </div>
                                                        </div>
                                                    </td>
                                                    <td >
                                                        <div  class="row mr-0 ml-0">
                                                            <div  class="col-md-12 w-100 border bg-success text-white p-2" > Allowed </div>
                                                            <div  class="col-md-12 w-100 border bg-success text-white p-2"> Allowed </div>
                                                            <div  class="col-md-12 w-100 border bg-danger text-white p-2"> Not Allowed </div>
                                                        </div>
                                                    </td>
                                                    <td >
                                                        <div  class="row mr-0 ml-0">
                                                            <div  class="col-md-12 w-100 border mt-4"> Header name must be between 3-8 digits, including auto generated prefix, length should not be = 6 </div>
                                                            <div  class="col-md-12 w-100 border"> Header name must be between 3-6 alphabets </div>
                                                            <div  class="col-md-12 w-100 border p-3"></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr >
                                                    <td  class="border-top-0">Others (O)</td>
                                                    <td >
                                                        <tbody >
                                                            <tr  class="tBorderNone">
                                                                <td >Non-Govt.</td>
                                                            </tr>
                                                        </tbody>
                                                    </td>
                                                    <td >
                                                        <div  class="row mr-0 ml-0">
                                                            <div  class="col-md-12 w-100 border p-1"> Numeric </div>
                                                            <div  class="col-md-12 w-100 border" > Alphabetic (3-6 character) </div>
                                                            <div  class="col-md-12 w-100 border p-1"> Alphanumeric </div>
                                                        </div>
                                                    </td>
                                                    <td >
                                                        <div  class="row mr-0 ml-0">
                                                            <div  class="col-md-12 w-100 border bg-danger text-white p-2"> Not Allowed </div>
                                                            <div  class="col-md-12 w-100 border bg-success text-white p-2"> Allowed </div>
                                                            <div  class="col-md-12 w-100 border bg-danger text-white p-2"> Not Allowed </div>
                                                        </div>
                                                    </td>
                                                    <td >
                                                        <div  class="row mr-0 ml-0">
                                                            <div  class="col-md-12 w-100 border  p-3"></div>
                                                            <div  class="col-md-12 w-100 border"> Header name must be between 3-6 alphabets </div>
                                                            <div  class="col-md-12 w-100 border p-3"></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                </CardBody>
                            </Card>
                        </Col>


                    </Row>

                    {this.state.success_msg &&
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
                    }

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, openSnack })(AddSenderId));