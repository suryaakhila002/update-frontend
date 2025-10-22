import React, { Component } from 'react';
import Lottie from 'react-lottie';
import * as animationData from '../../assets/lottie/loading-circle.json';

const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: animationData.default,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
  
class ContactsLoading extends Component {
    render() {
        return (
            <div style={{marginTop: 40}}>
                <Lottie 
                    options={defaultOptions}
                    height={84}
                    width={84}
                />
            </div>
        );
    }
}

export default ContactsLoading;