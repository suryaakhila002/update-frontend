import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button, ButtonGroup } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import Select from 'react-select';
import { withRouter } from 'react-router-dom';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { connect } from 'react-redux';

const CLIENT_GROUP_STATUS = [
    {
        label: "Status",
        options: [
            { label: "Active", value: "Active" },
            { label: "In Active", value: "In Active" }
        ]
    }
];

class ImportContact extends Component {
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

        const { selectedGroup } = this.state;

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">IMPORT CONTACTS</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col sm="12" lg="4">
                            <Card>
                                <CardBody>
                                    <h5 className="mt-0 header-title">IMPORT CONTACT BY FILE</h5>

                                    <Button type="submit" color="primary" className="mb-3">
                                        Download Sample File
                                    </Button>

                                    <AvForm>
                                        <AvField name="import_numbers" label="IMPORT NUMBERS"
                                            type="file"
                                            validate={{ required: { value: false } }} />
                                        <AvField name="form_as_header" label="FIRST ROW AS HEADER"
                                            type="checkbox" 
                                            validate={{ required: { value: false } }} />

                                        <FormGroup>
                                            <Label>COUNTRY CODE </Label>
                                            <Select
                                                label="COUNTRY CODE"
                                                value={selectedGroup}
                                                onChange={this.handleSelectGroup}
                                                options={CLIENT_GROUP_STATUS}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label>IMPORT LIST INTO </Label>
                                            <Select
                                                label="IMPORT LIST INTO"
                                                value={selectedGroup}
                                                onChange={this.handleSelectGroup}
                                                options={CLIENT_GROUP_STATUS}
                                            />
                                        </FormGroup>

                                        <FormGroup className="mb-0">
                                            <div>
                                                <Button type="submit" color="success" className="mr-1">
                                                    Add
                                                </Button>
                                            </div>
                               
                                       </FormGroup>

                                    </AvForm>

                                </CardBody>
                            </Card>
                        </Col>

                        <Col sm="12" lg="8">
                            <Card>
                                <CardBody>
                                    <h4 className="mt-0 header-title">IMPORT BY NUMBERS</h4>

                                    <AvForm>
                                        <FormGroup>
                                            <Label>COUNTRY CODE </Label>
                                            <Select
                                                label="COUNTRY CODE"
                                                value={selectedGroup}
                                                onChange={this.handleSelectGroup}
                                                options={CLIENT_GROUP_STATUS}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <AvField name="paste_numbers" label="PASTE NUMBERS"
                                            type="textarea" rows={3} 
                                            validate={{ required: { value: false } }} />
                                        </FormGroup>

                                        <Label className="mr-3">CHOOSE DELIMITER</Label>
                                        <ButtonGroup>
                                            <Button color="info" onClick={() => this.onCheckboxBtnClick(1)} active={this.state.cSelected.includes(1)}>AUTOMATIC</Button>
                                            <Button color="info" onClick={() => this.onCheckboxBtnClick(2)} active={this.state.cSelected.includes(2)}>;</Button>
                                            <Button color="info" onClick={() => this.onCheckboxBtnClick(3)} active={this.state.cSelected.includes(3)}>,</Button>
                                            <Button color="info" onClick={() => this.onCheckboxBtnClick(3)} active={this.state.cSelected.includes(3)}>|</Button>
                                            <Button color="info" onClick={() => this.onCheckboxBtnClick(3)} active={this.state.cSelected.includes(3)}>TAB</Button>
                                            <Button color="info" onClick={() => this.onCheckboxBtnClick(3)} active={this.state.cSelected.includes(3)}>NEW LINE</Button>
                                        </ButtonGroup>
                                        
                                        <FormGroup className="mt-3">
                                            <Label>IMPORT LIST INTO </Label>
                                            <Select
                                                label="IMPORT LIST INTO"
                                                value={selectedGroup}
                                                onChange={this.handleSelectGroup}
                                                options={CLIENT_GROUP_STATUS}
                                            />
                                        </FormGroup>

                                        <FormGroup className="mb-0">
                                            <div>
                                                <Button type="submit" color="success" className="mr-1">
                                                    Add
                                                </Button>
                                            </div>
                               
                                       </FormGroup>

                                    </AvForm>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                </Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(ImportContact));