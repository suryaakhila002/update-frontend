import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Label } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Select from 'react-select';
import {getLoggedInUser} from '../../helpers/authUtils';
import SweetAlert from 'react-bootstrap-sweetalert';
import {ServerApi} from '../../utils/ServerApi';
import AddIcon from '@material-ui/icons/Add';
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

// const GST_TYPE = [
//             { label: "Including", value: true, isOptionSelected: true },
//             { label: "Excluding", value: false },
//         ];

const USER_TYPE = [
            { label: "User", value: "CLIENT", isOptionSelected: true },
            { label: "Reseller", value: "RESELLER" },
        ];

// const SMS_PLAN_TYPE = [
//     { label: "Bundle", value: "Bundle" },
//     { label: "Fixed", value: "Fixed" },
// ];
        

class AdminCreateClients extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAdding: false,
            success_msg: false,
            success_message: '',
            modalType:'success',
            modal_standard: false,
            smsType: '',
            creditType: '',
            fixedPrice: 0,
            account_type: '',
            user_type: '',
            email: '',
            phone: '',
            username: '',
            password: '',
            routes: [],
            sms_plan: 'Fixed',
            route: '',
            gst_applicable: false,
            dnd_return: undefined,
            credit_type: '',
            priceBundles: [],
            selectedFixedBundle: '',
            admin_dropping: ''
        };

        this.addNewClient = this.addNewClient.bind(this);

        this.loadRoutes = this.loadRoutes.bind(this);
        this.loadPriceBundles = this.loadPriceBundles.bind(this);
        this.loadFixedBundles = this.loadFixedBundles.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadRoutes();
        this.loadPriceBundles();
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

    loadPriceBundles(){
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(`api/v1/pricing/bundle/${getLoggedInUser().id}/all`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            } 

            var arr = res.data.map(obj => ({
                label: obj.planName,
                value: obj.id,
            }))

            this.setState({priceBundles: arr})
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

        if(this.state.selectedFixedBundle==='' || this.state.account_type===''
        || this.state.user_type==='' || this.state.route==='' || this.state.route.length===0 || this.state.credit_deduction===undefined){
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
                bundlePriceApplicable: (this.state.sms_plan === 'Bundle')?true:false,
                bundlePriceId: this.state.selectedPriceBundle,
                creatorId: getLoggedInUser().id,
                // creatorId: 1,
                creditDeductionType: this.state.credit_deduction,
                creditLimit: (this.state.account_type === 'POSTPAID')?values.credit_limit:0,
                // creditType: this.state.account_type,
                droppingAccessApplicableToChild: this.state.admin_dropping_access,
                droppingPercentage: values.droping_percentage,
                email: values.email,
                // gstInclusive: this.state.gst_applicable,
                // gstno: "",
                name: values.name,
                password: values.password,
                phoneNumber: values.phone,
                // pricingAmount: 1,
                pricingId: this.state.selectedFixedBundle,
                routeIdList: [this.state.route],
                userType: this.state.user_type,
                username: values.username,

                templateBased: this.state.templateBased,
                // sms_plan: this.state.sms_plan,
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
            // this.form && this.form.reset();
            setTimeout(()=>{this.props.history.push('/allClients')},800);

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

                                            <Col sm="12" className="mb-3">
                                                <Label>User Type</Label>
                                                <Select
                                                    // label="Company Type"
                                                    className="mt-3 field-required"
                                                    onChange={(i)=>this.setState({ user_type: i.value })}
                                                    options={USER_TYPE}
                                                />
                                            </Col>
                                            <Col sm="12" className="mb-3">
                                                <Label>Route</Label>
                                                <Select
                                                    className="field-required"
                                                    // defaultValue={(this.state.routes[0] !== undefined)?this.state.routes[0]:null}
                                                    onChange={(i)=>this.setState({ route: i.value })}
                                                    // onChange={this.handleSelectCountry}
                                                    options={getLoggedInUser().routes.map(i=>({value: i.id, label: i.routeName}))}
                                                />
                                            </Col>
                                            <Col sm="12" className="mb-3">
                                                <Label>Account Type</Label>
                                                <Select
                                                    className="field-required"
                                                    options={ACCOUNT_TYPE}
                                                    onChange={(i)=>this.setState({ account_type: i.value })}
                                                />
                                            </Col>

                                            {this.state.account_type === 'POSTPAID' && (
                                                <Col sm="12" className="mb-3">
                                                    <AvField name="credit_limit" label="Credit Limit"
                                                        placeholder="" errorMessage="Enter Credit Limite"
                                                        validate={{ required: { value: true } }} />
                                                </Col>
                                            )}

                                            <Col sm="12" className="mb-3">
                                                <Label>Credit Deduction Type</Label>
                                                <Select
                                                    className="field-required"
                                                    onChange={(i)=>this.setState({ credit_deduction: i.value })}
                                                    options={CREDIT_TYPE}
                                                />
                                            </Col>

                                            {this.state.credit_deduction === 'DELIVERY' && (
                                                <Col sm="12" className="mt-3">
                                                    <Label>DND Retrun</Label>
                                                    <Select
                                                        className="field-required"
                                                        onChange={(i)=>this.setState({ dnd_return: i.value })}
                                                        options={AUTH_TYPE}
                                                    />
                                                </Col>
                                            )}


                                        </Row>

                                        <Row className="align-items-center">

                                            {this.state.sms_plan === 'Bundle' && (
                                                <Col sm="12" className="mb-2">
                                                    <Label>Select Bundle Plan</Label>
                                                    <Select
                                                        className="field-required"
                                                        onChange={(i)=>this.setState({ selectedPriceBundle: i.value })}
                                                        options={this.state.priceBundles}
                                                    />
                                                </Col>
                                            )}
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
                                        
                                            {/* <Col sm="12">
                                                <AvField disabled={true} value={this.state.fixedPrice} name="rate_sms" label="Rate (Per SMS)"
                                                    placeholder="" errorMessage="Enter Rate (Per SMS)"
                                                    validate={{ required: { value: true } }} />
                                            </Col> */}
                                        </Row>
                                        <Row className="align-items-center">
                                        
                                            {getLoggedInUser().droppingAccessApplicableToChild && (
                                            <Col sm="12">
                                                <Label>Droping</Label>
                                                <Select
                                                    className="field-required"
                                                    onChange={(i)=>this.setState({ admin_dropping: i.value })}
                                                    options={AUTH_TYPE}
                                                />
                                            </Col>
                                            )}
                                            
                                            {this.state.admin_dropping === true && getLoggedInUser().droppingAccessApplicableToChild && (
                                            <Col sm="12 mt-2">3                                                <AvField name="droping_percentage" label="Droping Percentage "
                                                    placeholder="" type="number" errorMessage="Enter Droping Percentage "
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                            )}

                                            {this.state.user_type !== 'CLIENT' && (
                                                <Col sm="12 mt-3">
                                                    <Label>Droping access</Label>
                                                    <Select
                                                        className="field-required"
                                                        onChange={(i)=>this.setState({ admin_dropping_access: i.value })}
                                                        options={AUTH_TYPE}
                                                    />
                                                </Col>  
                                            )}

                                            <Col sm="12 mt-3">
                                                <Label>Template Based</Label>
                                                <Select
                                                    className="field-required"
                                                    // defaultValue={this.state.fixedBundles[0]}
                                                    onChange={(i)=>this.setState({ templateBased: i.value })}
                                                    options={[{label:'Yes', value:true}, {label:'No', value:false}]}
                                                />
                                            </Col>

                                        </Row>
                                        
                                        <div className="mb-0 mt-3">
                                            <div className="float-right">

                                                <Button 
                                                    type="submit"
                                                    size="small" 
                                                    variant="contained" 
                                                    disabled={(this.state.isAdding)?true:false}
                                                    startIcon={<AddIcon />}
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

export default withRouter(connect(null, { activateAuthLayout, openSnack })(AdminCreateClients));