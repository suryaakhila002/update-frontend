import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';
import {Tag} from 'antd';
import {ServerApi} from '../../utils/ServerApi';
// import {Empty} from 'antd';
import ReportsLoading from '../../components/Loading/ReportsLoading';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import {getLoggedInUser} from '../../helpers/authUtils';


class SmsReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl1: null,
            fullMessage: '',
            modalFullMessage: false,
            modal_standard: false,
            reportsRawData: [],
            isLoading: true,
            isModalLoading: true,
            priceBreakdown:false,
            anchorEl: null,
            breakDownItem: {},
            priceBreakdownType: 'cost',
            p:0,
            s:0,
            reportsData: {
                columns: [
                    {
                        label: 'SL' ,
                        field: 'slno',
                        sort: 'asc',
                        width: 50
                    },
                    {
                        label: 'USERNAME' ,
                        field: 'createdByName',
                        sort: 'asc',
                        width: 150
                    },
                    // {
                    //     label: 'SCHEDULED',
                    //     field: 'scheduled',
                    //     sort: 'asc',
                    //     width: 150
                    // },
                    {
                        label: 'SUBMITTED',
                        field: 'submitted',
                        sort: 'asc',
                        width: 150
                    },
                    {
                        label: 'MESSAGE',
                        field: 'messageText',
                        sort: 'asc',
                        width: 150
                    },
                    // {
                    //     label: 'COST',
                    //     field: 'cost',
                    //     sort: 'asc',
                    //     width: 50
                    // },
                    {
                        label: 'PURCHASE',
                        field: 'purchase',
                        sort: 'asc',
                        width: 50
                    },
                    {
                        label: 'SALE',
                        field: 'sale',
                        sort: 'asc',
                        width: 50
                    },
                    {
                        label: 'PROFIT/LOSS',
                        field: 'pl',
                        sort: 'asc',
                        width: 50
                    },
                    {
                        label: 'SENDERID',
                        field: 'senderId',
                        sort: 'asc',
                        width: 100
                    },
                    {
                        label: 'ROUTE',
                        field: 'smsGatewayName',
                        sort: 'asc',
                        width: 100
                    },
                    {
                        label: 'STATUS',
                        field: 'Tstatus',
                        sort: 'asc',
                        width: 100
                    },
                    {
                        label: 'ACTION',
                        field: 'action',
                        sort: 'asc',
                        width: 100
                    }
                ],
                rows: [
                    
                ]
            },
        };
        this.tog_standard = this.tog_standard.bind(this);
    }

    componentDidMount() {
        // this.LoadingBar.continuousStart();
        this.props.activateAuthLayout();
        this.loadReports()
    }

    ManageClick() {        
        this.props.history.push('/manageClient');
    }

    tog_standard(index) {
        this.props.history.push({pathname: '/manageReport', state: {
                id: this.state.reportsRawData[index].id,
                status: this.state.reportsRawData[index].status,
                runTime: this.state.reportsRawData[index].createdTime,
                endTime: this.state.reportsRawData[index].updatedTime,
                senderId: this.state.reportsRawData[index].senderId,
                createdByName: this.state.reportsRawData[index].createdByName,
                credits: this.state.reportsRawData[index].credits,
                messageType: this.state.reportsRawData[index].messageType,
             }});        
    }
    removeBodyCss() {
        document.body.classList.add('no_padding');
    }

    calSale(item){
        return (Number(item.saleDltCharges.toFixed(2))+Number(item.saleDltChargesGst.toFixed(2))+Number(item.saleSmsCharges.toFixed(2))+Number(item.saleSmsChargesGst.toFixed(2))).toFixed(2);
    }

    calPur(item){
        return (Number(item.purchaseDltCharges.toFixed(2))+Number(item.purchaseDltChargesGst.toFixed(2))+Number(item.purchaseSmsCharges.toFixed(2))+Number(item.purchaseSmsChargesGst.toFixed(2))).toFixed(2);
    }

    calPL(item){
        return (Number(this.calSale(item)) - Number(this.calPur(item))).toFixed(2)
    }

    addUTCFormat(date) {
        return date.endsWith("Z") ? date : date + "Z";
    }

    loadReports(){
        ServerApi().get(`reports/getReports`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }

            this.setState({reportsRawData: res.data.response});

            let p = 0;
            let s = 0;

            res.data.response.map((item, index)=>{
                item.slno = (index+1);
                // item.scheduled = new Date(item.createdTime).toLocaleString('en-US', {hour12: true});
                item.submitted = new Date(this.addUTCFormat(item.updatedTime)).toLocaleString('en-US', {hour12: true});
                item.messageTmp = item.message;
                item.messageText = (item.message !==undefined && item.message.length > 55)?<>{item.message.slice(0, 55)} <span style={{cursor: 'pointer', color: 'blue'}} onClick={(e)=>this.setState({anchorEl1:e.currentTarget, modalFullMessage: true, fullMessage: item.messageTmp})} aria-describedby="full-message">... read more</span></>:item.message;
                item.cost = <span style={{cursor: 'pointer', color: 'orange' }} onClick={(e) => this.setState({ anchorEl: e.currentTarget, priceBreakdown: true, breakDownItem: item })} aria-describedby="price-breakdown">{(item.credits === null) ? 'N/A' : "₹ " + item.credits}</span>
                
                item.saleP = item.saleSmsCharges; //this.calSale(item);
                item.sale = <span style={{cursor: 'pointer', color: 'orange'}} onClick={(e)=>this.setState({anchorEl:e.currentTarget, priceBreakdownType:'sale', priceBreakdown: true, breakDownItem: item})} aria-describedby="price-breakdown">{(item.credits === null)?'N/A':"₹ "+item.saleP}</span>
                s = s + Number(item.saleSmsCharges);
                
                if(getLoggedInUser().userType!=='CLIENT'){
                    item.purchaseP = item.purchaseSmsCharges;//this.calPur(item);
                    item.purchase = <span style={{cursor: 'pointer', color: 'orange'}} onClick={(e)=>this.setState({anchorEl:e.currentTarget, priceBreakdownType:'sale', priceBreakdown: true, breakDownItem: item})} aria-describedby="price-breakdown">{(item.credits === null)?'N/A':"₹ "+item.purchaseP}</span>
                    item.pl = 0;//<span style={{cursor: 'pointer', color: Math.sign(this.calPL(item))?'#1e7b22':'#f44336'}} >{(item.credits === null)?'N/A':"₹ "+(this.calPL(item))}</span>
                    p = p+Number(item.saleSmsCharges);
                }
                
                //DELIV -- DELIVERED, EXPIR -- EXPIRED , UNDEL -- UNDELIVERED, REJEC -- REJECTED , DND -- DND , C- SUBMITTED
                
                item.Tstatus = <Tag color={(item.status === 'C')?'green':(item.status === 'W')?'red':'orange'}>
                                    {(item.status === 'C')?'Completed':(item.status === 'W')?'Waiting':'N/A'}
                                </Tag>;
                item.action = <div><Button onClick={()=>this.tog_standard(index)} type="button" color="primary" size="sm" className="waves-effect mb-2"><i className="fa fa-eye"></i></Button></div>
                delete item.message;


                return true;
            });  

            // let newTableDataRows = [...this.state.reportsData.rows];
            let newTableDataRows = res.data.response;
            let newCols = this.state.reportsData.columns;
            if(getLoggedInUser().userType==='CLIENT'){
                newCols = newCols.filter((i)=>i.field!=='createdByName'&&i.field!=='smsGatewayName'&&i.field!=='sale'&&i.field!=='purchase'&&i.field!=='pl');
            }
            if(getLoggedInUser().userType==='RESELLER'){
                newCols = newCols.filter((i)=>i.field!=='smsGatewayName'&&i.field!=='cost');
            }
            this.setState({p,s, isLoading: false, reportsData: {columns: newCols, rows: newTableDataRows}});
            // this.LoadingBar.complete();
        })
        .catch(error => {
            console.log('error', error);
            this.setState({isLoading: false})
        });
    }

    render() {

        if(this.state.isLoading){
            return(<ReportsLoading />);
        }


        return (
            <React.Fragment>
                {/* <LoadingBar
                    height={3}
                    color='#79acef'
                    onRef={ref => (this.LoadingBar = ref)}
                /> */}

                <Container fluid>
                <Row className="pt-4">
                    <Col xl="3" md="3" sm="6" xs="6">
                        <Card className="mini-stat bg-primary text-white">
                            <CardBody>
                                <div className="mb-4">
                                    <div className="float-left mini-stat-img mr-2">
                                        <span class="fa fa-paper-plane fa-lg"></span>
                                    </div>
                                    <h5 style={{fontSize: 14}} className="text-uppercase mt-0 text-white">Campaigns</h5>
                                    <h4 className="font-500 text-white">{this.state.reportsData.rows.length}</h4>

                                </div>
                                
                            </CardBody>
                        </Card>
                    </Col>
                    {(getLoggedInUser().userType!=='CLIENT') && (
                    <Col xl="3" md="3" sm="6" xs="6">
                        <Card className="mini-stat bg-info text-white">
                            <CardBody>
                                <div className="mb-4">
                                    <div className="float-left mini-stat-img mr-2">
                                        <span class="fa fa-wallet fa-lg"></span>
                                    </div>
                                    <h5 style={{fontSize: 14}} className="text-uppercase mt-0 text-white"> Purchase</h5>
                                    <h4 className="font-500 text-white">₹ {this.state.p.toFixed(2)}</h4>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                        )}
                        {
                            getLoggedInUser().userType !== 'CLIENT' &&
                            <Col xl="3" md="3" sm="6" xs="6">
                                <Card className={(getLoggedInUser().userType !== 'CLIENT') ? "mini-stat bg-warning text-white" : "mini-stat bg-success text-white"}>
                                    <CardBody>
                                        <div className="mb-4">
                                            <div className="float-left mini-stat-img mr-2">
                                                <span class="fa fa-money fa-lg"></span>
                                            </div>
                                            <h5 style={{ fontSize: 14 }} className="text-uppercase mt-0 text-white">{(getLoggedInUser().userType !== 'CLIENT') ? 'Sale' : 'Cost'}</h5>
                                            <h4 className="font-500 text-white">₹ {this.state.s.toFixed(2)}</h4>

                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        }
                    {(getLoggedInUser().userType!=='CLIENT') && (
                    <Col xl="3" md="3" sm="6" xs="6">
                        <Card className="mini-stat bg-success text-white">
                            <CardBody>
                                <div className="mb-4">
                                    <div className="float-left mini-stat-img mr-2">
                                        <span class="fa fa-bar-chart fa-lg"></span>
                                    </div>
                                    <h5 style={{fontSize: 14}} className="text-uppercase mt-0 text-white">Earning</h5>
                                    <h4 className="font-500 text-white">₹ {Number(this.state.p-this.state.s).toFixed(2)}</h4>
                                    
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    )}
                </Row>

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>

                                    <MDBDataTable
                                        sortable
                                        responsive
                                        striped
                                        hover
                                        small
                                        data={this.state.reportsData}
                                        footer={false}
                                        foot={false}
                                    />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <Popover
                        id="price-breakdown"
                        open={this.state.priceBreakdown}
                        anchorEl={this.state.anchorEl}
                        onClose={()=>this.setState({priceBreakdown:false})}
                        anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                        transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                        }}
                    >
                        <div className="p-3">
                            <Typography component="h6" variant="caption" style={{borderBottom: '1px dashed grey'}} className="mb-2 text-center">
                                {(this.state.priceBreakdownType==='sale')?'SALE':(this.state.priceBreakdownType==='purchase')?'PURCHASE':'SUMMARY'}
                            </Typography>

                            <Typography variant="body2" className="text-muted">
                            
                            SMS Rate : <span className='float-right'>₹ {(this.state.priceBreakdownType==='purchase')?Number(this.state.breakDownItem.purchaseSmsCharges):Number(this.state.breakDownItem.saleSmsCharges)}</span> <br />
                            DLT Charge : <span className='float-right'>{" "}₹ {(this.state.priceBreakdownType==='purchase')?Number(this.state.breakDownItem.purchaseDltCharges):Number(this.state.breakDownItem.saleDltCharges)}</span> <br />
                            Gst 18% : <span className='float-right'>₹ {(this.state.priceBreakdownType==='purchase')?Number(this.state.breakDownItem.purchaseDltChargesGst + this.state.breakDownItem.purchaseSmsChargesGst).toFixed(2):Number(this.state.breakDownItem.saleDltChargesGst + this.state.breakDownItem.saleSmsChargesGst).toFixed(2)}</span> <br />
                            </Typography>

                            <Typography variant="body1" style={{borderTop: '1px solid grey'}} className="mt-2 text-muted">
                            <b>Total : </b><span className='float-right'>₹ {(this.state.priceBreakdownType==='purchase')?this.state.breakDownItem.purchaseP:this.state.breakDownItem.saleP}</span> <br />
                            </Typography>
                        </div>
                    </Popover>

                    <Popover
                        id="full-message"
                        open={this.state.modalFullMessage}
                        anchorEl={this.state.anchorEl1}
                        onClose={()=>this.setState({modalFullMessage:false})}
                        anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                        transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                        }}
                    >
                        <div className="p-3" style={{maxWidth: 440}}>
                            <Typography component="h6" variant="caption" style={{borderBottom: '1px dashed grey'}} className="mb-2 text-center">
                                Message
                            </Typography>

                            <Typography variant="body2" >{this.state.fullMessage}</Typography>
                        </div>
                    </Popover>

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(SmsReport));