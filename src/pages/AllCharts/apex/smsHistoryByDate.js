import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts';

class SmsHistoryByDate extends Component {
    constructor(props) {
        super(props);

        this.state = {
            options: {
                colors: ['#3c4ccf', '#02a499'],
                chart: {
                    toolbar: {
                        show: false,
                    },
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'smooth',
                    width: 0.1,
                },
                grid: {
                    borderColor: '#f8f8fa',
                    row: {
                        colors: ['transparent', 'transparent'], // takes an array which will be repeated on columns
                        opacity: 0.5
                    },
                },
                xaxis: {
                    categories: ['2012', '2013', '2014', '2015', '2016', '2017', '2018'],
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false
                    }
                },
                legend: {
                    show: false
                },
            },
            series: [
                {
                    name: 'Outbound',
                    data: [0, 0, 0, 5, 10, 20, 25]
                }
            ],
        }
    }
    render() {
        return (
            <React.Fragment>
                <ReactApexChart options={this.state.options} series={this.state.series} type="area" height="290" />
            </React.Fragment>
        );
    }
}

export default SmsHistoryByDate;