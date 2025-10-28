import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Label } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Select from 'react-select';
// import Countries from '../../utils/Countries';
import SweetAlert from 'react-bootstrap-sweetalert';
// import Dropzone from 'react-dropzone';
import {ServerApi} from '../../utils/ServerApi';
import {Button} from '@mui/material';
import {getLoggedInUser} from '../../helpers/authUtils';
import AddIcon from '@material-ui/icons/Add';

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

const ACCOUNT_TYPE = [
            { label: "Prepaid", value: "Prepaid", isOptionSelected: true },
            { label: "Postpaid", value: "Postpaid" },
        ];

const CREDIT_TYPE = [
            { label: "SUBMIT", value: "SUBMIT", isOptionSelected: true },
            { label: "DELIVERY", value: "DELIVERY" },
        ];

const AUTH_TYPE_BOLEAN = [
            { label: "Yes", value: true, isOptionSelected: true },
            { label: "No", value: false },
        ];



class SuperadminCreateClients extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAdding: false,
            country: 'India',
            success_msg: false,
            success_message: '',
            modalType:'success',
            modal_standard: false,
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

    componentDidMount() {
        this.props.activateAuthLayout();
        this.loadRoutes();
        this.loadFixedBundles();
    }
        
    
    loadRoutes(){
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get("routes")
        // ServerApi().get('routes/fetch-active-routes')
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
                creditDeductionType: this.state.credit_type,
                creditLimit: (this.state.account_type === 'Postpaid')?values.credit_limit:0,
                // creditType: this.state.account_type,
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

        // var formdata = new FormData();
        // formdata.append("request", JSON.stringify(raw.dto));
        // formdata.append("documentFile", this.state.selectedFilesDocument[0]);

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
                                                <AvField name="company_name" label="Company Name"
                                                    type="text" errorMessage="Enter Company Name"
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                            <Col sm="12">
                                                <Label>Company Type</Label>
                                                <Select
                                                    required={true}
                                                    className="field-required"
                                                    // defaultValue={COMPANY_TYPES[0]}
                                                    onChange={(i)=>this.setState({ company_type: i.value })}
                                                    options={COMPANY_TYPES}
                                                />
                                            </Col>
                                            <Col sm="12">
                                                <AvField name="email" label="EMAIL"
                                                    placeholder="" type="email" errorMessage="Enter Email"
                                                    validate={{ email: true, required: { value: false } }} />
                                            </Col>

                                            <Col sm="12">
                                                <AvField name="phone" label="PHONE"
                                                    
                                                    placeholder="" type="number" errorMessage="Enter Phone no."
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
                                                <label>PASSWORD</label>
                                                <AvField name="password" type="password"
                                                    placeholder="Password" errorMessage="Enter password"
                                                    validate={{ required: { value: true } }} />
                                            </Col>

                                            <Col sm="12">
                                                <Label>Route</Label>
                                                <Select
                                                    className="mb-2 field-required"
                                                    // defaultValue={(this.state.routes[0] !== undefined)?this.state.routes[0]:null}
                                                    onChange={(i)=>this.setState({ selectedRoutes: i })}
                                                    // onChange={this.handleSelectCountry}
                                                    isMulti
                                                    options={this.state.routes}
                                                />
                                            </Col>

                                            <Col sm="12">
                                                <Label>Account Type</Label>
                                                <Select
                                                    className="mb-3 field-required"
                                                    // defaultValue={ACCOUNT_TYPE[0]}
                                                    options={ACCOUNT_TYPE}
                                                    onChange={(i)=>this.setState({ account_type: i.value })}
                                                    // label="Company Type"
                                                    // defaultValue={COMPANY_TYPES[0].options[0]}
                                                    // defaultValue={{labe:'Prepaid', value: 'Prepaid'}}
                                                />
                                            </Col>

                                            {this.state.account_type === 'Postpaid' && (
                                                <Col sm="12">
                                                    <AvField name="credit_limit" label="Credit Limit"
                                                        placeholder="" errorMessage="Enter Credit Limite"
                                                        validate={{ required: { value: true } }} />
                                                </Col>
                                            )}

                                        </Row>

                                        <Row className="align-items-center">
                                            {/* <Col sm="12">
                                                <Label>SMS Plan Type</Label>
                                                <Select
                                                    className="mb-3"
                                                    // defaultValue={SMS_PLAN_TYPE[0]}
                                                    onChange={(i)=>this.setState({ sms_plan: i.value })}
                                                    options={SMS_PLAN_TYPE}
                                                />
                                            </Col> */}
                                            {/* {this.state.sms_plan === 'Bundle' && (
                                                <Col sm="12 mb-2">
                                                    <Label>Select Bundle Plan</Label>
                                                    <Select
                                                        className="mb-3"
                                                        // defaultValue={this.state.priceBundles[0]}
                                                        onChange={(i)=>this.setState({ selectedPriceBundle: i.value })}
                                                        options={this.state.priceBundles}
                                                    />
                                                </Col>
                                            )} */}
                                            {/* <Col sm="12 mb-2">
                                                <Label>Select Fixed Plan</Label>
                                                <Select
                                                    className="mb-3 field-required"
                                                    // defaultValue={this.state.fixedBundles[0]}
                                                    onChange={(i)=>this.setState({ selectedFixedBundle: i.value, fixedPrice: i.netPrice })}
                                                    options={this.state.fixedBundles}
                                                />
                                                {this.state.fixedPrice!==0 &&(
                                                    <p className="text-primary"><b>Rate (Per SMS): {this.state.fixedPrice}</b></p>
                                                )}
                                            </Col> */}
                                        
                                            {/* <Col sm="12">
                                                <AvField disabled={true} value={this.state.fixedPrice} name="rate_sms" label="Rate (Per SMS)"
                                                    placeholder="" errorMessage="Rate (Per SMS)"
                                                    validate={{ required: { value: false } }} />
                                            </Col> */}

                                            

                                            <Col sm="12" className="mt-3">
                                                <Label>Credit Deduction Type</Label>
                                                <Select
                                                    className="field-required"
                                                    // onChange={this.handleSelectCountry}
                                                    // defaultValue={CREDIT_TYPE[0]}
                                                    onChange={(i)=>this.setState({ credit_type: i.value })}
                                                    options={CREDIT_TYPE}
                                                />
                                            </Col>

                                            {this.state.credit_type === 'DELIVERY' && (
                                                <Col sm="12" className="mt-3">
                                                    <Label>DND Retrun</Label>
                                                    <Select
                                                        className="field-required"
                                                        // onChange={this.handleSelectCountry}
                                                        // defaultValue={AUTH_TYPE_BOLEAN[0]}
                                                        onChange={(i)=>this.setState({ dnd_return: i.value })}
                                                        options={AUTH_TYPE_BOLEAN}
                                                    />
                                                </Col>
                                            )}


                                            <Col sm="12" className="mt-3">
                                                <Label>Admin Droping</Label>
                                                <Select
                                                    className="field-required"
                                                    // defaultValue={AUTH_TYPE_BOLEAN[1]}
                                                    onChange={(i)=>this.setState({ admin_dropping: i.value })}
                                                    options={AUTH_TYPE_BOLEAN}
                                                />
                                            </Col>
                                            
                                            {this.state.admin_dropping === true && (
                                            <><Col sm="12" className="mt-3">
                                                <AvField name="dropingPercentage" label="Droping Percentage "
                                                    placeholder="" type="number" errorMessage="Enter Droping Percentage "
                                                    validate={{ required: { value: true } }} />
                                            </Col></>
                                            )}

                                            <Col sm="12" className="mt-3">
                                                <Label>Child Droping access</Label>
                                                <Select
                                                    className="field-required"
                                                    onChange={(i)=>this.setState({ admin_droping_access: i.value })}
                                                    // onChange={this.handleSelectCountry}
                                                    // defaultValue={AUTH_TYPE[1]}
                                                    options={AUTH_TYPE_BOLEAN}
                                                />
                                            </Col>

                                            <Col sm="12" className="mt-3">
                                                <Label>Template Based</Label>
                                                <Select
                                                    className="mt-2 mb-3"
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
                                                    color="primary" 
                                                    startIcon={<AddIcon />}
                                                    disabled={(this.state.isAdding)?true:false}
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

export default withRouter(connect(null, { activateAuthLayout, openSnack })(SuperadminCreateClients));