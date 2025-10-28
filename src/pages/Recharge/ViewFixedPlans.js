import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Table } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';
import SweetAlert from 'react-bootstrap-sweetalert';
import {ServerApi} from '../../utils/ServerApi';
import { Empty, Tag } from 'antd';
import { getLoggedInUser } from '../../helpers/authUtils';
import {Button} from '@mui/material';

class ViewFixedPlan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData : {
                columns: [
                    {
                        label: 'SL' ,
                        field: 'slno',
                        sort: 'asc',
                        width: 50
                    },
                    {
                        label: 'PLAN NAME' ,
                        field: 'planName',
                        sort: 'asc',
                        width: 80
                    },
                    {
                        label: 'PRICE',
                        field: 'price',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'HSNNO',
                        field: 'hsnNo',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'ACTION',
                        field: 'action',
                        sort: 'asc',
                        width: 280
                    }
                ],
                rows: [
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
        };
        this.tog_standard = this.tog_standard.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.loadFixedBundles = this.loadFixedBundles.bind(this);
        this.deleteFixedPlan = this.deleteFixedPlan.bind(this);
    }

    componentDidMount() {
        console.log('All clkients components')
        this.props.activateAuthLayout();

        this.loadFixedBundles();

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

    render() {

        if (this.state.isLoading) { return(<Empty imageStyle={{marginTop: 100}} description="Loading Data Please Wait..."></Empty>) }

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">SMS PRICE PLAN</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col md="8">
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

export default withRouter(connect(null, { activateAuthLayout })(ViewFixedPlan));