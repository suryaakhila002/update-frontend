import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
// import Select from 'react-select';
// import {getLoggedInUser} from '../../helpers/authUtils';
import SweetAlert from 'react-bootstrap-sweetalert';
import {ServerApi} from '../../utils/ServerApi';
import {Button} from '@mui/material';
import ContactsLoading from '../../components/Loading/ContactsLoading';        

class AdminCreateClients extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            settings:{}
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
        // this.props.openSnack({type: 'error', message: 'unable to save'})
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
        formData.append('adminIcon', null);
        formData.append('loginIcon', null);
        formData.append('favicon', null);

        ServerApi().post('/whitelist-info/save', formData)
        .then(res=>{
            this.props.openSnack({type: 'success', message: 'Settings SAved.'})
            console.log(res.data);
        })
        .catch(e=>console.log(e));
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

                                    <AvForm onValidSubmit={this.saveSettings} ref={c => (this.form = c)}>
                                        <Row className="align-items-center">

                                            <Col sm="12">
                                                <AvField value={this.state.settings.displayName} name="name" label="Site Name"
                                                    placeholder="" type="text" errorMessage="Enter Name"
                                                    validate={{ required: { value: true } }} />
                                            </Col>

                                            <Col sm="12">
                                                <AvField value={this.state.settings.domainName} name="domain" label="Domain Name"
                                                    placeholder="" type="text" errorMessage="Enter Name"
                                                    validate={{ required: { value: true } }} />
                                            </Col>

                                            <Col sm="12">
                                                <AvField name="logo" label="Site Logo"
                                                    type="file"
                                                    placeholder="" errorMessage="Select File"
                                                    validate={{ required: { value: true } }} />
                                            </Col>

                                            <Col sm="12">
                                                <AvField name="adminLogo" label="Admin Logo"
                                                    type="file"
                                                    placeholder="" errorMessage="Select File"
                                                    validate={{ required: { value: true } }} />
                                            </Col>

                                            <Col sm="12">
                                                <AvField name="favicon" label="Favicon icon"
                                                    type="file"
                                                    placeholder="" errorMessage="Select File"
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                            
                                            <Col sm="12">
                                                <AvField value={this.state.settings.supportContactNo} name="supportContactNo" label="Contact Number"
                                                    placeholder="" type="text" errorMessage="Enter Name"
                                                    validate={{ required: { value: true } }} />
                                            </Col>

                                            <Col sm="12">
                                                <AvField name="supportEmail" label="Contact Email"
                                                    placeholder="" type="email" errorMessage="Enter Name"
                                                    validate={{ required: { value: true } }} />
                                            </Col>
                                            

                                            <Col sm="12">
                                                <AvField value={this.state.settings.supportEmail} name="contactAddress" label="Contact Address"
                                                    placeholder="" type="text" errorMessage="Enter Name"
                                                    validate={{ required: { value: true } }} />
                                            </Col>

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
                                                     {(this.state.isAdding)?'Please Wait...':'Save'}
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