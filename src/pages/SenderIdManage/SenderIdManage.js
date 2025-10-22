import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody, } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import { withRouter } from 'react-router-dom';
// import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import {ServerApi} from '../../utils/ServerApi';
import { Tag, Table } from 'antd';
import {getLoggedInUser} from '../../helpers/authUtils';
import LoadingBar from 'react-top-loading-bar';
// import {TextField, FormControl} from '@material-ui/core';
import { Link } from 'react-router-dom';

const columns = [

  {
      title: 'SL' ,
      dataIndex: 'slno',
      sorter: {
            compare: (a, b) => a.slno - b.slno,
            multiple: 1,
        },
  },
//   {
//       title: 'Entity ID' ,
//       dataIndex: 'entityId',
//   },
//   {
//       title: 'Entity Name' ,
//       dataIndex: 'entityName',
//   },
    (getLoggedInUser())?getLoggedInUser().userType==='SUPER_ADMIN'?
   {
        title: 'Entity No' ,
        dataIndex: 'dltRegistrationId',
    }:{}:{},
    {
      title: 'SENDER ID' ,
      dataIndex: 'senderId',
      sorter: {
            compare: (a, b) => a.senderId.length - b.senderId.length,
            multiple: 1,
        },
    },
  {
      title: 'Type' ,
      dataIndex: 'type',
  },
  {
      title: 'Category' ,
      dataIndex: 'category',
  },
  (getLoggedInUser())?(getLoggedInUser().userType==='SUPER_ADMIN')?{title: 'Document' ,dataIndex: 'document'}:{}:{},
  (getLoggedInUser())?(getLoggedInUser().userType==='SUPER_ADMIN')?
  {
      title: 'CREATED BY',
      dataIndex: 'createdByNameCol',
      sorter: {
            compare: (a, b) => a.createdByNameCol - b.createdByNameCol,
            multiple: 1,
        },
  }:{}:{},
  {
      title: 'DATE',
      dataIndex: 'createdTime',
      sorter: {
            compare: (a, b) => a.createdTime - b.createdTime,
            multiple: 1,
        },
  },
  {
      title: 'STATUS',
      dataIndex: 'statuss',
      sorter: {
            compare: (a, b) => a.statuss - b.statuss,
            multiple: 1,
        },
  },
  {
      title: 'ACTION',
      dataIndex: 'action',
  }
];

// const CATEGORY = [
//     {
//         label: "CATEGORY",
//         options: [
//             { label: "None", value: "None" },
//             { label: "MyCategory", value: "MyCategory"},
//         ]
//     }
// ];

class SenderIdManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_standard: false,
            modal_delete: false,
            isAdding: false,
            success_msg: false,
            success_message: "",
            delete_sid: "",
            category: 'None',
            success_type: 'success',
            newSenderId: '',
            selectedFilesDocument: [],
            tableData : {
                columns: [
                    {
                        label: 'SL' ,
                        field: 'slno',
                        sort: 'asc',
                        width: 50
                    },
                    {
                        label: 'Entity No' ,
                        field: 'entityId',
                        sort: 'asc',
                        width: 150
                    },
                    {
                        label: 'SENDER ID Name' ,
                        field: 'senderId',
                        sort: 'asc',
                        width: 150
                    },
                    {
                        label: 'CREATED BY',
                        field: 'createdBy',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'DATE',
                        field: 'createdTime',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'STATUS',
                        field: 'statuss',
                        sort: 'asc',
                        width: 100
                    },
                    {
                        label: 'ACTION',
                        field: 'action',
                        sort: 'asc',
                        width: 200
                    }
                ],
                rows: [
                ]
            },
        };
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteSenderId = this.deleteSenderId.bind(this);
    }

    componentDidMount() {
        this.LoadingBar.continuousStart();
        this.props.activateAuthLayout();
        this.loadSenderIds()
    }

    tog_delete(id) {
        this.setState(prevState => ({
            modal_delete: !prevState.modal_delete,
            delete_sid: id,
        }));
        this.removeBodyCss();
    }

    removeBodyCss() {
        document.body.classList.add('no_padding');
    }

    deleteSenderId(){
        if (this.state.delete_sid === "") { return false; }

        this.setState({isAdding: true});
        
        ServerApi().get("deleteSenderId?senderId="+this.state.delete_sid)
          .then(res => {
            this.props.openSnack({type: 'success', message: 'Sender Id Deleted.'})
            this.setState({isAdding: false});
            this.loadSenderIds();
            this.tog_delete();
          })
          .catch(error => console.log('error', error));
    }

    permitSenderId(action, id){
        if (id === "") { return false; }

        this.LoadingBar.continuousStart()

        ServerApi().get("updateStatus/"+action+"/"+id+"/"+getLoggedInUser().id)
          .then(res => {
            if(action==='Approved'){
                this.props.openSnack({type: 'success', message: 'Sender Id Approved.'})
                this.setState({isAdding: false});
            }else{
                this.props.openSnack({type: 'warning', message: 'Sender Id Rejected.'})
                this.setState({isAdding: false});
            }
            this.loadSenderIds();
            this.LoadingBar.complete()
          })
          .catch(error => console.log('error', error));
    }

    downloadDocument(id){

        ServerApi().get(`/senderId/downloadDocument/${id}`, {responseType: 'blob'})
          .then(res => {
                // console.log(res.data);
                const url = window.URL.createObjectURL(res.data);
                // const url = window.URL.createObjectURL(new Blob([res.data]));
                window.open(url)
                // const link = document.createElement('a');
                // link.href = url;
                // link.setAttribute('download', 'file.pdf'); //or any other extension
                // document.body.appendChild(link);
                // link.click();
          })
          .catch(error => console.log('error', error));
    }

    loadSenderIds(){
        ServerApi().get(`getAllSenderIds/${getLoggedInUser().id}`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }
            
            res.data.map((item, index)=>{
                item.slno = (index+1);
                item.createdTime = new Date(item.createdTime).toLocaleString('en-US', {hour12: false})
                item.statuss = (item.status === 'Approved')?(<Tag color="green">{item.status}</Tag>):(<Tag color="red">{item.status}</Tag>);
                item.document = <Button title="Download" type="button" onClick={()=>this.downloadDocument(item.id)} color="info" size="sm" className="waves-effect mb-2"><span className="fa fa-download"></span></Button>;
                if(getLoggedInUser().userType==='SUPER_ADMIN'){
                    item.createdByNameCol = <span style={{color: 'blue', cursor: 'pointer'}} onClick={()=>this.props.history.push({pathname: '/manageClient', state: { clientId: item.createdBy }})}>{item.createdByName}</span>
                }
                
                item.action = <div>
                                {getLoggedInUser().userType === 'SUPER_ADMIN' && (<>{(item.status === 'Approved')?(<Button onClick={()=>this.permitSenderId('Rejected', item.id)} type="button" color="warning" size="sm" className="waves-effect mb-2 mr-2" title="Reject"><span className="fa fa-info-circle"></span></Button>):(<Button onClick={()=>this.permitSenderId('Approved', item.id)} type="button" color="success" size="sm" className="waves-effect mb-2 mr-2" title="Approve"><span className="fa fa-check"></span></Button>)}</>)}
                                <Button title="Delete" type="button" onClick={()=>this.tog_delete(item.id)} color="danger" size="sm" className="waves-effect mb-2"><span className="fa fa-trash"></span></Button>
                            </div>;
                return true;
            });  

            let newTableDataRows = [...this.state.tableData.rows];
            newTableDataRows = res.data;
            this.setState({tableData: {...this.state.tableData, rows: newTableDataRows}})
            this.LoadingBar.complete();
        })
        .catch(error => console.log('error', error));
    }

    render() {

        return (
            <React.Fragment>
                <LoadingBar
                    height={3}
                    color='#79acef'
                    onRef={ref => (this.LoadingBar = ref)}
                />

                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">Manage Sender Id</h4>
                            </Col>
                            <Col sm="6">
                                <div className="float-right d-none d-md-block">
                                    {getLoggedInUser().dltRegNo !== null && (
                                        <Link to='addSenderId'><Button type="button" color="primary" size="sm" className="waves-effect"><i className="fa fa-plus mr-2"></i> Add Sender Id</Button></Link>
                                    )}
                                    {getLoggedInUser().dltRegNo === null && (
                                        <><Button title="To Add SenderId Please update DLT No. in profile" disabled={true} type="button" color="primary" size="sm" className="waves-effect"><i className="fa fa-plus mr-2"></i> Add Sender Id</Button>
                                        <br /><span className="text-danger text-sm">Please update DLT No. in profile</span></>
                                    )}
                                </div>

                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>

                                    <Table columns={columns} dataSource={this.state.tableData.rows} onChange={this.onChange} size="small" />

                                    {/*<MDBDataTable
                                        sortable
                                        responsive
                                        striped
                                        hover
                                        data={this.state.tableData}
                                        footer={false}
                                        foot={false}
                                    />*/}

                                
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            type={this.state.success_type}
                            confirmBtnBsStyle="success"
                            onConfirm={() => this.setState({ success_msg: false })} >
                        </SweetAlert> 
                    }

                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_delete: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h6 className="text-center">Are You Sure You want to delete ?</h6>

                            <FormGroup className="mt-5 text-center">
                                <Button onClick={this.deleteSenderId} type="button" color="danger" className="mr-1">
                                    Delete
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

export default withRouter(connect(null, { activateAuthLayout, openSnack })(SenderIdManage));