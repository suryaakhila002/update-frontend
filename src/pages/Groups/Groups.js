import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Modal, ModalBody } from 'reactstrap';
import { activateAuthLayout, openSnack } from '../../store/actions';
import { Link, withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';
import SweetAlert from 'react-bootstrap-sweetalert';
import Dropzone from 'react-dropzone';
import Settings from '../../utils/ServerSettings';
import {ServerApi} from '../../utils/ServerApi';
import { Empty } from 'antd';
// import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import LoadingBar from 'react-top-loading-bar';
import {getLoggedInUser} from '../../helpers/authUtils';
// import { inputStyle } from 'react-select/src/components/input';

class Groups extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_standard: false,
            modal_standard_edit: false,
            modal_standard_new_contact: false,
            modal_upload: false,
            modal_view: false,
            modal_delete :false,
            success_msg: false,
            selectedFile: null,
            modalType: 'success',
            success_message: "",
            delete_sid: '',
            delete_type : '',
            edit_id: 0,
            add_contact_group_id: '',
            selectedUploadFile: [],
            isLoading: true,
            isModalLoading: true,
            modal_standard_edit_contact: false,
            tableData: {
                columns: [
                    {
                        label: 'SL' ,
                        field: 'slno',
                        sort: 'asc',
                        width: 50
                    },
                    {
                        label: 'GROUP NAME' ,
                        field: 'groupName',
                        sort: 'asc',
                        width: 150
                    },
                    {
                        label: 'COUNT',
                        field: 'count',
                        sort: 'asc',
                        width: 150
                    },
                    {
                        label: 'CREATED ON',
                        field: 'createdTime',
                        sort: 'asc',
                        width: 150
                    },
                    // {
                    //     label: 'Activate/Deactivate',
                    //     field: 'activateDeactivate',
                    //     sort: 'asc',
                    //     width: 100
                    // },
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
            tableDataContacts: {
                columns: [
                    {
                        label: 'SL' ,
                        field: 'slno',
                        sort: 'asc',
                        width: 50
                    },
                    {
                        label: 'CONTACT NAME' ,
                        field: 'contactName',
                        sort: 'asc',
                        width: 180
                    },
                    {
                        label: 'MOBILE NUMBER',
                        field: 'mobile',
                        sort: 'asc',
                        width: 180
                    },
                    {
                        label: 'EMAIL',
                        field: 'email',
                        sort: 'asc',
                        width: 170
                    },
                    {
                        label: 'CREATED ON',
                        field: 'createdTime',
                        sort: 'asc',
                        width: 190
                    },
                    {
                        label: 'ACTION',
                        field: 'action',
                        sort: 'asc',
                        width: 190
                    },
                ],
                rows: [
                    
                ]
            }
        };
        this.tog_standard = this.tog_standard.bind(this);
        this.tog_standard_edit = this.tog_standard_edit.bind(this);
        this.tog_standard_new_contact = this.tog_standard_new_contact.bind(this);
        this.tog_upload = this.tog_upload.bind(this);
        this.tog_view = this.tog_view.bind(this);
        this.tog_delete = this.tog_delete.bind(this);
        this.addGroup = this.addGroup.bind(this);
        this.addContact = this.addContact.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
        this.deleteContact = this.deleteContact.bind(this);
        this.updateGroup = this.updateGroup.bind(this);
        this.uploadContact = this.uploadContact.bind(this);
        this.tog_standard_edit_contact = this.tog_standard_edit_contact.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.editContact = this.editContact.bind(this);
    }

    componentDidMount() {
        this.LoadingBar.continuousStart();
        this.props.activateAuthLayout();
        this.loadGroups();
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
    tog_standard_edit(id) {
        this.setState(prevState => ({
            modal_standard_edit: !prevState.modal_standard_edit,
            edit_id: id,
        }));
        this.removeBodyCss();
    }
    tog_standard_new_contact(id) {
        this.setState(prevState => ({
            modal_standard_new_contact: !prevState.modal_standard_new_contact,
            add_contact_group_id: id,
        }));
        this.removeBodyCss();
    }
    tog_upload(id) {
        this.setState(prevState => ({
            modal_upload: !prevState.modal_upload,
            add_contact_group_id: id,
        }));
        this.removeBodyCss();
    }
    tog_view() {
        this.setState(prevState => ({
            modal_view: !prevState.modal_view
        }));
        this.removeBodyCss();
    }
    tog_delete(id, type) {
        this.setState(prevState => ({
            modal_delete: !prevState.modal_delete,
            delete_sid: id,
            delete_type: type
        }));
        this.removeBodyCss();
    }
    tog_standard_edit_contact(id, type) {
        this.setState(prevState => ({
            modal_standard_edit_contact: !prevState.modal_standard_edit_contact,
        }));
        this.removeBodyCss();
    }
    
    removeBodyCss() {
        document.body.classList.add('no_padding');
    }

    handleUploadFile = (files) => {
        files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            formattedSize: this.formatBytes(file.size)
        }));

        this.setState({ selectedUploadFile: files });
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

    initEditContact(name, mobile, email, id){
        this.setState({edit_contact_name: name, edit_contact_mobile: mobile, edit_contact_email: email, edit_contact_id: id})
        this.tog_standard_edit_contact();
    }

    loadGroups(){

        ServerApi().get(`groups/getGroups/${getLoggedInUser().id}`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }
            
            res.data.map((item, index)=>{
                item.slno = (index+1);
                item.count = item.contactsCount;
                // item.activateDeactivate = <div className="text-center">
                //                             <Switch
                //                               checkedChildren={<CheckOutlined />}
                //                               unCheckedChildren={<CloseOutlined />}
                //                               defaultChecked
                //                             />
                //                             </div>
                item.createdTime = new Date(item.createdTime).toLocaleString('en-US', {hour12: true});
                item.action = <div> 
                                    <Button onClick={()=>this.tog_standard_edit(index)} type="button" color="primary" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-edit"></i></Button>
                                    <Button onClick={()=>this.tog_standard_new_contact(item.id)} type="button" color="info" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-plus"></i></Button>
                                    <Button onClick={()=>this.tog_upload(item.id)} type="button" color="success" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-upload"></i></Button>
                                    <Button onClick={()=>this.loadContacts(item.id)} type="button" color="warning" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-eye"></i></Button>
                                    <Button onClick={()=>this.tog_delete(item.id, 'group')} type="button" color="danger" size="sm" className="waves-effect mb-2"><i className="fa fa-trash"></i></Button>
                                </div>;
                delete item.message;
                return true;
            });  

            let newTableDataRows = [...this.state.tableData.rows];
            newTableDataRows = res.data;
            this.setState({isLoading:false, tableData: {...this.state.tableData, rows: newTableDataRows}});
            this.LoadingBar.complete();
        })
        .catch(error => {
            console.log('error', error);
            this.setState({isLoading: false})
        });
    }

    loadContacts(id){

        ServerApi().get("groups/getContacts/"+id)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }
            
            res.data.map((item, index)=>{
            item.slno = (index+1);
            item.createdTime = <small>{new Date(item.createdOn).toLocaleString('en-US', {hour12: true})}</small>;
                item.action = <div>
                                    <Button onClick={()=>this.initEditContact(item.contactName, item.mobile, item.email, item.id)} type="button" color="primary" size="sm" className="waves-effect mb-2 mr-2"><i className="fa fa-edit"></i></Button>
                                    <Button onClick={()=>this.tog_delete(item.id, 'contact')} type="button" color="danger" size="sm" className="waves-effect mb-2"><i className="fa fa-trash"></i></Button>
                                </div>;
                delete item.message;
                return true;
            });  

            let newTableDataRows = [...this.state.tableDataContacts.rows];
            newTableDataRows = res.data;

            this.setState({isModalLoading: false, tableDataContacts: {...this.state.tableDataContacts, rows: newTableDataRows}});

            this.tog_view();
        })
        .catch(error => console.log('error', error));
    }

    onChangeHandler=event=>{
        this.setState({
          selectedFile: event.target.files[0],
          loaded: 0,
        })
      }

    addGroup(event, values){
        this.setState({isAdding: true});

        var raw = JSON.stringify({
            createdBy: getLoggedInUser().id,
            groupName: values.groupName,
        });

        ServerApi().post("groups/addGroup", raw)
          .then(res => {
            if (res.data.status !== undefined && res.data.status === true) {
                this.props.openSnack({type: 'success', message: 'Group Added.'})
                this.setState({isAdding: false});
            }else{
                this.props.openSnack({type: 'error', message: 'Unable to Add Group.'})
                this.setState({isAdding: false});
            }
            this.tog_standard();
            this.loadGroups();
          })
          .catch(error => console.log('error', error));
    }

    addContact(event, values){
        this.setState({isAdding: true});

        var raw = [
            {
              contactName: values.contactName,
              createdBy: getLoggedInUser().id,
              email: values.email,
              groupId: this.state.add_contact_group_id,
            //   groupName: "MyGroup1",
              mobile: values.mobile
            }
          ]

        ServerApi().post("groups/addContact", raw)
          .then(res => {
            console.log(res);
            if (res.data.status !== undefined && res.data.status === true) {
                this.props.openSnack({type: 'success', message: 'Contact Added.'})
                this.setState({ isAdding: false});
            }else{
                this.props.openSnack({type: 'error', message: 'Unable to add Contact.'})
                this.setState({isAdding: false});
            }
            this.tog_standard_new_contact();
            this.loadGroups();

          })
          .catch(error => console.log('error', error));
    }
    
    editContact(event, values){
        this.setState({isAdding: true});

        let raw = 
            {
              contactName: values.contactName,
              createdBy: getLoggedInUser().id,
              email: values.email,
              id: this.state.edit_contact_id,
              mobile: values.mobile
            };

        ServerApi().post("groups/updateContact", raw)
          .then(res => {
            console.log(res);
            if (res.data.status !== undefined && res.data.status === true) {
                this.props.openSnack({type: 'success', message: 'Contact Updated.'})
                this.setState({ isAdding: false});
            }else{
                this.props.openSnack({type: 'error', message: 'Unable to update Contact.'})
                this.setState({ isAdding: false});
            }
            this.tog_view()
            this.tog_standard_edit_contact();
            this.loadGroups();

          })
          .catch(error => console.log('error', error));
    }

    uploadContact(event, values){
        this.setState({isAdding: true});
        var userData = JSON.parse(localStorage.getItem('user'));

        var formdata = new FormData();
        // console.log(JSON.stringify(raw));
        // formdata.append("request", JSON.stringify(raw));
        formdata.append("contactsfile", this.state.selectedUploadFile[0]);
        // formdata.append("contactsfile", this.state.selectedFile);

        var requestOptions = {
          method: 'POST',
          headers: {'Authorization': 'Bearer '+userData.sessionToken},
          body: formdata,
          redirect: 'follow'
        };
        
        fetch(`${Settings.BASE_URL}groups/uploadContacts/${this.state.add_contact_group_id}/${getLoggedInUser().id}`, requestOptions)
          .then(response => response.json())
          .then(data => {
            if (data.status !== undefined && data.status === true) {
                this.props.openSnack({type: 'success', message: 'Contact Added.'})
                this.setState({isAdding: false});
            }else{
                this.props.openSnack({type: 'error', message: 'Unable to add Contact.'})
                this.setState({isAdding: false});
            }
            // console.log(data);
            this.tog_upload();
            this.loadGroups();

          })
          .catch(error => console.log('error', error));
    }

    updateGroup(event, values){
        this.setState({isAdding: true});

        var raw = JSON.stringify({
            id: this.state.tableData.rows[this.state.edit_id].id,
            groupName: values.groupName,
        });

        ServerApi().post('groups/updateGroup', raw)
          .then(res => {
            if (res.data.status !== undefined && res.data.status === true) {
                this.props.openSnack({type: 'success', message: 'Group Updated.'})
                this.setState({isAdding: false});
            }else{
                this.props.openSnack({type: 'error', message: 'Unable to update SMS Template.'})
                this.setState({isAdding: false});
            }
            // console.log(res.data);
            this.tog_standard_edit();
            this.loadGroups();

          })
          .catch(error => console.log('error', error));
    }

    deleteGroup(){
        if (this.state.delete_sid === "") { return false; }

        this.setState({isAdding: true});

        ServerApi().get('groups/deleteGroup/'+this.state.delete_sid)
          .then(res => {
            if (res.data.status !== undefined && res.data.status === true) {
                this.props.openSnack({type: 'success', message: 'Group Deleted.'})
                this.setState({isAdding: false});
            }else{
                this.props.openSnack({type: 'error', message: 'Unable to delete Group.'})
                this.setState({isAdding: false});
            }

            this.tog_delete();
            this.loadGroups();

          })
          .catch(error => console.log('error', error));
    }

    deleteContact(){
        if (this.state.delete_sid === "") { return false; }

        this.setState({isAdding: true});

        ServerApi().get('groups/deleteContact/'+this.state.delete_sid)
          .then(res => {
            if (res.data.status !== undefined && res.data.status === true) {
                this.props.openSnack({type: 'success', message: 'Contact Deleted.'})
                this.setState({isAdding: false});
            }else{
                this.props.openSnack({type: 'error', message: 'Unable to delete Contact.'})
                this.setState({isAdding: false});
            }

            this.tog_delete();
            this.tog_view();
            this.loadGroups();

          })
          .catch(error => console.log('error', error));
    }

    render() {

        // if (this.state.isLoading) { return(<Empty imageStyle={{marginTop: 100}} description="Loading Data Please Wait..."></Empty>) }

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
                                <h4 className="page-title">GROUPS</h4>
                            </Col>
                            <Col sm="6">
                                <div className="float-right d-none d-md-block">
                                    <Button onClick={this.tog_standard} type="button" color="primary" size="md" className="waves-effect"><i className="fa fa-plus mr-2"></i> Add Group</Button>
                                </div>

                                <Modal isOpen={this.state.modal_standard} toggle={this.tog_standard} >
                                    <ModalBody>
                                        <button type="button" onClick={() => this.setState({ modal_standard_edit: false })} className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                        <h6>Enter Group</h6>
                                       <AvForm onValidSubmit={this.addGroup}>
                                            <AvField placeholder="" 
                                                label ="Group Name"
                                                name="groupName"
                                                type="text" errorMessage="Enter Group Name"
                                                validate={{ required: { value: true } }} 
                                                style={{marginBottom: 5}} />

                                            <Button type="submit" color="success" className="mr-1">
                                                <i className="fa fa-save mr-2"></i> {(this.state.isAdding)?'Please Wait...':'Save'}
                                            </Button>

                                        </AvForm>

                                    </ModalBody>
                                </Modal>

                                <Modal isOpen={this.state.modal_standard_edit} toggle={this.tog_standard_edit} >
                                    <ModalBody>
                                        <button type="button" onClick={() => this.setState({ modal_standard_edit: false })} className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                        <h6>Update Group</h6>
                                        {this.state.modal_standard_edit &&
                                        <AvForm onValidSubmit={this.updateGroup}>
                                            <AvField placeholder="" 
                                                label ="Group Name"
                                                name="groupName"
                                                value={this.state.tableData.rows[this.state.edit_id].groupName}
                                                type="text" errorMessage="Enter Group Name"
                                                validate={{ required: { value: true } }} 
                                                style={{marginBottom: 5}} />

                                            <Button type="submit" color="success" className="mr-1">
                                                <i className="fa fa-save mr-2"></i> {(this.state.isAdding)?'Please Wait...':'Update'}
                                            </Button>

                                        </AvForm>
                                        }

                                    </ModalBody>
                                </Modal>

                                <Modal isOpen={this.state.modal_standard_new_contact} toggle={this.tog_standard_new_contact} >
                                    <ModalBody>
                                        <button type="button" onClick={() => this.setState({ modal_standard_new_contact: false })} className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                        <h6>Add Contact</h6>
                                        
                                        <AvForm onValidSubmit={this.addContact}>
                                            <AvField placeholder="" 
                                                label ="Contact Name"
                                                name="contactName"
                                                type="text" errorMessage="Enter Contact Name"
                                                validate={{ required: { value: true } }} 
                                                style={{marginBottom: 5}} />

                                            <AvField placeholder="" 
                                                label ="Contact Mobile Number"
                                                name="mobile"
                                                type="number" 
                                                errorMessage="Enter Valid Mobile Number"
                                                validate={{ 
                                                    required: { value: true },
                                                    pattern: {value: '^[0-9]'},
                                                    minLength: {value: 10, errorMessage: 'Mobile Number must be of length 10.'},
                                                    maxLength: {value: 10, errorMessage: 'Mobile Number must be of length 10.'} 
                                                }} 
                                                style={{marginBottom: 5,}} />

                                            <AvField placeholder="" 
                                                label ="Contact Email Id"
                                                name="email"
                                                type="text" errorMessage="Enter Contact Email Id"
                                                validate={{ required: { value: false } }} 
                                                style={{marginBottom: 5}} />

                                            <input 
                                                name="groupId"
                                                value={this.state.add_contact_group_id}
                                                type="hidden"
                                                validate={{ required: { value: true } }} 
                                                style={{marginBottom: 5}} />

                                            <Button type="submit" color="success" className="mr-1">
                                                <i className="fa fa-save mr-2"></i> {(this.state.isAdding)?'Please Wait...':'Add Contact'}
                                            </Button>

                                        </AvForm>

                                    </ModalBody>
                                </Modal>

                                <Modal isOpen={this.state.modal_standard_edit_contact} toggle={this.tog_standard_edit_contact} >
                                    <ModalBody>
                                        <button type="button" onClick={() => this.setState({ modal_standard_edit_contact: false })} className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                        <h6>Edit Contact</h6>
                                        
                                        <AvForm onValidSubmit={this.editContact}>
                                            <AvField placeholder="" 
                                                label ="Contact Name"
                                                name="contactName"
                                                value={this.state.edit_contact_name}
                                                type="text" errorMessage="Enter Contact Name"
                                                validate={{ required: { value: true } }} 
                                                style={{marginBottom: 5}} />

                                            <AvField placeholder="" 
                                                label ="Contact Mobile Number"
                                                name="mobile"
                                                value={this.state.edit_contact_mobile}
                                                type="text" errorMessage="Enter Contact Mobile Number"
                                                validate={{ required: { value: true } }} 
                                                style={{marginBottom: 5}} />

                                            <AvField placeholder="" 
                                                value={this.state.edit_contact_email}
                                                label ="Contact Email Id"
                                                name="email"
                                                type="text" errorMessage="Enter Contact Email Id"
                                                validate={{ required: { value: false } }} 
                                                style={{marginBottom: 5}} />

                                            <Button type="submit" color="success" className="mr-1">
                                                <i className="fa fa-save mr-2"></i> {(this.state.isAdding)?'Please Wait...':'Save '}
                                            </Button>

                                        </AvForm>

                                    </ModalBody>
                                </Modal>

                                <Modal isOpen={this.state.modal_upload} toggle={this.tog_upload} >
                                    <ModalBody>
                                        <button type="button" onClick={() => this.setState({ modal_upload: false })} className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                        <h6>Contacts</h6>
                                        <AvForm onValidSubmit={this.uploadContact}>
                                            <Dropzone onDrop={acceptedFiles => this.handleUploadFile(acceptedFiles)}>
                                                {({ getRootProps, getInputProps }) => (
                                                    <div className="dropzone">
                                                        <div className="dz-message needsclick" {...getRootProps()}>
                                                            <input {...getInputProps()} />
                                                            <h6 className="font-12">Upload File *</h6>
                                                        </div>
                                                    </div>
                                                )}
                                            </Dropzone>

                                            <a download href="/samples/contacts.xlsx" >Download Sample File</a>

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
                                            {/*<AvField placeholder="" 
                                                label ="Upload file"
                                                name="contactsfile"
                                                type="file" errorMessage="Upload File"
                                                validate={{ required: { value: true } }} 
                                                style={{marginBottom: 5}} />
                                                style={{marginBottom: 5}} 
                                                onChange={this.onChangeHandler} />*/}

                                            <Button 
                                                disabled={(this.state.isAdding || this.state.selectedUploadFile.length === 0)}
                                              type="submit" color="success" className="mr-1 text-center">
                                                <i className="fa fa-save mr-2"></i> {(this.state.isAdding)?'Please Wait...':'Add'}
                                            </Button>

                                        </AvForm>

                                    </ModalBody>
                                </Modal>

                                <Modal large isOpen={this.state.modal_view} toggle={this.tog_view} >
                                    <ModalBody>
                                        <button type="button" onClick={() => this.setState({ modal_view: false })} className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                        <h6>Contacts</h6>

                                        {(this.state.isModalLoading)
                                        ?<Empty imageStyle={{marginTop: 20}} description="Loading Data Please Wait..."></Empty>
                                        :<MDBDataTable
                                            sortable
                                            responsive
                                            striped
                                            hover
                                            bordered
                                            btn
                                            small
                                            autoWidth
                                            data={this.state.tableDataContacts}
                                            footer={false}
                                            foot={false}
                                        />
                                        }


                                    </ModalBody>
                                </Modal>

                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>

                                    <MDBDataTable
                                        sortable
                                        responsive
                                        striped
                                        exportToCSV
                                        theadColor
                                        bordered
                                        btn
                                        hover
                                        displayEntries={true}
                                        data={this.state.tableData}
                                        footer={false}
                                        foot={false}
                                    />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        <ModalBody>
                            <button type="button" onClick={() => this.setState({ modal_delete: false })} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h6 className="text-center">Are You Sure You want to delete ?</h6>

                            <FormGroup className="mt-5 text-center">
                                <Button onClick={this.state.delete_type === 'group' ? this.deleteGroup : this.deleteContact} type="button" color="danger" className="mr-1">
                                    Delete
                                </Button>
                                <Button type="button" color="secondary" className="mr-1" onClick={() => this.setState({ modal_delete: false })} data-dismiss="modal" aria-label="Close">
                                    Cancel
                                </Button>
                            </FormGroup >

                        </ModalBody>
                    </Modal>

                    {this.state.success_msg &&
                        <SweetAlert
                            style={{margin: 'inherit'}}
                            title={this.state.success_message}
                            type={this.state.modalType}
                            confirmBtnBsStyle="success"
                            onConfirm={() => this.setState({ success_msg: false })} >
                        </SweetAlert> 
                    }

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout, openSnack })(Groups));