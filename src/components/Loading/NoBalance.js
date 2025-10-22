import React, { Component } from 'react';
import Lottie from 'react-lottie';
// import * as animationData from '../../assets/lottie/sms-sending.json';
import * as animationData from '../../assets/lottie/payment-failed-error.json';

const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: animationData.default,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
  
class NoBalance extends Component {
    render() {
        return (
            <div>
                <Lottie 
                    options={defaultOptions}
                    height={200}
                    width={200}
                />
            </div>
        );
    }
}

export default NoBalance;