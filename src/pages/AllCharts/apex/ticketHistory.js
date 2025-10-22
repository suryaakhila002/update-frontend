import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts';

class TicketHistory extends Component {
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
                colors: ['#626ed4', '#02a499', '#02e599', '#3c4ccf'],
                labels: ['Closed', 'Pending', 'Answered', 'Customer Reply'],
            },
            series: [25, 25, 25, 25],

        }
    }
    render() {
        return (
            <React.Fragment>
                <ReactApexChart chartOptions={this.state.chartOptions} options={this.state.options} series={this.state.series} type="donut" height="220" />
            </React.Fragment>
        );
    }
}

export default TicketHistory;