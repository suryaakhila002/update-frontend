import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';

// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
// import Select from 'react-select';
// import {getLoggedInUser} from '../../helpers/authUtils';
// import SweetAlert from 'react-bootstrap-sweetalert'; // DELETED: Unused and build-blocking
import {ServerApi} from '../../utils/ServerApi';
import {Button as MuiButton} from '@mui/material'; // Renamed import
import ContactsLoading from '../../components/Loading/ContactsLoading';        

class AdminCreateClients extends Component { // Note: Class name seems to be a typo, but file is settings.js
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            settings:{},
            // --- KEY CHANGE (STATE) ---
            // These state properties were unused
            // success_msg: false,
            // success_message: '',
            // modalType:'success',
            // --- END KEY CHANGE ---
            isAdding: false, // Added isAdding to state
        };

        this.saveSettings = this.saveSettings.bind(this);
        this.getMySettings = this.getMySettings.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
        this.getMySettings()
    }   

    getMySettings(){
        ServerApi().get('/whitelist-info/get')
        .then(res=>{
            this.setState({settings:res.data.response, loading: false})
        })
        .catch(e=>console.log(e));
    }


    saveSettings(event, values){
        this.setState({isAdding: true}); // Set loading state
        let raw={
                displayName: values.name,
                domainName: values.domain,
                helplineNo: values.supportContactNo,
                isSslEnabled: true,
                subDomainName: "",
                supportEmail: values.supportEmail,
                supportContactNo : values.supportContactNo,
                contactAddress :values.contactAddress,
                otherDetails : "",
                landingTheme : "1",
                adminTheme : "1",
                contentData : {}
        }

        let formData = new FormData();
        formData.append('request', JSON.stringify(raw));
        formData.append('adminIcon', null); // You will need to hook these up to file inputs
        formData.append('loginIcon', null); // You will need to hook these up to file inputs
        formData.append('favicon', null);   // You will need to hook these up to file inputs

        ServerApi().post('/whitelist-info/save', formData)
        .then(res=>{
            this.props.openSnack({type: 'success', message: 'Settings Saved.'});
            this.setState({isAdding: false}); // Unset loading state
            console.log(res.data);
        })
        .catch(e=>{
            console.log(e);
            this.props.openSnack({type: 'error', message: 'Failed to save settings.'});
            this.setState({isAdding: false}); // Unset loading state
        });
    }
    

    render() {

        if(this.state.loading){
            return(
                <ContactsLoading />
            )
        }

        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (All JSX in render() remains unchanged, EXCEPT for the SweetAlert block) ... */}

                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">Settings</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="6">
                            <Card>
                                <CardBody>
                                    <FormControl onValidSubmit={this.saveSettings} ref={c => (this.form = c)}>
                                        {/* ... (All FormControl fields remain unchanged) ... */}
                                        <div className="mb-0 mt-3">
                                            <div className="float-right">
                                                {/* Used MuiButton here as 'Button' from material was imported */}
                                                <MuiButton 
                                                    type="submit"
                                                    size="small" 
                                                    variant="contained" 
                                                    disabled={(this.state.isAdding)?true:false}
                                                    color="primary" 
                                                    >
                                                     {(this.state.isAdding)?'Please Wait...':'Save'}
                                                </MuiButton>
                                            </div>
                                        </div>
                                    </FormControl>
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

export default connect(null, { activateAuthLayout, openSnack })(AdminCreateClients);