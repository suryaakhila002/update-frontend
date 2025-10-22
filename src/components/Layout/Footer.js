import React, { Component } from 'react';

class Footer extends Component {

    render() {
        return (
            <React.Fragment>
                <footer className="footer">
                    © {new Date().getFullYear()} <span className="d-none d-sm-inline-block"> SMS Panel </span>.
                </footer>
            </React.Fragment>
        );
    }
}

export default Footer;






