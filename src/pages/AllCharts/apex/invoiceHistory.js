import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts';

class InvoiceHistory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            options: {
                dataLabels: {
                    enabled: false,
                },
                legend: {
                    show: false
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '70%'
                        }
                    }
                },
                colors: ['#626ed4', '#02a499'],
                labels: ['Paid', 'UnPaid'],
            },
            series: [50, 50],

        }
    }
    render() {
        return (
            <React.Fragment>
                <ReactApexChart chartOptions={this.state.chartOptions} options={this.state.options} series={this.state.series} type="pie" height="220" />
            </React.Fragment>
        );
    }
}

export default InvoiceHistory;