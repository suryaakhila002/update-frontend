import React, { useState, useEffect } from 'react';
// REMOVED: import { FormGroup, Row, Col } from 'reactstrap';
import "react-datepicker/dist/react-datepicker.css";
import '../../utils/Languages.css'
import axios from 'axios';
import {useDispatch} from 'react-redux';
import {
    Select, 
    MenuItem, 
    FormControl, 
    TextField, // New: For message input
    Grid,      // New: For responsive layout (replaces Row/Col)
    Box,       // New: For container/spacing (replaces FormGroup)
    InputLabel, // New: For labels
    Typography // New: For captions/status text
} from '@mui/material';
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
    { label: "ଓଡ଼ିଆ", value: "or-t-i0-und"}, // Corrected label for Oriya/Odia
    { label: "فارسی", value: "fa-t-i0-und"}, // Corrected label for Farsi/Persian
    { label: "ਪੰਜਾਬੀ", value: "pu-t-i0-und"},
    { label: "संस्कृत", value: "sa-t-i0-und"}, // Corrected label for Sanskrit
    { label: "اردو", value: "ur-t-i0-und"},
];

export default function Message(props){
    const dispatch = useDispatch();

    const [messageText, setMessageText] = useState('');
    const [messageType, setMessageType] = useState('1'); // '1' or 'Plain' or 'Unicode'
    const [messageTypeStr, setMessageTypeStr] = useState('1'); // Language code for select input
    const [availableText, setAvailableText] = useState(160); 
    const [messageTypeUnicode, setMessageTypeUnicode] = useState('');
    const [messageCount, setMessageCount] = useState(0);
    

    useEffect(()=>{
        const checkMessageLength=()=>{
            let messageLength = messageText.length;
    
            // Determine the character limit per message based on type
            // GSM (Plain/English): 160 (153 for subsequent messages)
            // Unicode: 70 (67 for subsequent messages)
            
            const firstMsgLimit = (messageType === "1") ? 160 : 70;
            const subsequentMsgLimit = (messageType === "1") ? 153 : 67;

            if(messageLength > firstMsgLimit){
                // Calculate length beyond the first message
                let remainingLength = messageLength - firstMsgLimit;
                
                // Calculate messages count: 1 (first message) + ceil(remaining / subsequent limit)
                let messageCount = 1 + Math.ceil(remainingLength / subsequentMsgLimit);
                
                // Calculate available text until the next message boundary
                let usedInLastMsg = remainingLength % subsequentMsgLimit;
                let available = subsequentMsgLimit - usedInLastMsg;
                
                setAvailableText(available);
                setMessageCount(messageCount);
            } else {
                setAvailableText(firstMsgLimit - messageLength);
                setMessageCount(messageLength === 0 ? 0 : 1);
            }
        };
        checkMessageLength();
    },[messageText, messageType])

    const handleSelectLanguage=(event)=>{
        const languageValue = event.target.value;
        let languageType = 'Plain';
        if(languageValue !== "1"){
            languageType = 'Unicode';
        }

        setMessageTypeUnicode(languageValue);
        setMessageType(languageType);
        setMessageTypeStr(languageValue);

        // Update Redux state via dispatch
        dispatch({type: 'update_sms_type', payload: languageType});
    }

    const transliterateMessage=(e)=>{
        const currentValue = e.target.value;
        setMessageText(currentValue);
        props.messageHandler(currentValue); // Update parent component immediately

        // Only transliterate if in Unicode mode and spacebar is pressed
        if(messageType !== "1" && e.keyCode === 32){
            axios.get(`https://inputtools.google.com/request?text=${currentValue}&itc=${messageTypeUnicode}&num=8&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`)
            .then(res=>{
                try{
                    // Assuming the structure is res.data[1][0][1][0]
                    const translatedText = res.data[1][0][1][0];
                    if (translatedText) {
                        setMessageText(translatedText + ' ');
                        props.messageHandler(translatedText + ' ');
                    }
                }catch(e){
                    console.error("Transliteration parsing error:", e);
                }
            })
            .catch(err => console.error("Transliteration API error:", err));
        }
    }

    useEffect(()=>{
        setMessageText(props.messageText || ''); // Ensure controlled component value is set from props
    },[props.messageText])

    return (
        <Box sx={{ width: '100%' }}>
            {
                !props.noExtraOptions &&
                <Box 
                    sx={{ 
                        mb: 2, 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        alignItems: 'center' 
                    }}
                > 
                    <InputLabel id="language-select-label" sx={{ mr: 1, color: 'text.secondary' }}>Language</InputLabel>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                            id="language-select"
                            labelId="language-select-label"
                            value={messageTypeStr}
                            onChange={handleSelectLanguage}
                        >
                            {LANGUAGES.map((i)=>{
                                return <MenuItem key={i.value} value={i.value}>{i.label}</MenuItem>
                            })}
                        </Select>
                    </FormControl>
                </Box>
            }

            <FormControl fullWidth margin="normal">
                {/* Custom label styling to mimic the original layout */}
                <Typography variant="subtitle1" component="label" sx={{ mb: 1 }}>
                    MESSAGE
                </Typography>
                
                <TextField
                    name="unicodeMessage"
                    id="messageTextArea"
                    multiline
                    rows={4} 
                    variant="outlined"
                    fullWidth
                    value={messageText}
                    onKeyUp={transliterateMessage} 
                    onFocus={props.savedMessageHandler} 
                />
            </FormControl>

            {/* CHARACTER COUNT & URL SHORTENER (Replaces Row/Col) */}
            <Grid container alignItems="center" sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary" sx={{ ml: 1, display: 'block' }}>
                        {availableText}{' '}CHARACTERS REMAINING{' '} 
                        <Typography component="span" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                            {' '}
                            {messageCount}{' '}Message (s)
                        </Typography>
                    </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                    {
                        !props.noExtraOptions &&
                        <UrlShortner />
                    }
                </Grid>
            </Grid>
        </Box>
    );
}
