import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Nav, NavItem, NavLink, TabContent, TabPane, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout, updateSmsBalance, openSnack } from '../../store/actions';
import Select from 'react-select';
import { Link, withRouter } from 'react-router-dom';
import { AvForm, AvField, AvGroup } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
// import { MDBDataTable } from 'mdbreact';
import classnames from 'classnames';
import Dropzone from 'react-dropzone';
// import Countries from '../../utils/Countries';
import defaultProfileImage from '../../images/users/default_profile.jpg';
import SweetAlert from 'react-bootstrap-sweetalert';
import {ServerApi} from '../../utils/ServerApi';
// import { Tag } from 'antd';
import DataLoading from '../../components/Loading/DataLoading';
// import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';
import {print_state, print_city} from '../../utils/StateCity';
import {getLoggedInUser, setLoggeedInUser} from '../../helpers/authUtils';
import MaskInput from 'react-maskinput';

const COMPANY_TYPES = [
    { label: "Private Ltd Company", value: "Private Ltd Company", isOptionSelected: true },
    { label: "Public Ltd Company", value: "Public Ltd Company" },
    { label: "Unlimited Company", value: "Unlimited Company" },
    { label: "Sole proprietorship", value: "Sole proprietorship" },
    { label: "Joint Hindu Family business ", value: "Joint Hindu Family business " },
    { label: "Partnership Cooperatives ", value: "Partnership Cooperatives " },
    { label: "Limited Liability Partnership(LLP) ", value: "Limited Liability Partnership(LLP) " },
    { label: "Liaison Office ", value: "Liaison Office " },
    { label: "Branch Office ", value: "Branch Office " },
    { label: "Project Office ", value: "Project Office " },
    { label: "Subsidiary Company", value: "Subsidiary Company" },
];


class MyProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab_border1: '13',
            clientDetails: {},
            address : '',
            country : 'India',
            isLoading: true,
            success_msg: false,
            success_message: '',
            modal_delete: false,
            modal_send_sms: false,
            modal_change_image: false,
            isAdding: false,
            isDisabled: true,
            selectedFilesDocument: [],
            selectedState: '',
            selectedCity: '',
            selectedStateIndex: 29,
            default_date: new Date(), default: false, start_date: new Date(), monthDate: new Date(), yearDate: new Date(), end_date: new Date(), date: new Date(),
            selectedCompanyType: '',
            templateBased: true,
            gstNo: '',

        };

        this.updateClient = this.updateClient.bind(this);

        this.tog_update_image = this.tog_update_image.bind(this);
        this.modal_update_image = this.modal_update_image.bind(this);

        this.handleAcceptedFilesDocument = this.handleAcceptedFilesDocument.bind(this);
        this.changeAvatar = this.changeAvatar.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        
        this.loadClientDetails();

    }
    

    tog_update_image() {
        this.setState(prevState => ({
            modal_change_image: !prevState.modal_change_image
        }));
        this.removeBodyCss();
    }    

    removeBodyCss() {
        document.body.classList.add('no_padding');
    }

    modal_update_image(){
        return true;
    }

    loadClientDetails(){
        this.setState({isLoading: true})
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(`getClientDetails/${getLoggedInUser().id}`)
        .then(res => {
        console.log(res.data)
        if (res.data === undefined) {
            return false;
        }

        this.setState({clientDetails: res.data, 
            smsType: res.data.smsType, 
            consumptionType: res.data.billingType,
            creditType: res.data.creditType,
            smsGatewaysSelected: res.data.routes, 
            smsGatewayModal: res.data.routes, 
            hasDropingAccess: (res.data.applyDropping)?"Yes":"No",
            hasDNDApplicable: (res.data.applyDndReturn)?"Yes":"No",
            templateBased: (res.data.templateBased)?{label: 'Yes', value:true}:{label: 'No', value: false},
            gstNo: res.data.gstNo,
            isLoading: false})
        })
        .catch(error => console.log('error', error));
    }

    updateClient(event, values){
        //API
        this.setState({isAdding: true});
		

        var raw = {
            clientId: this.state.clientDetails.id,
            state: this.state.selectedState,
            city: this.state.selectedCity,
            gstNo: this.state.gstNo,
            name: values.name,
            email: values.email,
            entityName: values.entityName,
            templateBased: this.state.templateBased.value,

            address: values.address,
            company: values.companyName,
            companyType:  (this.state.selectedCompanyType==='')?this.state.clientDetails.companyType:this.state.selectedCompanyType,
            country: "India",
            dltRegNo: values.dltRegNo,
        };

        ServerApi().put("updateClient", raw)
          .then(res => {
            if (res.data.status === false) {
                this.props.openSnack({type: 'error', message: res.data.message})
                return false;
            }

            if(this.state.templateBased.value !== getLoggedInUser().templateBased){
                let user = getLoggedInUser();
                user.templateBased = this.state.templateBased.value;
                localStorage.setItem('user', JSON.stringify(user));
            }

            this.props.openSnack({type: 'success', message: 'Profile Updated!'})
            
            this.setState({isDisabled: !this.state.isDisabled, isLoading: false, isAdding: false});
            let newUser = getLoggedInUser();
            newUser.dltRegNo =  values.dltRegNo;
            setLoggeedInUser(newUser);
            this.loadClientDetails();
          })
          .catch(error => console.log('error', error));
    }

    handleAcceptedFilesDocument = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        // console.log(files);

        this.setState({ selectedFilesDocument: files });
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

    handleChange = e => {
        const { name, value } = e.target;

        this.setState({
          [name]: value
        });
    };

    changeAvatar(){
        // this.refs.form.getDOMNode().dispatchEvent(new Event("submit"));
        this.form && this.form.submit();

        this.tog_update_image();
    }

    render() {

        if (this.state.isLoading) { 
            return(
                <DataLoading loading={this.state.isLoading} />
            )
        } 

        return (
            <React.Fragment>
                
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">VIEW PROFILE</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="12">
                            <Card>
                                <CardBody>
                                    <Row>
                                        <Col sm="12" lg="2">
                                            <div className="p-2 mt-3 image-border">
                                                <img src={(this.state.clientDetails.avatar !== undefined)?'data:'+this.state.clientDetails.avatarFileType+';base64,'+this.state.clientDetails.avatar.data:defaultProfileImage} className="img-fluid" alt="Avatar" />
                                            </div>
                                        </Col>
                                        <Col sm="12" lg="10">
                                            <h3>{this.state.clientDetails.name}</h3>

                                            <Row>
                                                <Col xs="3" sm="3" md="3">
                                                    <p>Username </p>
                                                </Col>
                                                <Col xs="1" sm="1" md="1">
                                                    <p> : </p>
                                                </Col>
                                                <Col xs="8" sm="8" md="8">
                                                    <p className="float-left">{this.state.clientDetails.userName}</p>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs="3" sm="3" md="3">
                                                    <p>Routes </p>
                                                </Col>
                                                <Col xs="1" sm="1" md="1">
                                                    <p> : </p>
                                                </Col>
                                                <Col xs="8" sm="8" md="8">
                                                    <p className="float-left">{this.state.clientDetails.routes.map(i=>i.routeName+',')}</p>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs="3" sm="3" md="3">
                                                    <p>Account Type </p>
                                                </Col>
                                                <Col xs="1" sm="1" md="1">
                                                    <p> : </p>
                                                </Col>
                                                <Col xs="8" sm="8" md="8">
                                                    <p className="float-left">{this.state.clientDetails.accountType}</p>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs="3" sm="3" md="3">
                                                    <p>Credit Deduction Type </p>
                                                </Col>
                                                <Col xs="1" sm="1" md="1">
                                                    <p> : </p>
                                                </Col>
                                                <Col xs="8" sm="8" md="8">
                                                    <p className="float-left">{this.state.clientDetails.creditDeductionType}</p>
                                                </Col>
                                            </Row>
                                        </Col>

                                    </Row>

                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg="12" md="12">
                            <div>
                                <div>

                                    <Nav tabs className="nav-tabs">
                                        <NavItem>
                                            <NavLink className={classnames({ active: this.state.activeTab_border1 === '13' })}
                                                >
                                                <span className="d-block d-sm-none"><i className="fas fa-home"></i></span>
                                                <span className="d-none d-sm-block">View Profile</span>
                                            </NavLink>
                                        </NavItem>

                                    </Nav>

                                    <TabContent activeTab={this.state.activeTab_border1}>
                                        <TabPane className="p-3 bg-white" tabId="13">
                                            <AvForm onValidSubmit={this.updateClient} ref={c => (this.form = c)}>
                                                <Row className="align-items-center">
                                                    <Col md="12">
                                                        <div className="float-right">
                                                            {this.state.isDisabled && (
                                                                <Button
                                                                type="button" 
                                                                onClick={()=>this.setState({isDisabled: !this.state.isDisabled})} 
                                                                color="danger" 
                                                                size="sm" 
                                                                className="waves-effect mr-2">
                                                                    <i className="fa fa-edit mr-2"></i> 
                                                                    Edit
                                                            </Button>
                                                            )}
                                                            {!this.state.isDisabled && (
                                                            <Button
                                                                type="button" 
                                                                onClick={()=>this.setState({isDisabled: !this.state.isDisabled})} 
                                                                color="info" 
                                                                size="sm" 
                                                                className="waves-effect mr-2">
                                                                    <i className="fa fa-eye mr-2"></i> 
                                                                    View
                                                            </Button>
                                                            )}
                                                        </div>                                                   
                                                    </Col>
                                                </Row>

                                                <Row className="align-items-center">
                                                    <Col sm="4">
                                                        <AvField name="name" label="NAME"
                                                            disabled={this.state.isDisabled}
                                                            value={this.state.clientDetails.name}
                                                            type="text" errorMessage="Enter Name"
                                                            validate={{ required: { value: true } }} />
                                                    </Col>
                                                    {/* <Col sm="4">
                                                        <AvField name="last_name" label="LAST NAME"
                                                            disabled={this.state.isDisabled}
                                                            value={this.state.clientDetails.lastName}
                                                            placeholder="Enter Last Name" type="text" errorMessage="Enter Last Name"
                                                            validate={{ required: { value: true } }} />
                                                    </Col> */}
                                                    <Col sm="4">
                                                        <AvField name="phone" label="PHONE" 
                                                            disabled={this.state.isDisabled}
                                                            value={this.state.clientDetails.phoneNumber}
                                                            type="number" errorMessage="Enter Phone no."
                                                            validate={{ required: { value: true } }} />

                                                    </Col>

                                                    <Col sm="4">
                                                         <AvField name="email" label="EMAIL"
                                                            disabled={this.state.isDisabled}
                                                            type="email" errorMessage="Enter Email"
                                                            value={this.state.clientDetails.email}
                                                            validate={{ required: { value: false } }} />
                                                    </Col>
                                                </Row>                                            

                                                <Row>
                                                    <Col sm="4">
                                                        <AvField name="companyName" label="COMPANY"
                                                            disabled={this.state.isDisabled}
                                                            type="text" errorMessage="Enter Company"
                                                            value={this.state.clientDetails.company}
                                                            validate={{ required: { value: (getLoggedInUser().userType==='ADMIN')?true:false } }} />
                                                    </Col>
                                                    <Col sm="4">
                                                        {!this.state.isDisabled && (
                                                            <><Label>COMPANY TYPE</Label>
                                                            <Select
                                                                className="mb-3"
                                                                value={(this.state.selectedCompanyType==='')?{label: this.state.clientDetails.companyType, value: this.state.clientDetails.companyType}:{label: this.state.selectedCompanyType, value: this.state.selectedCompanyType}}
                                                                // defaultValue={{label: this.state.clientDetails.companyType, value: this.state.clientDetails.companyType}}
                                                                onChange={e=>this.setState({selectedCompanyType: e.value})}
                                                                options={COMPANY_TYPES}
                                                            /></>
                                                        )}
                                                        {this.state.isDisabled && (
                                                            <AvField name="companyType" label="COMPANY TYPE"
                                                                disabled={true}
                                                                type="text" errorMessage="Enter Company"
                                                                value={this.state.clientDetails.companyType}
                                                                validate={{ required: { value: true } }} />
                                                        )}
                                                    </Col>
                                                    <Col sm="4">
                                                        <Label>GST NO</Label>
                                                        {/* <AvField name="gstno" label="GST NO"
                                                            disabled={this.state.isDisabled}
                                                            type="text" errorMessage="Enter Company"
                                                            value={this.state.clientDetails.gstNo}
                                                            validate={{ required: { value: false } }} /> */}
                                                        <MaskInput onChange={e=>this.setState({gstNo: e.target.value})} disabled={this.state.isDisabled} className="form-control" alwaysShowMask maskString={(this.state.gstNo!=='')?this.state.gstNo:"00XXXXX0000X0Z0"} mask="00aaaaa0000a0Z0" size={15} />;
                                                    </Col>
                                                </Row>

                                                <Row className="align-items-center">
                                                    
                                                    <Col sm="4">
                                                        {!this.state.isDisabled && (
                                                            <><Label>STATE</Label>
                                                            <Select
                                                                className="mb-3"
                                                                value={(this.state.selectedState==='')?{label: this.state.clientDetails.address.state, value: this.state.clientDetails.address.state}:{label: this.state.selectedState, value: this.state.selectedState}}
                                                                // defaultValue={Countries[0].options[99]}
                                                                onChange={e=>this.setState({selectedState: e.value, selectedStateIndex: e.index, selectedCity: ''})}
                                                                options={print_state()}
                                                            /></>
                                                        )}

                                                        {this.state.isDisabled && (
                                                            <AvField name="state" label="STATE"
                                                                disabled={true}
                                                                value={this.state.clientDetails.address.state}
                                                                type="text" errorMessage="Enter state"
                                                                validate={{ required: { value: true } }} />
                                                        )}
                                                        
                                                    </Col>
                                                    <Col sm="4">
                                                        {!this.state.isDisabled && (
                                                            <><Label>CITY</Label>
                                                                <Select
                                                                className="mb-3"
                                                                label="CITY"
                                                                value={(this.state.selectedCity==='')?{label: this.state.clientDetails.address.city, value: this.state.clientDetails.address.city}:{label: this.state.selectedCity, value: this.state.selectedCity}}
                                                                // defaultValue={Countries[0].options[99]}
                                                                onChange={e=>this.setState({selectedCity: e.value})}
                                                                options={print_city(this.state.selectedStateIndex)}>
                                                            </Select></>
                                                        )}

                                                        {this.state.isDisabled && (
                                                            <AvField name="city" label="CITY"
                                                                disabled={true}
                                                                value={this.state.clientDetails.address.city}
                                                                type="text" errorMessage="Enter city"
                                                                validate={{ required: { value: true } }} />
                                                        )}
             
                                                    </Col>

                                                    <Col sm="4">
                                                        <AvGroup>
                                                            <AvField
                                                                disabled={this.state.isDisabled}
                                                                name="address" 
                                                                label="Billing Address"
                                                                value={this.state.clientDetails.address.address}
                                                                validate={{ required: { value: true } }}
                                                                onChange={(event) => this.setState({address: event.target.value})}
                                                                rows="2"
                                                                errorMessage="Address is required!"
                                                            />
                                                        </AvGroup>
                                                    </Col>
                                                </Row>

                                                <Row className="align-items-center">
                                                    

                                                    <Col sm="4">
                                                        <AvField name="dltRegNo" label="DLT No."
                                                            disabled={this.state.isDisabled}
                                                            type="number"
                                                            value={this.state.clientDetails.dltRegNo}
                                                            errorMessage="Enter DLT Registratio No."
                                                            validate={{ required: { value: true, minLength: {value: 15}, maxLength: {value: 20}, } }} />
                                                    </Col>

                                                    <Col sm="4">
                                                        <AvField name="entityName" label="Entity Name"
                                                            disabled={this.state.isDisabled}
                                                            value={this.state.clientDetails.dltRegNo}
                                                            type="text" errorMessage="Enter Entity Name"
                                                            validate={{ required: { value: true } }} />
                                                    </Col>

                                                    <Col sm="4">
                                                        {!this.state.isDisabled && (
                                                            <><Label>TEMPLATE BASED</Label>
                                                            <Select
                                                                className="mb-3"
                                                                value={this.state.templateBased}
                                                                onChange={(i)=>this.setState({templateBased: i})}
                                                                options={[{label: 'Yes', value: true}, {label: 'No', value: false}]}
                                                            /></>
                                                        )}
                                                        {this.state.isDisabled && (
                                                            <AvField name="templateBased" label="Template Based"
                                                                disabled={true}
                                                                type="text"
                                                                value={(this.state.clientDetails.templateBased)?'Yes':'No'}
                                                                validate={{ required: { value: true } }} />
                                                        )}
                                                    </Col>
                                                    

                                                </Row>

                                                

                                                {!this.state.isDisabled && (
                                                    <FormGroup className="mb-0">
                                                        <div>
                                                            <Button 
                                                                type="success"
                                                                disabled={this.state.isAdding} 
                                                                color="primary" 
                                                                htmlType="submit" className="mr-1 float-right">
                                                                <i className="fa fa-paper-plane mr-2"></i> 
                                                                {(this.state.isAdding)?'Please Wait...':'Update'}
                                                            </Button>
                                                        </div>
                                                    </FormGroup>
                                                )}


                                            </AvForm>
                                        </TabPane>
                                    </TabContent>

                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Modal isOpen={this.state.modal_change_image} toggle={this.tog_update_image} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_change_image: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>

                            <AvForm >
                                <Label>UPDATE AVATAR</Label>
                                <FormGroup >
                                    <Dropzone onDrop={acceptedFiles => this.handleAcceptedFilesDocument(acceptedFiles)}>
                                        {({ getRootProps, getInputProps }) => (
                                            <div className="dropzone">
                                                <div className="dz-message needsclick" {...getRootProps()}>
                                                    <input {...getInputProps()} />
                                                    <h6 className="font-12">Upload Image</h6>
                                                </div>
                                            </div>
                                        )}
                                    </Dropzone>
                                    <div className="dropzone-previews mt-3" id="file-previews">
                                        {this.state.selectedFilesDocument.map((f, i) => {
                                            return <Card className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete" key={i + "-file"}>
                                                <div className="p-2">
                                                    <Row className="align-items-center">
                                                        <Col className="col-auto">
                                                            <img data-dz-thumbnail="" height="80" className="avatar-sm rounded bg-light" alt={f.name} src={f.preview} />
                                                        </Col>
                                                        <Col className="pl-0">
                                                            <Link to="#" className="text-muted font-weight-bold">{f.name}</Link>
                                                            <p className="mb-0"><strong>{f.formattedSize}</strong></p>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </Card>
                                        })}
                                    </div>
                                </FormGroup>

                                <FormGroup >
                                    <Button 
                                        disabled={this.state.isAdding || this.state.selectedFilesDocument[0] === undefined} 
                                        onClick={this.changeAvatar} color="success" className="mr-1">
                                        {(this.state.isAdding)?'Please Wait...':'Update'}
                                    </Button>
                                </FormGroup >
                            </AvForm>

                        </ModalBody>
                    </Modal>

                    {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            type={this.state.modalType}
                            confirmBtnBsStyle={this.state.modalType}
                            onCancel={()=>this.setState({success_msg:false})}
                            showCloseButton={(this.state.modalType === 'success')?false:true}
                            showConfirm={(this.state.modalType === 'success')?true:false}
                            onConfirm={() => this.setState({success_msg:false})} >
                        </SweetAlert> 
                    }

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, updateSmsBalance, openSnack })(MyProfile));