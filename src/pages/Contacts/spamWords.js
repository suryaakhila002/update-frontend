import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Button } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';
import { MDBDataTable } from 'mdbreact';

class SpamWords extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: null, 
            selectedMulti: null,
            cSelected: [],
        };
        this.onCheckboxBtnClick = this.onCheckboxBtnClick.bind(this);
    }

    componentDidMount() {
        this.props.activateAuthLayout();
    }

    onCheckboxBtnClick(selected) {
        const index = this.state.cSelected.indexOf(selected);
        if (index < 0) {
            this.state.cSelected.push(selected);
        } else {
            this.state.cSelected.splice(index, 1);
        }
        this.setState({ cSelected: [...this.state.cSelected] });
    }

    
    //Select 
    handleSelectGroup = (selectedGroup) => {
        this.setState({ selectedGroup });
    }

    render() {

        const data = {
            columns: [
                {
                    label: 'WORDS',
                    field: 'words',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'ACTION',
                    field: 'action',
                    sort: 'asc',
                    width: 270
                },
            ],
            rows: []
        };

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">SPAM WORDS</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="5">
                            <Card>
                                <CardBody>
                                    <h5 className="mt-0 header-title">ADD NEW WORD</h5>

                                    <AvForm>
                                        <FormGroup>
                                            <AvField name="spam_words" label="SPAM WORDS"
                                            type="text"  
                                            validate={{ required: { value: true } }} />
                                        </FormGroup>

                                        <FormGroup className="mb-0">
                                            <div>
                                                <Button type="submit" color="success" className="mr-1">
                                                    <i className="ti ti-plus mr-2"></i> Add
                                                </Button>
                                            </div>
                               
                                       </FormGroup>

                                    </AvForm>

                                </CardBody>
                            </Card>
                        </Col>

                        <Col sm="12" lg="7">
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">SPAM WORDS</h4>

                                    <MDBDataTable
                                        responsive
                                        striped
                                        data={data}
                                    />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(SpamWords));