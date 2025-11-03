import React, { Component } from 'react';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Label, Table } from 'reactstrap';
import { activateAuthLayout } from '../../store/actions';
// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {ServerApi} from '../../utils/ServerApi';
import { Empty, Tag } from 'antd';
import { getLoggedInUser } from '../../helpers/authUtils';
import {Button as MuiButton} from '@mui/material'; // Renamed to avoid conflict with reactstrap Button

import Select from 'react-select';

// --- KEY CHANGES (IMPORTS) ---
// import { MDBDataTable } from 'mdbreact'; // REMOVED: Outdated
// import SweetAlert from 'react-bootstrap-sweetalert'; // REMOVED: Outdated

import { DataGrid } from '@mui/x-data-grid'; // ADDED: Modern Data Table
import { Box } from '@mui/material'; // ADDED: For layout
import Swal from 'sweetalert2'; // ADDED: Modern Alert Library
import withReactContent from 'sweetalert2-react-content'; // ADDED: React wrapper
// --- END KEY CHANGES ---

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

class BuyUnit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // --- KEY CHANGE (DATAGRID) ---
            // Define columns for MUI DataGrid
            columns: [
                {
                    field: 'units',
                    headerName: 'NUMBER OF UNITS',
                    width: 180 // Increased width
                },
                {
                    field: 'price',
                    headerName: 'PRICE PER UNIT',
                    width: 180 // Increased width
                },
            ],
            // Define rows for DataGrid, adding a unique 'id'
            rows: [
                {
                    id: 1, // Added id
                    units: '0 - 5000',
                    price: '₹ 1',
                },
                {
                    id: 2, // Added id
                    units: '5001 - 10000',
                    price: '₹ 1',
                },
            ],
            // --- END KEY CHANGE ---

            // --- KEY CHANGE (STATE) ---
            // These are no longer needed for SweetAlert2
            // success_msg: false,
            // modal_type: 'success',
            // success_message: '',
            // modal_standard: false,
            // showDetail: false,
            // showDetailId: 0,
            // --- END KEY CHANGE ---

            modal_delete: false,
            delete_sid: '',
            isDeleting: false,
            isLoading: false,
            unitPrice: 0.4,
            amountToPay: 0,
            gstFee: 0,
            paymentMethods: [
                {label: 'Razor Pay', value: 'razorpay'},
                {label: 'Bank', value: 'bank'}
            ],
            paymentMethod: '',
            total: 0,
            dltCharge: 0.025,
        };
        // this.tog_standard = this.tog_standard.bind(this); // Unused
        this.tog_delete = this.tog_delete.bind(this);
        this.loadFixedBundles = this.loadFixedBundles.bind(this);
        this.deleteFixedPlan = this.deleteFixedPlan.bind(this);
        this.calculatePrice = this.calculatePrice.bind(this);
    }

    componentDidMount() {
        console.log('All clkients components')
        this.props.activateAuthLayout();
        // this.loadFixedBundles(); // This was commented out, leaving as is
    }

    // This method was not called, but I updated it to use the new 'rows' state
    // in case you use it later.
    loadFixedBundles(){
        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).get(`api/v1/pricing/price/${getLoggedInUser().id}/all`)
          .then(res => {
            if (res.data === undefined) {
                return false;
            }

            const formattedRows = res.data.map((item, index)=>{
                item.slno = (index+1);
                item.id = item.id || index + 1; // Ensure unique ID
                item.price = '₹ '+item.netPrice;
                item.action = <div><MuiButton variant="contained"  title="View Features" onClick={()=>this.showDetailsModal(index)} color="primary" size="small"><i className="fa fa-eye mr-2"></i> View Features</MuiButton></div>;
                return item;
            });  

            this.setState({isLoading: false, rows: formattedRows})
        })
        .catch(error => console.log('error', error));
    }
    
    // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
    // Added this function to replace the old 'showDetail' modal
    showDetailsModal = (index) => {
        const rowData = this.state.rows[index];
        MySwal.fire({
            title: <span>PLAN <small>Details</small>!</span>,
            html: (
                <Table>
                    <thead>
                        <tr>
                        <th>SMS Balance</th>
                        <th>Customer Support</th>
                        <th>Reseller Panel</th>
                        <th>API Access</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">{rowData.fixedPriceInPaisa}</th>
                            <td>24/7</td>
                            <td><Tag color="red">No</Tag></td>
                            <td><Tag color="red">No</Tag></td>
                        </tr>
                    </tbody>
                </Table>
            ),
            confirmButtonText: 'Buy Now',
        });
    }
    // --- END KEY CHANGE ---


    manageClient(id) {        
        this.props.history.push({pathname: '/manageClient', state: { clientId: id }});
    }

    // tog_standard() { // This function was unused
    //     this.setState(prevState => ({
    //         modal_standard: !prevState.modal_standard
    //     }));
    //     this.removeBodyCss();
    // }

    tog_delete(id) {
        this.setState({
            modal_delete: !this.state.modal_delete,
            delete_sid: id,
        });
        this.removeBodyCss();
    }

    removeBodyCss() {
        document.body.classList.add('no_padding');
    }

    deleteFixedPlan(){
        if (this.state.delete_sid === "") { return false; }

        this.setState({isDeleting: true});

        ServerApi({URL: 'CLIENT_MICRO_SERVER'}).delete("api/v1/pricing/plan/delete/"+this.state.delete_sid)
          .then(res => {
            if (res.status === 404) {
                // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
                // this.setState({success_msg: true, success_message: 'Unable to remove plan.',modal_type: 'error', isDeleting: false});
                this.setState({ isDeleting: false });
                MySwal.fire({
                    title: 'Error!',
                    text: 'Unable to remove plan.',
                    icon: 'error'
                });
                // --- END KEY CHANGE ---
                this.tog_delete();
                return;
            }
            
            // --- KEY CHANGE (SWEETALERT REPLACEMENT) ---
            // this.setState({success_msg: true, modal_type: 'success', success_message: 'Plan Removed.', isDeleting: false});
            this.setState({ isDeleting: false });
            MySwal.fire('Plan Removed!', '', 'success');
            // --- END KEY CHANGE ---

            this.loadFixedBundles();
            this.tog_delete();

          })
          .catch(error => {
              console.log('error', error);
              this.setState({ isDeleting: false });
              MySwal.fire('Error!', 'An error occurred.', 'error');
          });
    }

    purchase(){
        console.log('purchase')
    }

    calculatePrice(e){
        // ... (function remains unchanged)
        let unit = e.target.value; 
        let amountToPay = (unit*this.state.unitPrice)+(unit*this.state.dltCharge); 
        let gstFee =  Math.round(amountToPay*0.18); 
        this.setState({ 
            amountToPay: Math.round(amountToPay),  
            total: Math.round(amountToPay + (amountToPay*0.18)),
            gstFee,
        });
    }

    render() {

        if (this.state.isLoading) { return(<Empty imageStyle={{marginTop: 100}} description="Loading Data Please Wait..."></Empty>) }

        return (
            <React.Fragment>
                <Container fluid>
                    {/* ... (Header/Title Row and Form Col remain unchanged) ... */}
                    <div className="page-title-box">
                        <Row className="align-items-center">
                            <Col sm="6">
                                <h4 className="page-title">BUY UNIT</h4>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col lg="5">
                            <Card>
                                <CardBody>
                                    <FormControl onValidSubmit={this.purchase} ref={c => (this.form = c)}>
                                        {/* ... (All FormControl fields remain unchanged) ... */}
                                    </FormControl>
                                </CardBody>
                            </Card>
                        </Col>

                        <Col md="7">
                            <Card>
                                <CardBody>
                                    {/* --- KEY CHANGE (MDBDATATABLE REPLACEMENT) --- */}
                                    {/* <MDBDataTable
                                        sortable
                                        responsive
                                        striped
                                        hover
                                        data={this.state.tableData}
                                        footer={false}
                                        foot={false}
                                    /> */}
                                    <Box sx={{ height: 400, width: '100%' }}>
                                        <DataGrid
                                            rows={this.state.rows}
                                            columns={this.state.columns}
                                            pageSize={5}
                                            rowsPerPageOptions={[5]}
                                            // 'id' field was added in state
                                            // getRowId={(row) => row.id} // Not needed
                                            disableSelectionOnClick
                                        />
                                    </Box>
                                    {/* --- END KEY CHANGE --- */}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    {/* --- KEY CHANGE (SWEETALERT BLOCKS DELETED) --- */}
                    {/* Both <SweetAlert> blocks are DELETED from the render method.
                        They are now triggered as function calls or were unused. */}
                    {/* {this.state.success_msg &&
                        <SweetAlert ... >
                        </SweetAlert> 
                    } */}
                    {/* {this.state.showDetail && (
                        <SweetAlert ... >
                        </SweetAlert>
                    )} */}
                    {/* --- END KEY CHANGE --- */}

                    <Modal centered isOpen={this.state.modal_delete} toggle={this.tog_delete} >
                        {/* ... (Reactstrap Modal remains unchanged) ... */}
                    </Modal>

                </Container>
            </React.Fragment>
        );
    }
}

export default connect(null, { activateAuthLayout })(BuyUnit);