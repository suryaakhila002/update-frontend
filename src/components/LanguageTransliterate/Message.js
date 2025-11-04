import React, { useState, useEffect } from 'react';
import { FormGroup, Row, Col } from 'reactstrap';
import { AvField } from 'availity-reactstrap-validation';
import "react-datepicker/dist/react-datepicker.css";
import '../../utils/Languages.css'
// import googleTransliterate from 'google-input-tool';
import axios from 'axios';
import {useDispatch} from 'react-redux';
import {Select, MenuItem, FormControl} from '@mui/material';
import UrlShortner from '../UrlShortner';

const LANGUAGES = [
    { label: "English", value: "1"},
    { label: "हिंदी", value: "hi-t-i0-und"},
    { label: "తెలుగు", value: "te-t-i0-und"},
    { label: "தமிழ்", value: "ta-t-i0-und"},
    { label: "বাঙ্গালী", value: "bn-t-i0-und"},
    { label: "ગુજરાતી", value: "gu-t-i0-und"},
    { label: "ಕನ್ನಡ", value: "kn-t-i0-und"},
    { label: "മലയാളം", value: "ml-t-i0-und"},
    { label: "मराठी", value: "mr-t-i0-und"},
    { label: "नेपाली", value: "ne-t-i0-und"},
    { label: "ନୀୟ", value: "or-t-i0-und"},
    { label: "ارسیان", value: "fa-t-i0-und"},
    { label: "ਪੰਜਾਬੀ", value: "pu-t-i0-und"},
    { label: "षन्स्क्रित्", value: "sa-t-i0-und"},
    { label: "اردو", value: "ur-t-i0-und"},
];

export default function Message(props){
    const dispatch = useDispatch();

    const [messageText, setMessageText] = useState('');
    const [messageType, setMessageType] = useState('1');
    const [messageTypeStr, setMessageTypeStr] = useState('1');
    const [availableText, setAvailableText] = useState(160); 
    const [messageTypeUnicode, setMessageTypeUnicode] = useState('');
    const [messageCount, setMessageCount] = useState(0);
    // const [remaningCharacters, setRemaningCharacters] = useState(160);

    useEffect(()=>{
        const checkMessageLength=()=>{
            let messageLength = messageText.length;
    
            if(messageLength > 160){
                let remaning = (messageType === "1")?153:67;
                let messageCount = parseInt(messageLength/remaning)+1;
                setAvailableText(parseInt((messageCount*153) - messageLength));
                // setRemaningCharacters(remaning)
                if(messageLength <= 1000){
                    setMessageCount(messageCount);
                }else{
                    setMessageCount(messageCount+1);
                }
            }else{
                let remaning = (messageType === "1")?160:70;
                setAvailableText(parseInt(remaning - messageLength));
                setMessageCount(1);
            }
        };
        checkMessageLength();
    },[messageText, messageType])

    const handleSelectLanguage=(event)=>{
        let language = 'Plain';
        if(event.target.value !== "1"){
            language = 'Unicode';
        }

        setMessageTypeUnicode(event.target.value);
        setMessageType(language);
        setMessageTypeStr(event.target.value);
        // setAvailableText((event.target.value !== "1")?49:160);

        dispatch({type: 'update_sms_type', payload: language});
    }

    const transliterateMessage=(e)=>{
        if(messageType === "1") {
            setMessageText(e.target.value);
            props.messageHandler(e.target.value);
            return;
        }

        if(e.keyCode === 32){
            axios.get(`https://inputtools.google.com/request?text=${e.target.value}&itc=${messageTypeUnicode}&num=8&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`)
            .then(res=>{
                // console.log('res------')
                // console.log(res.data[1][0][1][0])
                try{
                    setMessageText(res.data[1][0][1][0]+' ');
                    // this.setState({messageText: res.data[1][0][1][0]+' '});
                    props.messageHandler(res.data[1][0][1][0]+' ');
                }catch(e){
                    console.log(e);
                }
            })
        }
    }

    useEffect(()=>{
        setMessageText(props.messageText);
    },[props.messageText])

    return (
        <div>
            {
                !props.noExtraOptions &&
            <div className="languageSelection mb-2 float-right"> 
                {/* <Dropdown options={LANGUAGES} 
                    onChange={this.handleSelectLanguage} 
                    value={this.state.messageTypeStr}
                    placeholder="Select an option" /> */}
                {/* <InputLabel id="language-select-label">English</InputLabel> */}
                <FormControl>
                    <Select
                        id="language-select"
                        labelId="language-select-label"
                        placeholder="English"
                        label="English"
                        value={messageTypeStr}
                        onChange={handleSelectLanguage}
                        >
                        {LANGUAGES.map((i)=>{
                            return <MenuItem value={i.value}>{i.label}</MenuItem>
                        })}
                    </Select>
                </FormControl>

            </div>
            }

            <FormGroup >
                <label className="pt-3">MESSAGE</label>
                
                    <AvField name="unicodeMessage" label=""
                        id="messageTextArea"
                        rows={4} 
                        type="textarea" 
                        className="mb-0" 
                        value={messageText}
                        onKeyUp = { transliterateMessage }  
                        onFocus={ props.savedMessageHandler } 
                        // validate={{ required: {  value: this.state.messageType === "2"  ? true : false } }} 
                    />

                <Row>
                    <Col md="12">
                        <span className="ml-2 mt-0 caption">
                                
                                {/* {(availableText * parseInt(messageText.length/availableText)) - messageText.length}  */}
                                {availableText}{' '}CHARACTERS REMAINING{' '} 
                            <span className="text-success">
                                {' '}
                                {messageCount}{' '}Message (s)
                            </span>
                        </span>
                        
                        {
                            !props.noExtraOptions &&
                            <UrlShortner />
                        }
                    </Col>
                </Row>
            </FormGroup>
        </div>
    );
}

// const mapStatetoProps = state => {
//     const {sms_type} = state.Sms;
//     return { sms_type };
//   }
  

// export default withRouter(connect(mapStatetoProps, { updateSmsType })(Message));
