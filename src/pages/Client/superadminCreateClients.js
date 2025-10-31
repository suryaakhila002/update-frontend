import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Label } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Select from 'react-select';
import {getLoggedInUser} from '../../helpers/authUtils';
// import Countries from '../../utils/Countries';
// import SweetAlert from 'react-bootstrap-sweetalert'; // DELETED: Unused and build-blocking
// import Dropzone from 'react-dropzone';
import {ServerApi} from '../../utils/ServerApi';
import {Button} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// ... (All constants like COMPANY_TYPES, ACCOUNT_TYPE, etc. remain unchanged)
const COMPANY_TYPES = [
            { label: "Private Ltd Company", value: "Private Ltd Company", isOptionSelected: true },
            { label: "Public Ltd Company", value: "Public Ltd Company" },
            // ...
        ];
const ACCOUNT_TYPE = [
            { label: "Prepaid", value: "PREPAID", isOptionSelected: true },
            { label: "Postpaid", value: "POSTPAID" },
        ];
const CREDIT_TYPE = [
            { label: "Submitted", value: "SUBMIT", isOptionSelected: true },
            { label: "Delivery", value: "DELIVERY" },
        ];
const AUTH_TYPE_BOLEAN = [
            { label: "Yes", value: true, isOptionSelected: true },
            { label: "No", value: false },
        ];
// ... (end of constants)


class SuperadminCreateClients extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAdding: false,
            country: 'India',
            // --- KEY CHANGE (STATE) ---
            // These state properties were unused
            // success_msg: false,
            // success_message: '',
            // modalType:'success',
            // modal_standard: false,
            // --- END KEY CHANGE ---
            account_type: '',
            admin_dropping: false,
            company_name: '',
            company_type: "",
            email: '',
            phone: '',
            username: '',
            password: '',
            credit_type: '',
            sms_plan: 'Fixed',
            routes: [],
            selectedRoutes: [],
            dnd_return: false,
            gst_applicable: true,
            fixedPrice: 0,
            admin_droping_access: undefined,
            selectedFixedBundle: "",

        };

        this.addNewClient = this.addNewClient.bind(this);
        this.loadRoutes = this.loadRoutes.bind(this);
        this.loadFixedBundles = this.loadFixedBundles.bind(this);
    }

    // ... (All component methods like componentDidMount, loadRoutes, addNewClient, etc., remain unchanged) ...

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadRoutes();
        this.loadFixedBundles();
    }
        
    
    loadRoutes(){
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get("routes")
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 
            var arr = res.data.map(obj => ({
                label: obj.routeName,
                value: obj.id,
            }))
            this.setState({routes: arr})
        })
        .catch(error => console.log('error', error));
    }

    loadFixedBundles(){
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(`api/v1/pricing/price/${getLoggedInUser().id}/all`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 
            var arr = res.data.map(obj => ({
                label: obj.planName,
                value: obj.id,
                netPrice: obj.netPrice,
            }))
            this.setState({fixedBundles: arr})
        })
        .catch(error => console.log('error', error));
    }

    addNewClient(event, values){
        if(this.state.selectedFixedBundle==="" || this.state.company_type==="" || 
           this.state.selectedRoutes.length===0 || this.state.admin_dropping===undefined || 
           this.state.admin_droping_access===undefined){
            this.props.openSnack({type: 'error', message: 'Please fill all required fields.'})
            return false;
        }

        this.setState({isAdding: true});

        var raw = {
            requestType: "ADDCLIENT",
            dto:{        
                accountType: this.state.account_type,
                applyDndReturn: this.state.dnd_return,
                applyDropping: this.state.admin_dropping,
                bundlePriceApplicable: (this.state.sms_plan === 'Bundle')?true:false,
                bundlePriceId: this.state.selectedPriceBundle,
                creatorId: getLoggedInUser().id,
                creditDeductionType: this.state.credit_type,
                creditLimit: (this.state.account_type === 'Postpaid')?values.credit_limit:0,
                droppingAccessApplicableToChild: this.state.admin_droping_access,
                droppingPercentage: values.dropingPercentage,
                email: values.email,
                gstInclusive: this.state.gst_applicable,
                gstno: "",
                name: "defaultName",
                password: values.password,
                phoneNumber: values.phone,
                pricingAmount: 1,
                pricingId: this.state.selectedFixedBundle,
                routeIdList: this.state.selectedRoutes.map(i=>i.value),
                userType: "ADMIN",
                username: values.username,
                sms_plan: this.state.sms_plan,
                templateBased: this.state.templateBased,
                company:  values.company_name,
                companyType: this.state.company_type,
                website: "",
            }
        };

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).post("addClient", raw.dto)
          .then(res => {
            if (res.data === undefined || res.data.id === undefined) {
                if(res.data.status!==undefined && res.data.status==="CONFLICT"){
                    this.props.openSnack({type: 'error', message: 'User Name Already Taken!'});
                }else{
                    this.props.openSnack({type: 'error', message: res.data.message});
                }
                this.setState({isAdding: false});
                return false;
            }
            this.props.openSnack({type: 'success', message: 'Client Added Successfully!'});
            setTimeout(()=>{this.props.history.push('/allClients')},800);
          })
          .catch(error => {
              console.log('error', error);
              this.props.openSnack({type: 'error', message: 'Unable to add client!'});
              this.setState({isAdding: false})
            });
    }


    render() {
        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (All JSX in render() remains unchanged, EXCEPT for the SweetAlert block) ... */}
                    
                    <div className="page-title-box">
                        <Row className="align-items.center">
                            <Col sm="6">
                                <h4 className="page-title">Add New Client</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="6">
                            <Card>
                                <CardBody>
                                    <AvForm onValidSubmit={this.addNewClient} ref={c => (this.form = c)}>
                                        {/* ... (All AvForm fields remain unchanged) ... */}
                                    </AvForm>
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
                            onConfirm={() => this.props.history.push('/allClients')} >
                        </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, openSnack })(SuperadminCreateClients));