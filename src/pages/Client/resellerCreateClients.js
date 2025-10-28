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


import {Button} from '@mui/material';

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

        

class ResellerCreateClients extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAdding: false,
            success_msg: false,
            success_message: '',
            modalType:'success',
            modal_standard: false,
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
                // label: obj.routeName,
                // value: obj.routeId,
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

        //API
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
                // creditType: this.state.account_type,
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
                // sms_plan: this.state.sms_plan,
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
                                        <Row className="align-items-center">

                                            <Col sm="12">
                                                <AvField name="name" label="NAME"
                                                    
                                                    placeholder="" type="text" errorMessage="Enter Name"
                                                    validate={{ required: { value: true } }} />
                                            </Col>

                                            <Col sm="12">
                                                <AvField name="email" label="EMAIL"
                                                    placeholder="" type="email" errorMessage="Enter Email"
                                                    validate={{ required: { value: false } }} />
                                            </Col>

                                            <Col sm="12">
                                                <AvField name="phone" label="Mobile No"
                                                    placeholder="" errorMessage="Enter mobile no."
                                                    validate={{ required: { value: true },
                                                                minLength: {value: 10},
                                                                maxLength: {value: 10} }} />
                                            </Col>

                                            <Col sm="12">
                                                <AvField name="username" label="USER NAME"
                                                    placeholder="Enter User Name" type="text" errorMessage="Enter User Name"
                                                    validate={{ required: { value: true } }} />
                                            </Col>

                                            <Col sm="12">
                                                <AvField label="Password" name="password" type="password"
                                                    placeholder="Password" errorMessage="Enter password"
                                                    validate={{ required: { value: true } }} />
                                            </Col>

                                            {/* <Col sm="12 mt-2">
                                                <Label>User Type</Label>
                                                <Select
                                                    // label="Company Type"
                                                    defaultValue={USER_TYPE[0]}
                                                    onChange={(i)=>this.setState({ user_type: i.value })}
                                                    options={USER_TYPE}
                                                />
                                            </Col> */}
                                            <Col sm="12 mt-2">
                                                <Label>Route</Label>
                                                <Select
                                                    className="mb-2 field-required"
                                                    // defaultValue={(this.state.routes[0] !== undefined)?this.state.routes[0]:null}
                                                    onChange={(i)=>this.setState({ route: i.value })}
                                                    // onChange={this.handleSelectCountry}
                                                    options={getLoggedInUser().routes.map(i=>({value: i.id, label: i.routeName}))}
                                                />
                                            </Col>
                                            <Col sm="12 mt-2">
                                                <Label>Account Type</Label>
                                                <Select
                                                    className="mb-2 field-required"
                                                    defaultValue={ACCOUNT_TYPE[0]}
                                                    options={ACCOUNT_TYPE}
                                                    onChange={(i)=>this.setState({ account_type: i.value })}
                                                />
                                            </Col>

                                            {this.state.account_type === 'POSTPAID' && (
                                                <Col sm="12 mt-1">
                                                    <AvField name="credit_limit" label="Credit Limit"
                                                        placeholder="" errorMessage="Enter Credit Limite"
                                                        validate={{ required: { value: true } }} />
                                                </Col>
                                            )}

                                            <Col sm="12  mt-1">
                                                <Label>Credit Deduction Type</Label>
                                                <Select
                                                    className="mb-2 field-required"
                                                    defaultValue={CREDIT_TYPE[0]}
                                                    onChange={(i)=>this.setState({ credit_deduction: i.value })}
                                                    options={CREDIT_TYPE}
                                                />
                                            </Col>

                                            {this.state.credit_deduction === 'DELIVERY' && (
                                            <Col sm="12 mt-2">
                                                <Label>DND Retrun</Label>
                                                <Select
                                                    className="mb-2 field-required"
                                                    defaultValue={AUTH_TYPE[0]}
                                                    onChange={(i)=>this.setState({ dnd_return: i.value })}
                                                    options={AUTH_TYPE}
                                                />
                                            </Col>
                                        )}

                                            {/* <Col sm="12 mt-2">
                                                <Label>GST applicable</Label>
                                                <Select
                                                    defaultValue={GST_TYPE[0]}
                                                    onChange={(i)=>this.setState({ gst_applicable: i.value })}
                                                    options={GST_TYPE}
                                                />
                                            </Col> */}


                                        </Row>

                                        <Row className="align-items-center">
                                            <Col sm="12" className="mb-2">
                                                <Label>Select Plan</Label>
                                                <Select
                                                    className="field-required"
                                                    onChange={(i)=>this.setState({ selectedFixedBundle: i.value, fixedPrice: i.netPrice })}
                                                    options={this.state.fixedBundles}
                                                />
                                                {this.state.fixedPrice!==0 &&(
                                                    <p className="text-primary"><b>Rate (Per SMS): {this.state.fixedPrice}</b></p>
                                                )}
                                            </Col>
                                        </Row>
                                        <Row className="align-items-center">
                                            <Col sm="12  mt-2">
                                                <Label>Droping</Label>
                                                <Select
                                                    className="mb-3 field-required"
                                                    defaultValue={AUTH_TYPE[1]}
                                                    onChange={(i)=>this.setState({ admin_dropping: i.value })}
                                                    options={AUTH_TYPE}
                                                />
                                            </Col>
                                            
                                            {this.state.admin_dropping === true && (
                                            <Col sm="12 mt-2">
                                                <AvField name="droping_percentage" label="Droping Percentage "
                                                    placeholder="" type="number" errorMessage="Enter Droping Percentage "
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                            )}

                                                <Col sm="12 mt-2">
                                                    <Label>Template Based</Label>
                                                    <Select
                                                        className="mb-3 field-required"
                                                        // defaultValue={this.state.fixedBundles[0]}
                                                        onChange={(i)=>this.setState({ templateBased: i.value })}
                                                        options={[{label:'Yes', value:true}, {label:'No', value:false}]}
                                                    />
                                                </Col>

                                            {/* <Col sm="12 mt-2">
                                                <Label>Droping access</Label>
                                                <Select
                                                    defaultValue={AUTH_TYPE[0]}
                                                    onChange={(i)=>this.setState({ admin_dropping_access: i.value })}
                                                    options={AUTH_TYPE}
                                                />
                                            </Col> */}

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
                            onConfirm={() => this.props.history.push('/allClients')} >
                        </SweetAlert> 
                    }

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, openSnack })(ResellerCreateClients));