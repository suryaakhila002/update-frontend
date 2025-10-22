import React, { Component } from 'react';
import LoadingBar from 'react-top-loading-bar';
import {Container} from 'reactstrap'; 
import {Empty} from 'antd';

class DataLoading extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        this.LoadingBar.continuousStart();
    }

    conpleted(){
        this.LoadingBar.complete();
    }

    render() {

        if(!this.props.loading){
            this.conpleted();
        }

        return (
            <React.Fragment>
                <Container fluid>
                    <LoadingBar
                        height={3}
                        color='#79acef'
                        onRef={ref => (this.LoadingBar = ref)}
                    />
                    <Empty imageStyle={{marginTop: 100}} description="Loading Data Please Wait..."></Empty>
                </Container>
            </React.Fragment>
        );
    }
}

export default DataLoading;