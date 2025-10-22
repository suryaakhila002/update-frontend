import React, { Component } from 'react';
import Lottie from 'react-lottie';
// import * as animationData from '../../assets/lottie/sms-sending.json';
import * as animationData from '../../assets/lottie/send-message-done.json';

const defaultOptions = {
    loop: false,
    autoplay: true, 
    animationData: animationData.default,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
  
class SmsSent extends Component {
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

export default SmsSent;