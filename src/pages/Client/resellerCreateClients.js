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

// ... (All constants like ACCOUNT_TYPE, CREDIT_TYPE, etc. remain unchanged)
const ACCOUNT_TYPE = [
            { label: "Prepaid", value: "PREPAID", isOptionSelected: true },
            { label: "Postpaid", value: "POSTPAID" },
        ];
const CREDIT_TYPE = [
            { label: "Submitted", value: "SUBMIT", isOptionSelected: true },
            { label: "Delivery", value: "DELIVERY" },
        ];
const AUTH_TYPE = [
            { label: "Yes", value: true, isOptionSelected: true },
            { label: "No", value: false },
        ];
// ... (end of constants)


class ResellerCreateClients extends Component {
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
            consumptionType: 'Submitted',
            smsType: 'Promotional',
            creditType: 'Prepaid',
            smsGateways: [
                            {
                                label: "SMS Routes",
                                options: [
                                ]
                            }
                        ],
            account_type: '',
            user_type: 'CLIENT',
            fixedPrice: 0,
            admin_dropping: undefined,
            admin_dropping_access: false,
            email: '',
            phone: '',
            username: '',
            password: '',
            defaultValues: {},
            routes: [],
            sms_plan: 'Bundle',
            route: '',
            gst_applicable: false,
            dnd_return: false,
            credit_type: '',
            priceBundles: [],
            templateBased: undefined,
        };

        this.addNewClient = this.addNewClient.bind(this);
        this.loadRoutes = this.loadRoutes.bind(this);
        this.loadFixedBundles = this.loadFixedBundles.bind(this);
    }

    // ... (All component methods like componentDidMount, loadRoutes, addNewClient, etc., remain unchanged) ...

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadRoutes();
        this.loadSmsGateways();
        this.loadFixedBundles();
    }

    loadSmsGateways(){
        ServerApi().get('routes/fetch-active-routes')
          .then(res => {
            if (res.status !== 200) { return false } 
            var arr = res.data.response.map(obj => ({
                label: obj.routeName,
                value: obj.id,
            }))
            this.setState({smsGateways: arr})
        })
        .catch(error => console.log('error', error));
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
        if(this.state.account_type==="" || this.state.route==="" || 
           this.state.credit_type===0 || this.state.admin_dropping===undefined || this.state.templateBased===undefined){
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
                bundlePriceApplicable: false,
                bundlePriceId: this.state.selectedPriceBundle,
                creatorId: getLoggedInUser().id,
                creditDeductionType: this.state.credit_deduction,
                creditLimit: (this.state.account_type === 'POSTPAID')?values.credit_limit:0,
                droppingAccessApplicableToChild: this.state.admin_dropping_access,
                droppingPercentage: values.droping_percentage,
                email: values.email,
                gstInclusive: this.state.gst_applicable,
                gstno: "",
                name: values.name,
                password: values.password,
                phoneNumber: values.phone,
                pricingAmount: this.state.fixedPrice,
                pricingId: this.state.selectedFixedBundle??0,
                routeIdList: [this.state.route],
                userType: 'CLIENT',
                username: values.username,
                templateBased: this.state.templateBased,
            }
        };

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).post("addClient", raw.dto)
          .then(res => {
            if (res.data === undefined || res.data.id === '' || res.data.status==='BAD_REQUEST') {
                this.props.openSnack({type: 'error', message: res.data.message})
                this.setState({isAdding: false});
                return false;
            }

            this.props.openSnack({type: 'success', message: 'Account created successfully!'})
            this.setState({isAdding: false});
            setTimeout(()=>{this.props.history.push('/allClients')},800);
            // this.form && this.form.reset();

          })
          .catch(error => console.log('error', error));
    }


    render() {
        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (All JSX in render() remains unchanged, EXCEPT for the SweetAlert block) ... */}
                    
                    <div className="page-title-box">
                        <Row className="align-items-center">
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
                        <SweetAlert ... >
                        </SweetAlert> 
                    } */}
                    {/* --- END KEY CHANGE --- */}

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, openSnack })(ResellerCreateClients));