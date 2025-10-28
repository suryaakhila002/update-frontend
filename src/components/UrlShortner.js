import React, { Component } from 'react';
import { Button, Label, ModalBody, Modal } from 'reactstrap';
import Alert from '@mui/material/Alert';
import MButton from '@mui/material/Button';
import {Paper, Tabs, Tab} from '@mui/material';
import axios from 'axios';

class UrlShortner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            urlShortnerModal: false,
            urlShortening: false,
            shortUrl: '',
            activeTab: 0,
            selectedFile: null,
        };
        this.shortenUrl = this.shortenUrl.bind(this);
        this.copyText = this.copyText.bind(this);
        this.changeTab = this.changeTab.bind(this);
    }

    shortenUrl(){
        this.setState({urlShortening: true});

        if(this.state.activeTab === 0){
            axios.get(`http://atsurl.in/api/?key=RLks0rboYd7a&url=${encodeURIComponent(this.state.longUrl)}`)
            .then(res=>{
                this.setState({shortUrl: res.data.short, urlShortening: false});
            })
            .catch(e=>{
                console.log(e);
                this.setState({urlShortening: false});
            });
        }else{
            const formData = new FormData(); 
            formData.append('key', 'RLks0rboYd7a');
            formData.append( 
                "image", 
                this.state.selectedFile, 
                this.state.selectedFile.name 
            ); 
            
            axios.post("http://atsurl.in/api/uploadImage?key=RLks0rboYd7a", formData)
            .then(res=>{
                if(res.data.success){
                    this.setState({shortUrl: res.data.short.short, urlShortening: false});
                }else{
                    alert(res.data.message);
                    this.setState({shortUrl: '', urlShortening: false});
                }
            })
            .catch(e=>console.log(e));
        }
    }

    copyText(){
        navigator.clipboard.writeText(this.state.shortUrl)
        alert("Short Url Copied.");
    }

    changeTab(e, val){
        console.log(val);
        this.setState({activeTab: val})
    }

    render() {

        return (
            <React.Fragment>

                <Button title="URL Shortner" onClick={()=>this.setState({urlShortnerModal: true})} size="sm" type="button" color="primary" className="ml-1 float-right">
                    <i className="fa fa-link"></i>
                </Button>


                
                <Modal centered isOpen={this.state.urlShortnerModal} toggle={this.tog_delete} >
                    <ModalBody>
                        {/* <button type="button" onClick={() => this.setState({ urlShortnerModal: false })} className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button> */}

                        <Paper square>
                            <Tabs
                                value={this.state.activeTab}
                                indicatorColor="primary"
                                textColor="primary"
                                onChange={this.changeTab}
                                aria-label="disabled tabs example"
                            >
                                <Tab label="Url Shortner" />
                                <Tab label="Upload Image" />
                            </Tabs>
                        </Paper>

                        {(this.state.activeTab === 0)? 
                            <div style={{padding: 20}}>
                            <Label>Long URL</Label>
                            <input type="url" className="form-control" name="url" onChange={e=>this.setState({shortUrl: '', longUrl: e.target.value})} />

                            {(this.state.shortUrl !== '')? 
                            <Alert
                                className="mt-3"
                                action={
                                <MButton onClick={(e)=>this.copyText(e)} color="inherit" size="small">
                                    Copy
                                </MButton>
                                }
                            >
                                {this.state.shortUrl}
                            </Alert>
                            :null}
                            </div>
                            :null
                        }

                        {(this.state.activeTab === 1)? 
                            <div style={{padding: 20}}>
                            <Label>Upload Image</Label>
                            <input onChange={e=>{this.setState({ selectedFile: e.target.files[0] })}} className="form-control" name="image" type="file" />

                            {(this.state.shortUrl !== '')? 
                            <Alert
                                className="mt-3"
                                action={
                                <MButton onClick={(e)=>this.copyText(e)} color="inherit" size="small">
                                    Copy
                                </MButton>
                                }
                            >
                                {this.state.shortUrl}
                            </Alert>
                            :null}
                            </div>
                            :null
                        }

                        

                        <Button type="button" color="secondary" className="mr-1 mt-3" onClick={() => this.setState({ urlShortnerModal: false })} data-dismiss="modal" aria-label="Close">
                            Close
                        </Button>
                        <Button type="button" disabled={this.state.urlShortening} color="primary" className="mr-1 mt-3" onClick={() => this.shortenUrl()} >
                            {(this.state.urlShortening)?'Please Wait...':'Shorten'}
                        </Button>

                    </ModalBody>
                </Modal>

            </React.Fragment>
        );
    }
}

export default UrlShortner;