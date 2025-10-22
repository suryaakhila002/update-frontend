import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Lottie from 'react-lottie';
// import * as animationData from '../../assets/lottie/sms-sending.json';
import * as animationData from '../../assets/lottie/development.json';

const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: animationData.default,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

class BlankPage extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        this.props.activateAuthLayout();
    }

    render() {

        return (
            <React.Fragment>
                <Container fluid>
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="3"></Col>
                            <Col sm="6">
                                <div>
                                    <Lottie 
                                        options={defaultOptions}
                                        // height={200}
                                        // width={200}
                                    />
                                </div>
                                {/* <h4 className="page-title">Coming Soon!</h4> */}
                                {/* <Breadcrumb>
                                    <BreadcrumbItem><Link to="/dashboard">Go To Dashboard</Link></BreadcrumbItem>
                                </Breadcrumb> */}
                            </Col>
                            <Col sm="3"></Col>
                        </Row>
                    </div>
                </ Container>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { activateAuthLayout })(BlankPage));

