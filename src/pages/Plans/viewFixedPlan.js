import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';
import SweetAlert from 'react-bootstrap-sweetalert';
import {ServerApi} from '../../utils/ServerApi';
import { Empty } from 'antd';
import { getLoggedInUser } from '../../helpers/authUtils';

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

            res.data.reverse().map((item, index)=>{
                item.slno = (index+1);
                item.price = '₹ '+item.netPrice;
                item.action = <div><Button title="Manage" onClick={()=>null}  type="button" color="info" size="sm" className="waves-effect waves-light mr-2 mb-2"><i className="fa fa-eye"></i></Button>
                <Button title="Manage" onClick={()=>null}  type="button" color="primary" size="sm" className="waves-effect waves-light mr-2 mb-2"><i className="fa fa-edit"></i></Button>
                <Button title="Delete" onClick={()=>this.tog_delete(item.id)} type="button" color="danger" size="sm" className="waves-effect mr-2 mb-2"><i className="fa fa-trash"></i></Button></div>;

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
                this.props.openSnack({type: 'error', message: 'Unable to remove plan.'})
                this.setState({isDeleting: false});
                this.tog_delete();
                return;
            }
            this.props.openSnack({type: 'success', message: 'Plan Removed!'})
            this.setState({isDeleting: false});
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
                                <h4 className="page-title">View Plans</h4>
                            </Col>
                            <Col sm="6">
                                <div className="float-right d-none d-md-block">
                                    <Button onClick={()=>this.props.history.push('/addPricePlan')} type="button" color="primary" size="sm" className="waves-effect"><i className="fa fa-plus mr-2"></i> Add Fixed Plan</Button>
                                </div>
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

                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_delete: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h6 className="text-center">Are You Sure You want to delete ?</h6>

                            <FormGroup className="mt-5 text-center">
                                <Button onClick={this.deleteFixedPlan} type="button" color="danger" className="mr-1">
                                    {(this.state.isDeleting)?'Please Wait...':'Delete'}
                                </Button>
                                <Button type="button" color="secondary" className="mr-1" onClick={() => this.setState({ modal_delete: false })} data-dismiss="modal" aria-label="Close">
                                    Cancel
                                </Button>
                            </FormGroup >

                        </ModalBody>
                    </Modal>

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, openSnack })(ViewFixedPlan));