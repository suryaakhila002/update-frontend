import React, { Component } from 'react';
import Lottie from 'react-lottie';
import * as animationData from '../../assets/lottie/uploading.json';

const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: animationData.default,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
  
class Uploading extends Component {
    render() {
        return (
            <div style={{marginTop: 100}}>
                <Lottie 
                    options={defaultOptions}
                    width={400}
                    height={400}
                />
            </div>
        );
    }
}

export default Uploading;