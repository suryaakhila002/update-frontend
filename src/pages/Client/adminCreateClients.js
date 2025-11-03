import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Label } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';

// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Select from 'react-select';
import {getLoggedInUser} from '../../helpers/authUtils';
import {ServerApi} from '../../utils/ServerApi';
import AddIcon from '@mui/icons-material/Add';
import {Button} from '@mui/material';
import { Radio } from 'antd'; // Ant Design was already imported, keeping it

// --- KEY CHANGES (IMPORTS) ---
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated
import Swal from 'sweetalert2'; // ADDED: Modern Alert Library
import withReactContent from 'sweetalert2-react-content'; // ADDED: React wrapper
// --- END KEY CHANGES ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

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
const USER_TYPE = [
            { label: "User", value: "CLIENT", isOptionSelected: true },
            { label: "Reseller", value: "RESELLER" },
        ];
// ... (end of constants)


class AdminCreateClients extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAdding: false,
            // --- KEY CHANGE (STATE) ---
            // These are no longer needed, as SweetAlert2 is called imperatively
            // success_msg: false,
            // success_message: '',
            // modalType:'success',
            // modal_standard: false,
            // --- END KEY CHANGE ---
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
    
    // ... (All component lifecycle and load methods remain unchanged)
    
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
        // ... (Validation logic remains unchanged)
        if(this.state.selectedFixedBundle==='' || this.state.account_type===''
        || this.state.user_type==='' || this.state.route==='' || this.state.route.length===0 || this.state.credit_deduction===undefined){
            this.props.openSnack({type: 'error', message: 'Please fill all required fields.'})
            return false;
        }

        //API
        this.setState({isAdding: true});

        var raw = {  
            // ... (raw data object remains unchanged)
            requestType: "ADDCLIENT",
            dto:{  
                accountType: this.state.account_type,
                applyDndReturn: this.state.dnd_return,
                applyDropping: this.state.admin_dropping,
                bundlePriceApplicable: (this.state.sms_plan === 'Bundle')?true:false,
                bundlePriceId: this.state.selectedPriceBundle,
                creatorId: getLoggedInUser().id,
                creditDeductionType: this.state.credit_deduction,
                creditLimit: (this.state.account_type === 'POSTPAID')?values.credit_limit:0,
                droppingAccessApplicableToChild: this.state.admin_dropping_access,
                droppingPercentage: values.droping_percentage,
                email: values.email,
                name: values.name,
                password: values.password,
                phoneNumber: values.phone,
                pricingId: this.state.selectedFixedBundle,
                routeIdList: [this.state.route],
                userType: this.state.user_type,
                username: values.username,
                templateBased: this.state.templateBased,
            }
        };

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).post("addClient", raw.dto)
          .then(res => {
            if (res.data === undefined || res.data.id === undefined) {
                this.setState({isAdding: false});
                let message = 'An unknown error occurred.';
                if(res.data.status!==undefined && res.data.status==="CONFLICT"){
                    message = 'User Name Already Taken!';
                } else if (res.data.message) {
                    message = res.data.message;
                }
                
                // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
                this.props.openSnack({type: 'error', message: message}); // Use your existing snackbar for errors
                // MySwal.fire({ // <-- Alternative if you want a modal
                //     title: 'Error!',
                //     text: message,
                //     icon: 'error'
                // });
                // --- END KEY CHANGE ---
                
                return false;
            }

            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({isAdding: false}); // This is now handled by the modal
            this.props.openSnack({type: 'success', message: 'Client Added Successfully!'});
            
            // This replaces the old <SweetAlert> modal
            MySwal.fire({
                title: 'Client Added!',
                text: 'The new client has been created successfully.',
                icon: 'success'
            }).then((result) => {
                // This logic was in the old <SweetAlert> onConfirm prop
                if (result.isConfirmed) {
                    this.props.history.push('/allClients');
                }
            });
            // --- END KEY CHANGE ---

            // this.form && this.form.reset(); // Don't reset if we are redirecting
            setTimeout(()=>{
                this.setState({isAdding: false}); // Set false after timeout
                this.props.history.push('/allClients')
            }, 800); // Your original logic had an 800ms timeout

          })
          .catch(error => {
              console.log('error', error);
              this.setState({isAdding: false});
              MySwal.fire({ // Show error modal on API catch
                  title: 'Error!',
                  text: 'An error occurred while adding the client.',
                  icon: 'error'
              });
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
                                <h4 className="page-title">Add New Client</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="6">
                            <Card>
                                <CardBody>
                                    <FormControl onValidSubmit={this.addNewClient} ref={c => (this.form = c)}>
                                        {/* ... (All FormControl fields remain unchanged) ... */}
                                        <Row className="align-items-center">
                                            <Col sm="12">
                                                <AvField name="name" label="NAME"
                                                    placeholder="" type="text" errorMessage="Enter Name"
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                            {/* ... etc ... */}
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
                                    </FormControl>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    {/* --- KEY CHANGE (SWEETALERT BLOCK DELETED) --- */}
                    {/* The old <SweetAlert> component is DELETED from the render method.
                        It is now triggered as a function call in the 'addNewClient' method. */}
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

export default connect(null, { activateAuthLayout, openSnack })(AdminCreateClients);