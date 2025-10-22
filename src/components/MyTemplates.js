import React, { Component } from 'react';
import { Col, Card, CardBody } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';

class MyTemplates extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTemplateId: '',
            templateBased: false,
            smsTemplate: 1,
            anchorEl: null,
            fullMessage: '',
            modalFullMessage: false,
        };
    }

    render() {

        return (
            <Col lg="6" >
                <Card>
                    <CardBody className="hide-scroll" style={{height: '603px', overflow: 'scroll', background: '#ecebebad'}}>
                        <h4 className="mt-0 mb-3 header-title">Templates</h4>

                        {/* eslint-disable-next-line array-callback-return */}
                        {this.props.templates.map((template, index) => {
                            return <div onClick={()=>this.props.pickedTemplate(template.id)} style={{cursor: 'pointer', marginLeft:(index%2===0)?'0':'auto'}} className="mt-2 mb-3 pl-2 pr-2 w-75">
                                <div class={((index%2===1)?'talk-bubble2 tri-right left-top':'talk-bubble3 tri-right right-top')}>
                                    <label className="pt-3 ml-3" style={{borderBottom: '1px dashed grey'}}><b>{template.templateName}</b></label>

                                    <div class="talktext p-3">
                                        <p style={{fontSize: 16}}>{(template.message.length > 64)?<>{template.message.slice(0, 64)} <span style={{cursor: 'pointer', color: 'blue'}} onClick={(e)=>this.setState({anchorEl:e.currentTarget, modalFullMessage: true, fullMessage: template.message})} aria-describedby="full-message">... read more</span></>:template.message}</p>
                                    </div>
                                </div>
                            </div>
                        })}
                    </CardBody>
                </Card>

                <Popover
                        id="price-breakdown"
                        open={this.state.modalFullMessage}
                        anchorEl={this.state.anchorEl}
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
                        <div style={{maxWidth: 540}} className="p-3">
                            <Typography component="h6" variant="caption" style={{borderBottom: '1px dashed grey'}} className="mb-2 text-center">
                                SMS Template
                            </Typography>

                            <Typography variant="body2" className="text-muted">{this.state.fullMessage}</Typography>
                        </div>
                    </Popover>

            </Col>
        );
    }
}
  

export default withRouter(MyTemplates);