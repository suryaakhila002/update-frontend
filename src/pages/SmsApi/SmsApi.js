import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Label } from 'reactstrap';
// import Select from 'react-select';
import { FormControl } from 'availity-reactstrap-validation';
import { useDispatch } from 'react-redux';
import {Input, Button,Table,Modal,Radio} from 'antd';
import { RetweetOutlined } from '@ant-design/icons';
import {ServerApi} from '../../utils/ServerApi';

const { Search } = Input;

// const SMS_GATEWAY = [
//     {
//         options: [
//             { label: "Twilio", value: "Twilio" },
//         ]
//     }
// ];

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
    // const [selectedGroup, setSelectedGroup] = useState(null);
    const [consumptionType, setConsumptionType] = useState('Submit');

    const tableRoes = [
        {
            slno: 1,
            keyId: key,
            // createdAt: (new Date()).toLocaleString(),
            createdAt: '',
            expiry: '',
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
            // tableRoes[0].keyId = res.data.response;

        })
    }

    const generateNewApiKey=()=>{
        ServerApi().get('client/generateApiKey')
        .then(res=>{
            setKey(res.data.response);
            dispatch({type: 'open_snack', payload: 'New API Key Generated.'})
            // tableRoes[0].keyId = res.data.response;
        })
    }

    return (
        <React.Fragment>
            <Container fluid>
                <div className="page-title-box">
                    <Row className="align-items-center">
                        <Col sm="6">
                            <h4 className="page-title">SMS API</h4>
                        </Col>
                    </Row>
                </div>

                <Col sm="12" lg="12">
                    <Card>
                        <CardBody>
                            <Table columns={columns} dataSource={tableRoes} size="small" />

                            <Modal
                                title="Roll Key"
                                centered
                                visible={modalVisible}
                                onOk={() => setModalVisible(false)}
                                onCancel={() => setModalVisible(false)}
                            >
                                <div className="p-3">
                                    <Radio.Group inline onChange={e=>setConsumptionType(e.target.value)} 
                                        name="consumptionType" 
                                        value={consumptionType}>
                                        <Radio className="mb-2" value={'Submit'}>De-activate Old Key Immediately</Radio>
                                        <Radio value={'Delivery'}>De-activate old key in 24 hours</Radio>
                                    </Radio.Group>
                                </div>
                            </Modal>

                        </CardBody>
                    </Card>
                </Col>

                <Row>
                    <Col sm="12" lg="5">
                        <Card>
                            <CardBody>

                                <FormControl>
                                    {/* <Label>SMS GATEWAY </Label>
                                    <Select
                                        label="CLIENT GROUP"
                                        value={selectedGroup}
                                        onChange={e=>setSelectedGroup(e.target.value)}
                                        options={SMS_GATEWAY}
                                    /> */}

                                    <Label className="mt-3">SMS API KEY</Label>

                                    <Search
                                        placeholder="SMS API KEY"
                                        enterButton="Generate New"
                                        size="large"
                                        value={key}
                                        onSearch={()=>generateNewApiKey()}
                                    />

                                    {/* <FormGroup className="mt-3">
                                        <div>
                                            <Button type="primary" color="success" className="mr-1 float-right">
                                                <i className="fa fa-save mr-2"></i>Update
                                            </Button>{' '}
                                        </div>
                            
                                    </FormGroup> */}

                                </FormControl>

                            </CardBody>
                        </Card>
                    </Col>


                    <Col sm="12" lg="7">
                        <Card>
                            <CardBody>
                                <h4 className="mt-0 header-title font-weight-bold">SMS API DETAILS</h4>

                                <Label className="mt-3">SMS API KEY:</Label>
                                <p className="text-muted">{key}</p>

                                <Label className="">SMS API URL FOR TEXT/PLAIN SMS:</Label>
                                <p className="text-muted">http://165.232.177.52:8090/sms/api?action=send-sms&username=USERNAME&password=PASSWORD&to=phone&from=SENDER_ID&templateId=&sms=message&unicode=0</p>

                                <Label className="">SMS API URL FOR UNICODE SMS:</Label>
                                <p className="text-muted">http://165.232.177.52:8090/sms/api?action=send-sms&username=USERNAME&password=PASSWORD&to=phone&from=SENDER_ID&templateId=&sms=message&unicode=1</p>

                                {/* <Label className="">SMS API URL FOR VOICE SMS:</Label>
                                <p className="text-muted">https://ultimatesms.codeglen.com/demo/sms/api?action=send-sms&api_key={key}&to=PhoneNumber&from=SenderID&sms=YourMessage&voice=1</p>

                                <Label className="">SMS API URL FOR MMS SMS:</Label>
                                <p className="text-muted">https://ultimatesms.codeglen.com/demo/sms/api?action=send-sms&api_key={key}&to=PhoneNumber&from=SenderID&sms=YourMessage&mms=1&media_url=YourMediaUrl</p>

                                <Label className="">SMS API URL FOR SCHEDULE SMS:</Label>
                                <p className="text-muted">https://ultimatesms.codeglen.com/demo/sms/api?action=send-sms&api_key={key}&to=PhoneNumber&from=SenderID&sms=YourMessage&schedule=YourScheduleTime</p>

                                <Label className="">BALANCE CHECK:</Label>
                                <p className="text-muted">https://ultimatesms.codeglen.com/demo/sms/api?action=check-balance&api_key={key}&response=json</p>

                                <Label className="">CONTACT INSERT API:</Label>
                                <p className="text-muted">https://ultimatesms.codeglen.com/demo/contacts/api?action=subscribe-us&api_key={key}&phone_book=ContactListName&phone_number=PhoneNumber&first_name=FirstName_optional&last_name=LastName_optional&email=EmailAddress_optional&company=Company_optional&user_name=UserName_optional</p> */}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

            </Container>
        </React.Fragment>
    );
}
