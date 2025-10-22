import React, { Component } from 'react';
import Lottie from 'react-lottie';
import * as animationData from '../../assets/lottie/forgot-keys.json';

const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: animationData.default,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
  
class ForgotPasswordAnim extends Component {
    render() {
        return (
            <div style={{width: '60%', marginTop: 10, margin: 'auto'}}>
                <Lottie 
                    options={defaultOptions}
                />
            </div>
        );
    }
}

export default ForgotPasswordAnim;