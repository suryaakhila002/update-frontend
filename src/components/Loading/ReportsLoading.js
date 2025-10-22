import React, { Component } from 'react';
import Lottie from 'react-lottie';
import * as animationData from '../../assets/lottie/accounting.json';

const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: animationData.default,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
  
class ReportsLoading extends Component {
    render() {
        return (
            <div style={{marginTop: 200}}>
                <Lottie 
                    options={defaultOptions}
                    height={250}
                    width={250}
                />
                <h6 style={{width: '100%', textAlign: 'center', paddingLeft: 80}}>Loading...</h6>
            </div>
        );
    }
}

export default ReportsLoading;