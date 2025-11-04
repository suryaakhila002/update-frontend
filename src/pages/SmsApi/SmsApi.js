import React, { useState, useEffect } from 'react';
// REMOVED: import { Container, Row, Col, Card, CardBody, Label } from 'reactstrap';
// REMOVED: import { FormControl } from 'availity-reactstrap-validation';
import { useDispatch } from 'react-redux';
import {Input, Button,Table,Modal,Radio} from 'antd'; // RETAINED: Ant Design components
import { RetweetOutlined } from '@ant-design/icons';
import {ServerApi} from '../../utils/ServerApi';

// --- MUI Imports ---
import {
    Box,
    Grid,
    Paper,
    Typography,
    InputLabel,
} from '@mui/material';
// --- END MUI Imports ---

const { Search } = Input;

const columns = [
    {
        title: 'SL' ,
        dataIndex: 'slno',
        sorter: {
            compare: (a, b) => a.slno - b.slno,
            multiple: 1,
        },
    },
    {
        title: 'Key Id' ,
        dataIndex: 'keyId',
    },
    {
        title: 'Created At',
        dataIndex: 'createdAt',
        sorter: {
            compare: (a, b) => a.createdTime - b.createdTime,
            multiple: 1,
        },
    },
    {
        title: 'Expiry',
        dataIndex: 'expiry',
    },
    {
        title: 'Action',
        dataIndex: 'action',
    }
];

export default function SmsApi(props){

    const dispatch = useDispatch();

    const [modalVisible, setModalVisible] = useState(false);
    const [key, setKey] = useState('Y2xpZW50OmNsaWVudC5wYXNzd29yZA');
    const [consumptionType, setConsumptionType] = useState('Submit');

    // NOTE: tableRoes should ideally be state or derived from state, 
    // but preserving the original structure for compatibility
    const tableRoes = [
        {
            slno: 1,
            keyId: key,
            createdAt: '',
            expiry: '',
            // Action button uses AntD Button
            action: <Button onClick={()=>setModalVisible(true)} size="small" icon={<RetweetOutlined />} type="primary">Regenerate Key</Button>,
        }
    ];

    useEffect(()=>{
        dispatch({type: 'auth_layout', payload:{topbar: true,sidebar: true,footer: true,layoutType: 'Auth'}})
    },[dispatch])

    useEffect(()=>{
        fetchMyApiKey()
    },[])

    const fetchMyApiKey=()=>{
        ServerApi().get('client/getApiKey')
        .then(res=>{
            setKey(res.data.response);
        })
    }

    // Updated to accept consumptionType, though not used in the mock API call
    const generateNewApiKey=(type = 'Submit')=>{ 
        ServerApi().get('client/generateApiKey')
        .then(res=>{
            setKey(res.data.response);
            dispatch({type: 'open_snack', payload: 'New API Key Generated.'})
        })
    }
    
    // AntD Modal handler needs to call key generation on Ok
    const handleModalOk = () => {
        generateNewApiKey(consumptionType);
        setModalVisible(false);
    };

    return (
        <Box sx={{ p: 3 }}> {/* MUI Box replaces Container fluid */}
            {/* Page Title Box */}
            <Box sx={{ mb: 4 }}>
                <Grid container alignItems="center">
                    <Grid item xs={12}>
                        <Typography variant="h4" component="h1">SMS API</Typography>
                    </Grid>
                </Grid>
            </Box>

            <Grid container spacing={3}>
                {/* API Key Table (Full Width) */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 2 }}> {/* MUI Paper replaces Card/CardBody */}
                        <Table columns={columns} dataSource={tableRoes} size="small" />

                        {/* AntD Modal is retained */}
                        <Modal
                            title="Roll Key"
                            centered
                            visible={modalVisible}
                            onOk={handleModalOk} // Calls generation and closes
                            onCancel={() => setModalVisible(false)}
                        >
                            <Box sx={{ p: 1 }}> {/* MUI Box replaces div.p-3 */}
                                <Radio.Group onChange={e=>setConsumptionType(e.target.value)} 
                                    name="consumptionType" 
                                    value={consumptionType}>
                                    {/* AntD Radio elements */}
                                    <Radio value={'Submit'} style={{ display: 'block', marginBottom: 8 }}>De-activate Old Key Immediately</Radio>
                                    <Radio value={'Delivery'} style={{ display: 'block' }}>De-activate old key in 24 hours</Radio>
                                </Radio.Group>
                            </Box>
                        </Modal>
                    </Paper>
                </Grid>

                {/* LEFT COLUMN: API Key Management (MUI Grid replaces Row/Col) */}
                <Grid item xs={12} lg={5}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                        
                        <Box> {/* MUI Box replaces Availity FormControl */}
                            <InputLabel sx={{ mt: 2, mb: 1, display: 'block' }}>SMS API KEY</InputLabel>

                            {/* AntD Search input is retained */}
                            <Search
                                placeholder="SMS API KEY"
                                enterButton="Generate New"
                                size="large"
                                value={key}
                                // Open the modal on button click
                                onSearch={()=>setModalVisible(true)} 
                                readOnly
                            />
                        </Box>

                    </Paper>
                </Grid>


                {/* RIGHT COLUMN: API Details (MUI Grid replaces Col) */}
                <Grid item xs={12} lg={7}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>SMS API DETAILS</Typography>

                        <InputLabel sx={{ mt: 2, display: 'block' }}>SMS API KEY:</InputLabel>
                        <Typography component="p" color="text.secondary" sx={{ mb: 2, wordBreak: 'break-all' }}>{key}</Typography>

                        <InputLabel sx={{ display: 'block' }}>SMS API URL FOR TEXT/PLAIN SMS:</InputLabel>
                        <Typography component="p" color="text.secondary" sx={{ mb: 2, wordBreak: 'break-all' }}>http://165.232.177.52:8090/sms/api?action=send-sms&username=USERNAME&password=PASSWORD&to=phone&from=SENDER_ID&templateId=&sms=message&unicode=0</Typography>

                        <InputLabel sx={{ display: 'block' }}>SMS API URL FOR UNICODE SMS:</InputLabel>
                        <Typography component="p" color="text.secondary" sx={{ wordBreak: 'break-all' }}>http://165.232.177.52:8090/sms/api?action=send-sms&username=USERNAME&password=PASSWORD&to=phone&from=SENDER_ID&templateId=&sms=message&unicode=1</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
