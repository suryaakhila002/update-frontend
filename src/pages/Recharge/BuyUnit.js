import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Table, Label } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';
import SweetAlert from 'react-bootstrap-sweetalert';
import {ServerApi} from '../../utils/ServerApi';
import { Empty, Tag } from 'antd';
import { getLoggedInUser } from '../../helpers/authUtils';
import {Button} from '@material-ui/core';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import Select from 'react-select';

class BuyUnit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData : {
                columns: [
                    {
                        label: 'NUMBER OF UNITS' ,
                        field: 'units',
                        sort: 'asc',
                        width: 80
                    },
                    		
                    // {
                    //     label: 'TRANSACTION FEE(%)',
                    //     field: 'fee',
                    //     sort: 'asc',
                    //     width: 270
                    // },
                    {
                        label: 'PRICE PER UNIT',
                        field: 'price',
                        sort: 'asc',
                        width: 270
                    },
                ],
                rows: [
                    {
                        units: '0 - 5000',
                        price: '₹ 1',
                    },
                    {
                        units: '5001 - 10000',
                        price: '₹ 1',
                    },
                ]
            },
            success_msg: false,
            modal_type: 'success',
            success_message: '',
            modal_standard: false,
            modal_delete: false,
            delete_sid: '',
            isDeleting: false,
            isLoading: false,
            showDetail: false,
            showDetailId: 0,
            unitPrice: 0.4,
            amountToPay: 0,
            gstFee: 0,
            paymentMethods: [
                {label: 'Razor Pay', value: 'razorpay'},
                {label: 'Bank', value: 'bank'}
            ],
            paymentMethod: '',
            total: 0,
            dltCharge: 0.025,
        };
        this.tog_standard = this.tog_standard.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.loadFixedBundles = this.loadFixedBundles.bind(this);
        this.deleteFixedPlan = this.deleteFixedPlan.bind(this);
        this.calculatePrice = this.calculatePrice.bind(this);
    }

    componentDidMount() {
        console.log('All clkients components')
        this.props.activateAuthLayout();

        // this.loadFixedBundles();

    }

    loadFixedBundles(){
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(`api/v1/pricing/price/${getLoggedInUser().id}/all`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }

            res.data.map((item, index)=>{
                item.slno = (index+1);
                item.price = '₹ '+item.netPrice;
                item.action = <div><Button variant="contained"  title="View Features" onClick={()=>this.setState({showDetailId: index, showDetail: true})} color="primary" size="small"><i className="fa fa-eye mr-2"></i> View Features</Button></div>;
                return true;
            });  

            let newTableDataRows = [...this.state.tableData.rows];
            newTableDataRows = res.data;
            this.setState({isLoading: false, tableData: {...this.state.tableData, rows: newTableDataRows}})
        })
        .catch(error => console.log('error', error));
    }

    manageClient(id) {        
        this.props.history.push({pathname: '/manageClient', state: { clientId: id }});
    }

    tog_standard() {
        this.setState(prevState => ({
            modal_standard: !prevState.modal_standard
        }));
        this.removeBodyCss();
    }

    tog_delete(id) {
        this.setState({
            modal_delete: !this.state.modal_delete,
            delete_sid: id,
        });
        this.removeBodyCss();
    }

    removeBodyCss() {
        document.body.classList.add('no_padding');
    }

    deleteFixedPlan(){
        if (this.state.delete_sid === "") { return false; }

        this.setState({isDeleting: true});

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).delete("api/v1/pricing/plan/delete/"+this.state.delete_sid)
        // ServerApi().delete('api/v1/pricing/plan/delete/'+this.state.delete_sid)
          .then(res => {
            if (res.status === 404) {
                this.setState({success_msg: true, success_message: 'Unable to remove plan.',modal_type: 'error', isDeleting: false});
                this.tog_delete();
                return;
            }
            this.setState({success_msg: true, modal_type: 'success', success_message: 'Plan Removed.', isDeleting: false});
            this.loadFixedBundles();
            this.tog_delete();

          })
          .catch(error => console.log('error', error));
    }

    purchase(){
        console.log('purchase')
    }

    calculatePrice(e){
        let unit = e.target.value; 
        let amountToPay = (unit*this.state.unitPrice)+(unit*this.state.dltCharge); 
        let gstFee =  Math.round(amountToPay*0.18); 
        
        // total
        // dltCharge

        // alert(e.target.value)
        this.setState({ 
            amountToPay: Math.round(amountToPay),  
            total: Math.round(amountToPay + (amountToPay*0.18)),
            gstFee,
        });
    }

    render() {

        if (this.state.isLoading) { return(<Empty imageStyle={{marginTop: 100}} description="Loading Data Please Wait..."></Empty>) }

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">BUY UNIT</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="5">
                            <Card>
                                <CardBody>

                                    <AvForm onValidSubmit={this.purchase} ref={c => (this.form = c)}>
                                        <AvField 
                                            name="units" 
                                            label ="NUMBER OF UNITS"
                                            // onFocus={ () => this.setState({showSavedMessage: false}) }
                                            errorMessage="Enter NUMBER OF UNITS"
                                            validate={{ required: { value: true } }} 
                                            onChange={this.calculatePrice}
                                            style={{marginBottom: 0}} 
                                            // value={this.state.units}
                                        />

                                        <AvField 
                                            name="price" 
                                            label ="UNIT PRICE"
                                            // onFocus={ () => this.setState({showSavedMessage: false}) }
                                            style={{marginBottom: 0}} 
                                            disabled={true}
                                            value= {"₹ "+String(this.state.unitPrice).replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}
                                        />

                                        <AvField 
                                            name="dlt" 
                                            label ="DLT CHARGE"
                                            // onFocus={ () => this.setState({showSavedMessage: false}) }
                                            style={{marginBottom: 0}} 
                                            disabled={true}
                                            value= {"₹ "+String(this.state.dltCharge).replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}
                                        />

                                        <AvField 
                                            name="amount" 
                                            label ="AMOUNT TO PAY"
                                            // onFocus={ () => this.setState({showSavedMessage: false}) }
                                            style={{marginBottom: 0}} 
                                            disabled={true}
                                            value= {"₹ "+String(this.state.amountToPay).replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}
                                        />

                                        <AvField 
                                            name="fee" 
                                            label ="GST"
                                            // onFocus={ () => this.setState({showSavedMessage: false}) }
                                            style={{marginBottom: 0}} 
                                            disabled={true}
                                            value= {"₹ "+String(this.state.gstFee).replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}
                                        />

                                        <AvField 
                                            name="total"
                                            label ="TOTAL"
                                            // onFocus={ () => this.setState({showSavedMessage: false}) }
                                            style={{marginBottom: 0}} 
                                            disabled={true}
                                            value= {"₹ "+String(this.state.total).replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}
                                        />

                                        <Row className="mb-2">
                                            <Col md="12">                                            
                                                <Label>SELECT PAYMENT METHOD</Label>
                                                <Select
                                                    className="mb-3"
                                                    label="SELECT PAYMENT METHOD"
                                                    name="paymentMethod"
                                                    // value={selectedSenderId}
                                                    onChange={(e)=>this.setState({paymentMethod: e.value})}
                                                    options={this.state.paymentMethods}
                                                    validate={{ required: { value: true } }} 
                                                    required
                                                />
                                            </Col>
                                        </Row>

                                        {this.state.paymentMethod === 'bank' && (
                                        
                                            <AvField 
                                                name="bankRemark" 
                                                label ="Remark"
                                                type="textarea" 
                                                rows={3} 
                                                // onFocus={ () => this.setState({showSavedMessage: false}) }
                                                errorMessage="Remark"
                                                validate={{ required: { value: true } }} 
                                                onChange={this.calculatePrice}
                                                style={{marginBottom: 0}} 
                                                // value={this.state.units}
                                            />
                                        )}

                                        <div className="mt-3 mb-0">
                                            <div>
                                                <Button variant="contained" size="sm" style={{float: 'right'}} type="submit" disabled={this.state.isSending} color="primary" className="mr-1">
                                                    <i className="fa fa-plus mr-2"></i> {(this.state.isSending)?'Please Wait...':'Purchase'}
                                                </Button>

                                            </div>
                                        </div>

                                    </AvForm>

                                </CardBody>
                            </Card>
                        </Col>

                        <Col md="7">
                            <Card>
                                <CardBody>

                                    <MDBDataTable
                                        sortable
                                        responsive
                                        striped
                                        hover
                                        data={this.state.tableData}
                                        footer={false}
                                        foot={false}
                                    />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>



                    {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            confirmBtnBsStyle={this.state.modal_type}
                            onConfirm={() => this.setState({ success_msg: false })} 
                            type={this.state.modal_type} >
                        </SweetAlert> 
                    }

                    {this.state.showDetail && (
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            confirmBtnText="Buy Now"
                            title={<span>PLAN <small>Details</small>!</span>}
                            onConfirm={()=>this.setState({showDetail: false})}
                            onCancel={()=>this.setState({showDetail: false})}
                            btnSize="md"
                        >
                            <Table>
                                <thead>
                                    <tr>
                                    <th>SMS Balance</th>
                                    <th>Customer Support</th>
                                    <th>Reseller Panel</th>
                                    <th>API Access</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">{this.state.tableData.rows[this.state.showDetailId].fixedPriceInPaisa}</th>
                                        <td>24/7</td>
                                        <td><Tag color="red">No</Tag></td>
                                        <td><Tag color="red">No</Tag></td>
                                    </tr>
                                </tbody>
                            </Table>

                        </SweetAlert>
                    )}

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(BuyUnit));