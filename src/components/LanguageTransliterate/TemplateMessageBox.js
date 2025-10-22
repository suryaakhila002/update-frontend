import React, { useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import 'react-dropdown/style.css'
import '../../utils/Languages.css'
// import googleTransliterate from 'google-input-tool';
import axios from 'axios';
import { Row, Col} from 'reactstrap';
import {useDispatch} from 'react-redux';
import {Select, MenuItem, FormControl} from '@material-ui/core';
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

export default function TemplateMessageBox(props){
    const dispatch = useDispatch();

    // const [messageText, setMessageText] = useState('');
    const [messageType, setMessageType] = useState('Plain');
    const [messageTypeStr, setMessageTypeStr] = useState('1');
    // const [availableText, setAvailableText] = useState(160); 
    const [messageTypeUnicode, setMessageTypeUnicode] = useState('');
    // const [messageCount, setMessageCount] = useState(0);
    const [variableValues, setVariableValues] = useState({});
    const [key, setKey] = useState(0);

    // const [remaningCharacters, setRemaningCharacters] = useState(160);

    // useEffect(()=>{
    //     const checkMessageLength=()=>{
    //         let messageLength = messageText.length;
    
    //         if(messageLength > 160){
    //             let remaning = (messageType === "1")?153:67;
    //             let messageCount = parseInt(messageLength/remaning)+1;
    //             setAvailableText(parseInt((messageCount*153) - messageLength));
    //             // setRemaningCharacters(remaning)
    //             if(messageLength <= 1000){
    //                 setMessageCount(messageCount);
    //             }else{
    //                 setMessageCount(messageCount+1);
    //             }
    //         }else{
    //             let remaning = (messageType === "1")?160:70;
    //             setAvailableText(parseInt(remaning - messageLength));
    //             setMessageCount(1);
    //         }
    //     };
    //     checkMessageLength();
    // },[messageText, messageType])

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

    const transliterateMessage=(name, value)=>{
        if(key === 32){
            axios.get(`https://inputtools.google.com/request?text=${value}&itc=${messageTypeUnicode}&num=8&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`)
            .then(res=>{
                // console.log('res------')
                // console.log(res.data[1][0][1][0])
                try{
                    // setMessageText(res.data[1][0][1][0]+' ');
                    console.log(res.data[1][0][1][0]+' ')
                    combineMessage(name, res.data[1][0][1][0]+' ')
                    // return res.data[1][0][1][0]+' ';
                    // setState({messageText: res.data[1][0][1][0]+' '});
                    // props.messageHandler(res.data[1][0][1][0]+' ');
                }catch(e){
                    console.log(e);
                }
            })
        }else{
            combineMessage(name, value)
        }
    }

    // useEffect(()=>{
    //     setMessageText(props.messageText);
    // },[props.messageText])

    const handleTemplateVarInput=(e)=>{
        let name = e.target.name
        let value = e.target.value

        if(messageType === 'Unicode'){
            transliterateMessage(name, value);
        }else{
            combineMessage(name, value)
        }
    }

    const combineMessage=(name, value)=>{
        let newVariableValues = {...variableValues, [name]: value}

        setVariableValues(newVariableValues)

        let tVars = props.templates.filter(i=>i.id===props.selectedTemplateId)[0].message.split('{#var#}');
        let combinedMessage="";
        // eslint-disable-next-line array-callback-return
        tVars.map((i, index)=>{
            if(i!==""){
                combinedMessage=combinedMessage+i+newVariableValues["var"+(index+1)];
            }
        });

        props.setCombinedMessage(combinedMessage);
    }

    return (
        <Row>
            <Col md="12">
                <div className="languageSelection mb-2 float-right"> 
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
            </Col>

            <Col md="12">
                <label className="pt-3">MESSAGE</label>
                <div className="bg-white mt-4 mb-4 pl-2 pr-2 w-100 pb-4">
                    <div class="talk-bubble tri-right btm-right">
                        <div class="talktext p-4">
                            {props.selectedTemplateId !== '' && (
                                // eslint-disable-next-line array-callback-return
                                <p>{props.templates.filter(i=>i.id===props.selectedTemplateId)[0].message.split('{#var#}').map((i, index)=>{
                                    if(i!==""){
                                        return (<span key={i}>{i} 
                                        <input
                                          size="1" 
                                          value={variableValues["var"+(index+1)]||''} 
                                          type="text" 
                                          onKeyDown={(e)=>setKey(e.keyCode)} 
                                          onChange={handleTemplateVarInput.bind(i)} 
                                          style={{width: ((variableValues["var"+(index+1)]===undefined)?10:variableValues["var"+(index+1)].length+1)*9}} 
                                          className="form-control mb-2 line-input" 
                                          name={"var"+(index+1)} 
                                          placeholder={"var"+(index+1)} /></span>);
                                    }
                                })}</p>
                            )}
                        </div>
                    </div>
                </div>
            </Col>


            <Col md="12">
                <span className="ml-2 mt-0 caption">
                        
                        {/* {(availableText * parseInt(messageText.length/availableText)) - messageText.length}  */}
                        {0}{' '}CHARACTERS REMAINING{' '} 
                    <span className="text-success">
                        {' '}
                        {0}{' '}Message (s)
                    </span>
                </span>
                
                <UrlShortner />
            </Col>
        </Row>
    );
}

