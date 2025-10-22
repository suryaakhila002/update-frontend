import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts';

class SmsReport extends Component {
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
                colors: ['#02a499', '#ec4561', '#626ed4', '#ff001d', '#dc530a', '#FF5722', '#f8b425'],
                labels: ['Delivered', 'Undelivered', 'Submitted', 'Rejected', 'DND', 'Expired', 'Pending'],
            },
            series: this.props.graphData,

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

export default SmsReport;