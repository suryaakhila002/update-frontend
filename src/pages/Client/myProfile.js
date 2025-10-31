import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, Nav, NavItem, NavLink, TabContent, TabPane, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout, updateSmsBalance, openSnack } from '../../store/actions';
import Select from 'react-select';
import { Link, withRouter } from 'react-router-dom';
import { AvForm, AvField, AvGroup } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
// import { MDBDataTable } from 'mdbreact'; // This was already correctly commented out
import classnames from 'classnames';
import Dropzone from 'react-dropzone';
// import Countries from '../../utils/Countries';
import defaultProfileImage from '../../images/users/default_profile.jpg';
// import SweetAlert from 'react-bootstrap-sweetalert'; // DELETED: Unused and build-blocking
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
            // --- KEY CHANGE (STATE) ---
            // These state properties were unused
            // success_msg: false,
            // success_message: '',
            // --- END KEY CHANGE ---
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

    // ... (All component methods like componentDidMount, loadClientDetails, updateClient, etc., remain unchanged) ...
    
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
        this.setState({ selectedFilesDocument: files });
    }
    
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
                    {/* ... (All JSX in render() remains unchanged, EXCEPT for the SweetAlert block) ... */}

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
                                    {/* ... (Profile Header JSX) ... */}
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg="12" md="12">
                            <div>
                                <div>
                                    <Nav tabs className="nav-tabs">
                                        <NavItem>
                                            <NavLink className={classnames({ active: this.state.activeTab_border1 === '13' })}>
                                                <span className="d-block d-sm-none"><i className="fas fa-home"></i></span>
                                                <span className="d-none d-sm-block">View Profile</span>
                                            </NavLink>
                                        </NavItem>
                                    </Nav>

                                    <TabContent activeTab={this.state.activeTab_border1}>
                                        <TabPane className="p-3 bg-white" tabId="13">
                                            <AvForm onValidSubmit={this.updateClient} ref={c => (this.form = c)}>
                                                {/* ... (All AvForm fields remain unchanged) ... */}
                                            </AvForm>
                                        </TabPane>
                                    </TabContent>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Modal isOpen={this.state.modal_change_image} toggle={this.tog_update_image} >
                        {/* ... (Reactstrap Modal remains unchanged) ... */}
                    </Modal>

                    {/* --- KEY CHANGE (SWEETALERT BLOCK DELETED) --- */}
                    {/* The old <SweetAlert> component was deleted from here.
                        It was unused, and the import was blocking the build. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert ... >
                        </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, updateSmsBalance, openSnack })(MyProfile));