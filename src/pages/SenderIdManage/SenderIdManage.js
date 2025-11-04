import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody, } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
// import { withRouter } from 'react-router-dom';
//  // This was commented out, leaving as-is
import { connect } from 'react-redux';
// import { MDBDataTable } from 'mdbreact'; // This was commented out, leaving as-is
// import SweetAlert from 'react-bootstrap-sweetalert'; // DELETED: Unused and build-blocking
// import Select from 'react-select';
import {ServerApi} from '../../utils/ServerApi';
import { Tag, Table } from 'antd';
import {getLoggedInUser} from '../../helpers/authUtils';
import LoadingBar from 'react-top-loading-bar';
// import { MDBDataTable } from 'mdbreact'; // DELETED: Unused and build-blocking
import Dropzone from 'react-dropzone';
// import {TextField} from '@mui/material';
import { Link } from 'react-router-dom'; // Added Link since it's used

// ... (columns constant remains unchanged)
const columns = [
  {
      title: 'SL' ,
      dataIndex: 'slno',
      sorter: {
            compare: (a, b) => a.slno - b.slno,
            multiple: 1,
        },
  },
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

class SenderIdManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_standard: false,
            modal_delete: false,
            isAdding: false,
            // --- KEY CHANGE (STATE) ---
            // These state properties were unused
            // success_msg: false,
            // success_message: "",
            // success_type: 'success',
            // --- END KEY CHANGE ---
            delete_sid: "",
            category: 'None',
            newSenderId: '',
            selectedFilesDocument: [],
            // --- KEY CHANGE (DATAGRID) ---
            // This 'tableData' is for the commented-out MDBDataTable.
            // We'll leave it as-is since the Ant Design table uses 'tableData.rows'
            tableData : {
                columns: [
                    {
                        label: 'SL' ,
                        field: 'slno',
                        sort: 'asc',
                        width: 50
                    },
                    // ... (rest of old columns)
                ],
                rows: [
                ]
            },
            // --- END KEY CHANGE ---
        };
        this.tog_delete = this.tog_delete.bind(this);
        this.deleteSenderId = this.deleteSenderId.bind(this);
    }
    
    // ... (All component methods like componentDidMount, tog_delete, deleteSenderId, etc., remain unchanged) ...

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
                const url = window.URL.createObjectURL(res.data);
                window.open(url)
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
                    {/* ... (All JSX in render() remains unchanged, EXCEPT for the SweetAlert block) ... */}

                    <div className="page-title-box">
                        <Row className="align-items.center">
                            <Col sm="6">
                                <h4 className="page-title">Manage Sender Id</h4>
                            </Col>
                            <Col sm="6">
                                {/* ... (Header buttons remain unchanged) ... */}
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>
                                    {/* This is correct. The component is already using Ant Design Table */}
                                    <Table columns={columns} dataSource={this.state.tableData.rows} onChange={this.onChange} size="small" />

                                    {/* <MDBDataTable ... /> */}
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


                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        {/* ... (Reactstrap Modal remains unchanged) ... */}
                    </Modal>

                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout, openSnack })(SenderIdManage);