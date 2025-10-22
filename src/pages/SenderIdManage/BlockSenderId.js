import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody, } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { Link, withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
// import { MDBDataTable } from 'mdbreact';
import SweetAlert from 'react-bootstrap-sweetalert';
// import Select from 'react-select';
import {ServerApi} from '../../utils/ServerApi';
import { Tag } from 'antd';
import {getLoggedInUser} from '../../helpers/authUtils';
import LoadingBar from 'react-top-loading-bar';
import { MDBDataTable } from 'mdbreact';
import Dropzone from 'react-dropzone';
// import {TextField} from '@material-ui/core';

// const CATEGORY = [
//     {
//         label: "CATEGORY",
//         options: [
//             { label: "None", value: "None" },
//             { label: "MyCategory", value: "MyCategory"},
//         ]
//     }
// ];

class BlockSenderId extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_standard: false,
            modal_delete: false,
            isAdding: false,
            success_msg: false,
            modal_standard_upload: false,
            success_message: "",
            delete_sid: "",
            category: 'None',
            success_type: 'success',
            selectedUploadFile: [],
            tableData : {
                columns: [
                    {
                        label: 'SL' ,
                        field: 'slno',
                        sort: 'asc',
                        width: 50
                    },
                    {
                        label: 'SENDER ID' ,
                        field: 'senderId',
                        sort: 'asc',
                        width: 150
                    },
                    {
                        label: 'BLOCK REASON',
                        field: 'reason',
                        sort: 'asc',
                        width: 270
                    },
                    {
                        label: 'ACTION',
                        field: 'action',
                        sort: 'asc',
                        width: 200
                    }
                ],
                rows: [
                    {
                        slno : '1',
                        senderId : 'TESTIN',
                        reason : 'Abused content.',
                        action : <Button type="button" onClick={()=>null} color="danger" size="sm" className="waves-effect mb-2"><span className="fa fa-trash"></span></Button>,
                    }
                ]
            },
        };
        this.tog_standard = this.tog_standard.bind(this);
        this.tog_standard_upload = this.tog_standard_upload.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.addSenderId = this.addSenderId.bind(this);
        this.deleteSenderId = this.deleteSenderId.bind(this);

        this.handleAcceptedFilesDocument = this.handleAcceptedFilesDocument.bind(this);
    }

    componentDidMount() {
        // this.LoadingBar.continuousStart();
        this.props.activateAuthLayout();
        // this.loadSenderIds()
    }

    ManageClick() {        
        this.props.history.push('/manageClient');
    }

    tog_standard() {
        this.setState(prevState => ({
            modal_standard: !prevState.modal_standard
        }));
        this.removeBodyCss();
    }

    tog_standard_upload() {
        this.setState(prevState => ({
            modal_standard_upload: !prevState.modal_standard_upload
        }));
        this.removeBodyCss();
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

    handleSelectCategory = (selectedItem) => {
        this.setState({ category: selectedItem });
    }

    handleAcceptedFilesDocument = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        // console.log(files);

        this.setState({ selectedFilesDocument: files });
    }
    

    /**
    * Formats the size
    */
    formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    addSenderId(event, values){
        this.setState({isAdding: true});

        var raw = {
            "headers":{},  
            "requestType": "ADDSENDERID",
            "payload": {
                "clientId": values.entity_id,
                "clientName":values.entity_name,
                "senderIds":values.sender_id,
                "entityId": values.entity_id,
                "entityName" : values.entity_name,
                "categoryId": this.state.category.value,
                "categoryName" : this.state.category.label,
                "isActive" : "true"  
                }
            };

        var formdata = new FormData();
        formdata.append("request", JSON.stringify(raw));
        formdata.append("documentFile", this.state.selectedFilesDocument[0]);

        ServerApi().post('addSenderId', formdata)
          .then(res => {
            if (res.status === 200) {
                this.setState({success_type: 'success', success_msg: true, success_message:'Sender Id Added.', isAdding: false});
                this.loadSenderIds();
                this.tog_standard();
            } else {
                this.setState({success_type: 'error', success_msg: true, success_message:'Unable to add Sender Id.', isAdding: false});
            }

          })
          .catch(error => console.log('error', error));
    }

    deleteSenderId(){
        if (this.state.delete_sid === "") { return false; }

        this.setState({isAdding: true});
        
        ServerApi().get("deleteSenderId?senderId="+this.state.delete_sid)
          .then(res => {
            this.setState({success_msg: true, success_message: 'Sender Id Deleted.', isAdding: false});
            this.loadSenderIds();
            this.tog_delete();
          })
          .catch(error => console.log('error', error));
    }

    handleUploadFile = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        this.setState({ selectedUploadFile: files });

        this.fetchFileDetails();
    }

    /**
    * Formats the size
    */
    formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    permitSenderId(action, id){
        if (id === "") { return false; }

        this.LoadingBar.continuousStart()

        ServerApi().get("updateStatus/"+action+"/"+id)
          .then(res => {
            this.setState({success_msg: true, success_message: 'Sender Id Updated.', isAdding: false});
            this.loadSenderIds();
            this.LoadingBar.complete()
          })
          .catch(error => console.log('error', error));
    }

    loadSenderIds(){
        ServerApi().get(`getAllSenderIds`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }
            
            res.data.map((item, index)=>{
                item.slno = (index+1);
                item.createdTime = new Date(item.createdTime).toLocaleString('en-US', {hour12: false})
                item.statuss = (item.status === 'Approved')?(<Tag color="green">{item.status}</Tag>):(<Tag color="red">{item.status}</Tag>);
                
                item.action = <div>
                                {getLoggedInUser().userType === 'superadmin' && (<>{(item.status === 'Approved')?(<Button onClick={()=>this.permitSenderId('Rejected', item.id)} type="button" color="warning" size="sm" className="waves-effect mb-2 mr-2">Reject</Button>):(<Button onClick={()=>this.permitSenderId('Approved', item.id)} type="button" color="success" size="sm" className="waves-effect mb-2 mr-2">Approve</Button>)}</>)}
                                <Button type="button" onClick={()=>this.tog_delete(item.id)} color="danger" size="sm" className="waves-effect mb-2"><span className="fa fa-trash"></span></Button>
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
                            <Col lg="6" sm="12">
                                <h4 className="page-title">Block Sender Id</h4>
                            </Col>
                            <Col lg="6" sm="12">
                                <div className="float-right">
                                    <Button onClick={this.tog_standard} type="button" color="primary" size="sm" className="waves-effect mr-2"><i className="fa fa-plus mr-2"></i> Add Block Sender Id</Button>
                                    <Button onClick={this.tog_standard_upload} type="button" color="primary" size="sm" className="waves-effect"><i className="fa fa-file mr-2"></i> Upload File</Button>
                                </div>

                                <Modal isOpen={this.state.modal_standard} toggle={this.tog_standard} >
                                    <ModalBody>
                                        <button type="button" onClick={() => this.setState({ modal_standard: false })} className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>

                                        <AvForm className="p-3" enctype="multipart/form-data" onValidSubmit={this.addSenderId}>
                                            <FormGroup >
                                                <AvField name="sender_id" label="Sender ID"
                                                    placeholder="" type="text" 
                                                    errorMessage="Sender ID must be 6 characters"
                                                    maxLength={6}
                                                    
                                                    // onChangeText={(value) => this.setState(value.toUpperCase())}
                                                    minLength={6}
                                                    onKeyPress={event => (event.charCode >= 65 && event.charCode <= 90) || (event.charCode >= 97 && event.charCode <= 122)}
                                                    validate={{ required: { value: true } }} />

                                                <AvField name="reasson" label="Reason"
                                                    placeholder="" type="textarea" 
                                                    validate={{ required: { value: false } }} />
                                            </FormGroup>


                                            <FormGroup >
                                                <Button disabled={this.state.isAdding} type="submit" color="danger" className="text-center">
                                                    Block
                                                </Button>
                                            </FormGroup >
                                        </AvForm>

                                    </ModalBody>
                                </Modal>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>

                                    {/* <Table 
                                      columns={this.state.tableData.columns} 
                                      dataSource={this.state.tableData.rows} 
                                      onChange={this.onChange} 
                                      size="small" /> */}

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
                            type={this.state.success_type}
                            confirmBtnBsStyle="success"
                            onConfirm={() => this.setState({ success_msg: false })} >
                        </SweetAlert> 
                    }

                    <Modal isOpen={this.state.modal_standard_upload} toggle={this.tog_standard} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_standard_upload: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>

                            <AvForm className="p-3" enctype="multipart/form-data" onValidSubmit={this.addSenderId}>
                                <FormGroup >
                                    <Dropzone onDrop={acceptedFiles => this.handleUploadFile(acceptedFiles)}>
                                        {({ getRootProps, getInputProps }) => (
                                            <div className="dropzone">
                                                <div className="dz-message needsclick" {...getRootProps()}>
                                                    <input {...getInputProps()} />
                                                    <h6 className="font-12">Import Sender Id's *</h6>
                                                </div>
                                            </div>
                                        )}
                                    </Dropzone>
                                    <div className="dropzone-previews mt-3" id="file-previews">
                                        {this.state.selectedUploadFile.map((f, i) => {
                                            return <Card className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete" key={i + "-file"}>
                                                <div className="p-2">
                                                    <Row className="align-items-center">
                                                        <Col className="ml- 3 pl-3">
                                                            <Link to="#" className="text-muted font-weight-bold">{f.name}</Link>
                                                            <p className="mb-0"><strong>{f.formattedSize}</strong></p>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </Card>
                                        })}
                                    </div>

                                </FormGroup>


                                <FormGroup >
                                    <Button disabled={this.state.isAdding} type="submit" color="danger" className="text-center">
                                        Block
                                    </Button>
                                </FormGroup >
                            </AvForm>

                        </ModalBody>
                    </Modal>

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

export default withRouter(connect(null, { activateAuthLayout })(BlockSenderId));