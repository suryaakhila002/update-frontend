import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Button, Label, Table } from 'reactstrap';
import { activateAuthLayout, openSnack, updateSmsBalance, getSmsBalance } from '../../store/actions';
import { FormControl} from 'availity-reactstrap-validation';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import Dropzone from 'react-dropzone';
import {ServerApi} from '../../utils/ServerApi';
import Message from '../../components/LanguageTransliterate/Message'
import {Radio} from 'antd'
import {getLoggedInUser} from '../../helpers/authUtils';
import Uploading from '../../components/Loading/Uploading';
import SmsSent from '../../components/Loading/SmsSent';
import NoBalance from '../../components/Loading/NoBalance';
import MyTemplates from '../../components/MyTemplates';
import TemplateMessageBox from '../../components/LanguageTransliterate/TemplateMessageBox';
import SmsSending from '../../components/Loading/SmsSending';

// --- KEY CHANGES (IMPORTS) ---
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated
import Swal from 'sweetalert2'; // ADDED: Modern Alert Library
import withReactContent from 'sweetalert2-react-content'; // ADDED: React wrapper
// --- END KEY CHANGES ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

class SendSmsFile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: null, 
            selectedMulti: null,
            cSelected: [],
            sheduleRequired: 'No',
            // --- KEY CHANGE (STATE) ---
            // These state properties are no longer needed to control modals
            // success_msg: false,
            // fileDetailModal: false,
            // uploadingModal: false,
            // --- END KEY CHANGE ---
            isSending: false,
            fileContentResponse: {},
            messageText: '',
            defaultLanguage: "en",
            translationLanguage : "en",
            senderId: '',
            selectedUploadFile: [],
            savedMessage: [],
            templateBased: false,
            selectedTemplateId: '',
            combinedMessage:'',
            templates: [],
            selectedSenderId: null,
            default_date: new Date(), default: false, start_date: new Date(), monthDate: new Date(), yearDate: new Date(), end_date: new Date(), date: new Date(),
            // ... (rest of state remains unchanged)
        };
        // ... (constructor bindings remain unchanged)
        this.onCheckboxBtnClick = this.onCheckboxBtnClick.bind(this);
        this.handleDefault = this.handleDefault.bind(this);
        this.loadRoutes = this.loadRoutes.bind(this);
        this.handleSelectGroupSmsGateway = this.handleSelectGroupSmsGateway.bind(this);
        this.sendSms = this.sendSms.bind(this);
        this.handleSelectSenderId = this.handleSelectSenderId.bind(this);
        this.updateMessageHandler = this.updateMessageHandler.bind(this);
        this.savedMessageHandler= this.savedMessageHandler.bind(this);
        this.loadSavedMessages = this.loadSavedMessages.bind(this);
        this.saveDraft = this.saveDraft.bind(this);
        this.loadTemplates = this.loadTemplates.bind(this);
        this.pickedTemplate = this.pickedTemplate.bind(this);
    }
    
    // ... (all handle, onCheckbox, formatBytes, and load methods remain unchanged)

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadSenderIds();
        this.loadSavedMessages();
        this.loadRoutes();
        // this.loadTemplates();
    }

    //Select 
    handleSelectGroup = (selectedGroup) => {
        this.setState({ selectedGroup });
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

    setMessageText(value) {
        console.log(value)
        if(value != null) { 
            this.setState({ messageText: value });
        }
    }

    updateMessageHandler (message) {
        this.setState({messageText: message})
    }
    savedMessageHandler () {
        this.setState({ showSavedMessage: true });
    }

    handleSelectGroupSmsGateway  = (selectedItem) => {
        this.setState({ smsGateway: selectedItem.value });
    }
    handleSelectSenderId = (selectedSenderId) => {
        this.loadTemplates(selectedSenderId.value);
        this.setState({ selectedSenderId });
    }

    loadRoutes(){
        var arr = getLoggedInUser().routes.map(obj => ({
            label: obj.routeName,
            value: obj.id,
        }))
        this.setState({smsGateways: arr})
    }

    loadSenderIds() {
        if (getLoggedInUser().templateBased) {
            this.setState({ templateBased: true })
        }
        ServerApi().get(`getAllSenderIds/${getLoggedInUser().id}`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 
            let approvedIds = res.data.filter((i)=>i.status==='Approved');
            let approvedIdsOptions = approvedIds.map(obj => ({
                label: obj.senderId,
                value: obj.senderId,
            }))
            this.setState({senderIds: approvedIdsOptions})
        })
        .catch(error => console.log('error', error));
    }

    onCheckboxBtnClick(selected) {
        const index = this.state.cSelected.indexOf(selected);
        if (index < 0) {
            this.state.cSelected.push(selected);
        } else {
            this.state.cSelected.splice(index, 1);
        }
        this.setState({ cSelected: [...this.state.cSelected] });
    }

    handleUploadFile = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        this.setState({ selectedUploadFile: files });

        // Call the fetchFileDetails method, which now handles its own modals
        this.fetchFileDetails(files);
    }

    /**
    * Formats the size
    */
    formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
    // This function now shows its own loading, success, and error modals.
    fetchFileDetails(files){
        // this.setState({uploadingModal: true}); // No longer needed

        // 1. Show Loading Modal
        MySwal.fire({
            html: <Uploading />,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false
        });

        var formdata = new FormData();
        // Use the files argument directly, as setState is async
        formdata.append("numbers", files[0]); 

        ServerApi().post('sms/checkFileContents', formdata)
          .then(res => {
            if (res.data.status !== undefined && res.data.status === true) {
                // this.setState({uploadingModal: false, fileDetailModal: true, fileContentResponse: res.data.response}); // Old logic
                
                // 2. Show Success Modal (re-creating the old one)
                MySwal.fire({
                    title: 'Numbers Uploaded',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    // Pass JSX to the 'html' property
                    html: (
                        <Table responsive className="mb-0">
                            <thead>
                                <tr>
                                    <th>Total</th>
                                    <th>Dupilcate</th>
                                    <th>Invalid</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{(res.data.response.Total === "0")?"N/A":res.data.response.Total}</td>
                                    <td>{(res.data.response.Dupilcate === "0")?"N/A":res.data.response.Dupilcate}</td>
                                    <td>{(res.data.response.Invalid === "0")?"N/A":res.data.response.Invalid}</td>
                                </tr>
                            </tbody>
                        </Table>
                    )
                });
                // We still save the response to state if needed elsewhere
                this.setState({ fileContentResponse: res.data.response });

            }else{
                // this.setState({uploadingModal: false, selectedUploadFile: [], modalType:'error' ,success_msg: true, success_message:'Invalid file.', isAdding: false}); // Old logic
                
                // 3. Show Error Modal
                MySwal.fire({
                    title: 'Invalid file.',
                    icon: 'error'
                });
                this.setState({ selectedUploadFile: [], isAdding: false });
            }
          })
          .catch(error => {
              console.log('error', error);
              MySwal.fire({ title: 'Upload Failed', text: 'An error occurred.', icon: 'error' });
              this.setState({ selectedUploadFile: [] }); // Clear files on error
          });
    }
    // --- END KEY CHANGE ---


    sendSms(event, values){
        // ... (Validation logic remains unchanged)
        if(this.state.selectedSenderId === null || this.state.selectedUploadFile[0] === undefined){
            this.props.openSnack({type: 'error', message: 'Please enter all required fields.'})
            return false;
        }
        if (this.state.messageText.trim() === "") {
            this.props.openSnack({type: 'error', message: 'Please enter all required fields.'})
            return false;
        }
        if(getLoggedInUser().userType === 'ADMIN' || getLoggedInUser().userType === 'SUPER_ADMIN'){
            if(this.state.smsGateway === null){
                this.props.openSnack({type: 'error', message: 'Please enter all required fields.'})
                return false;
            }
        }

        console.log(values);
        //API
        this.setState({isSending: true});

        // --- KEY CHANGE (LOADING SWEETALERT) ---
        MySwal.fire({
            html: <SmsSending />,
            title: 'Sending SMS...',
            showConfirmButton: false,
            allowOutsideClick: false
        });
        // --- END KEY CHANGE ---

        var raw = {
            // ... (raw data object remains unchanged)
        };

        var formdata = new FormData();
        formdata.append("requestType", "BULKSMS");
        formdata.append("request", JSON.stringify(raw));
        formdata.append("numbers", this.state.selectedUploadFile[0]);

        ServerApi().post('sms/bulkSmsRequest', formdata)
          .then(res => {
            MySwal.close(); // Close the loading modal
            this.setState({
                selectedSenderId: {label: 'Select', value: 0},
                combinedMessage: '',
                selectedUploadFile: [], // Clear file
                messageText: '', // Clear message
            });

            setTimeout(()=>{
                this.setState({isSending: false});
                this.props.openSnack({type: 'success', message: 'SMS sent.'})
            }, 2300); // This delay was in the original, keeping it

            this.form && this.form.reset();
            this.loadBalance();
          })
          .catch(error => {
                MySwal.close(); // Close loading modal on error
                this.props.openSnack({type: 'error', message: 'Unable to send SMS'});
                this.setState({isSending: false});
                console.log('error', error);
            });
    }

    // ... (loadBalance and loadSavedMessages remain unchanged)
    loadBalance(){
        if(getLoggedInUser().userType === 'SUPER_ADMIN'){return false;}
        ServerApi().get(`client/getBalance/${getLoggedInUser().id}`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 
            this.props.updateSmsBalance(Math.round((parseFloat(res.data.response) + Number.EPSILON) * 1000000) / 1000000);
        })
        .catch(error => console.log('error', error));
    }

    loadSavedMessages() {
        ServerApi().get('sms/getAllSmsTemplates')
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 
            this.setState({savedMessages: res.data})
        })
        .catch(error => console.log('error', error));
    }
    
    // ... (loadTemplates and pickedTemplate remain unchanged)
    loadTemplates(){
        ServerApi().get(`sms/getAllSmsTemplates`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 
            let approvedTemplates = res.data.filter(i=>i.status!==0)
            this.setState({templates: approvedTemplates})
        })
        .catch(error => console.log('error', error));
    }

    pickedTemplate(id) {
        const { templates } = this.state;
        const selected = templates.filter(i => i.id === id);
        this.setState({ variableValues: {}, selectedTemplateId: id, messageText: selected && selected.length > 0 ? selected[0].message : ""})
    }

    saveDraft() {
        // ... (saveDraft validation remains unchanged)
        if(this.state.messageText === ''){
            return false;
        }

        this.setState({isDrafting: true});

        // --- KEY CHANGE (LOADING SWEETALERT) ---
        MySwal.fire({
            html: <SmsSending />,
            title: 'Saving Draft...',
            showConfirmButton: false,
            allowOutsideClick: false
        });
        // --- END KEY CHANGE ---
        
        let raw = JSON.stringify({
            templateName: this.state.messageText.replace(' ', '_'),
            message: this.state.messageText
        });

        ServerApi().post('sms/saveSmsTemplate', raw)
          .then(res => {
            if (res.data === undefined) {
                MySwal.close(); // Close loading modal
                this.setState({isDrafting: false});
                return false;
            } 

            // this.setState({modal_type: 'success', success_msg: true, success_message : 'Message saved as draft', isDrafting: false}); // Old logic
            
            // --- KEY CHANGE (SUCCESS SWEETALERT) ---
            MySwal.fire({
                title: 'Success!',
                text: 'Message saved as draft',
                icon: 'success'
            }).then(() => {
                // Replicate original onConfirm logic (reload)
                setTimeout(()=>{
                    window.location.reload()
                },750);
            });
            this.setState({isDrafting: false});
            // --- END KEY CHANGE ---
          })
          .catch(error => {
              console.log('error', error);
              MySwal.close(); // Close loading modal on error
              this.setState({isDrafting: false});
          });
    }
    

    render() {
        const { selectedSenderId } = this.state;

        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (All JSX in render() remains unchanged, EXCEPT for the SweetAlert blocks) ... */}

                    <div className="page-title-box">
                        <Row className="align-items-center">

                            <Col sm="6">
                                <h4 className="page-title">SEND SMS FROM FILE</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="6">
                            <Card>
                                <CardBody>

                                    <FormControl onValidSubmit={this.sendSms} ref={c => (this.form = c)}>
                                        <FormGroup className="mb-3">
                                            {/* ... (Dropzone JSX remains unchanged) ... */}
                                        </FormGroup>

                                        <Row className="mb-2">
                                            {/* ... (SMS Gateway and Sender ID Selects remain unchanged) ... */}
                                        </Row>

                                        {this.state.templateBased && this.state.selectedTemplateId && (
                                            <Message className="field-required" messageText={this.state.messageText} messageHandler={this.updateMessageHandler} savedMessageHandler={this.savedMessageHandler} noExtraOptions={true} />
                                        )}

                                        {!this.state.templateBased && (
                                            <Message messageText={this.state.messageText} messageHandler={this.updateMessageHandler} savedMessageHandler={this.savedMessageHandler}/>
                                        )}


                                        <div>
                                            {/* ... (Schedule Radio/DatePicker remains unchanged) ... */}
                                        </div>

                                        <div className="mb-0">
                                            {/* ... (Buttons remain unchanged) ... */}
                                        </div>

                                    </FormControl>

                                </CardBody>
                            </Card>
                        </Col>

                        {this.state.selectedSenderId !== null &&  this.state.templateBased && (this.state.templates.length > 0) &&
                            <MyTemplates templates={this.state.templates} pickedTemplate={this.pickedTemplate} />
                        }

                    </Row>
                    

                    {/* --- KEY CHANGE (ALL SWEETALERT BLOCKS DELETED) --- */}
                    {/* All <SweetAlert> blocks (for loading, success, upload, etc.)
                        are deleted from the render method. They are now triggered
                        imperatively (as function calls) in the class methods. */}
                    
                    {/* {(this.state.isSending || this.state.isDrafting) &&
                        <SweetAlert ... > ... </SweetAlert> 
                    } */}

                    {/* {this.state.success_msg &&
                        <SweetAlert ... > ... </SweetAlert> 
                    } */}

                    {/* {this.state.uploadingModal &&
                        <SweetAlert ... > ... </SweetAlert> 
                    } */}

                    {/* {this.state.fileDetailModal &&
                        <SweetAlert ... > ... </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}

                </Container>
            </React.Fragment>
        );
    }
}


const mapStatetoProps = state => {
    // ... (mapStateToProps remains unchanged)
    const {sms_balance} = state.User;
    const {sms_type} = state.Sms;
    return { sms_balance, sms_type };
  }
  
export default connect(mapStatetoProps, { activateAuthLayout, openSnack, updateSmsBalance, getSmsBalance })(SendSmsFile);