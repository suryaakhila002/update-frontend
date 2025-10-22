import React, { Component } from 'react';
import Lottie from 'react-lottie';
// import * as animationData from '../../assets/lottie/sms-sending.json';
import * as animationData from '../../assets/lottie/sms-sending2.json';

const defaultOptions = {
    loop: false,
    autoplay: true, 
    animationData: animationData.default,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
  
class SmsSending extends Component {
    render() {
        return (
            <div>
                <Lottie 
                    options={defaultOptions}
                    height={245}
                    width={245}
                />
            </div>
        );
    }
}

export default SmsSending;