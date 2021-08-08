import React, { Component, useState } from 'react';

class Verifier extends Component {

    componentWillMount() {
        let target1 = 100
        let target2 = 20
        let target3 = 50
        let target4 = 60
        this.setState({ target1 })
        this.setState({ target2 })
        this.setState({ target3 })
        this.setState({ target4 })

    }

    calculate = (kpi1, kpi2, kpi3, kpi4) => {
        let result1 = kpi1 / this.state.target1
        let result2 = kpi2 / this.state.target2
        let result3 = kpi3 / this.state.target3
        let result4 = kpi4 / this.state.target4
        let finalScore = (result1 + result2 + result3 + result4) / 4
        this.setState({ finalScore })
    }
    constructor(props) {
        super(props)
        this.state = {
            finalScore: 0,
        }
    }

    render() {
        return (
            <>
                <div className="container mr-auto ml-auto">
                    
                    <div className="border border-success py-4 px-4 mb-5">
                        <h2>Scoring KPI target achievement</h2>
                        <p>The bond KPIs can be retrieved from the green certificate, 
                            which lists the categories and the targets.
                            The Green Verifier assessess the company's performance
                            against these KPIs and calculates an overall performace score.
                            The overall performance score is an average of the performance against 
                            each individual KPI. 
                        </p> 
                        <p>The result is recorded on the blockchain, 
                            and the coupon is adjusted as explained below:
                        </p>
                        <table className="table">
                            <tr>
                                <th>Overall Score</th>
                                <th>Coupon Adjustment</th>
                            </tr>
                            <tr>
                                <td>Below 50%</td>
                                <td>+2 bp</td>
                            </tr>
                            <tr>
                                <td>50 - 90%</td>
                                <td>+1 bp</td>
                            </tr>
                            <tr>
                                <td>91 - 110%</td>
                                <td>No adjustment</td>
                            </tr>
                            <tr>
                                <td>110 - 150%</td>
                                <td>- 1 bp</td>
                            </tr>
                            <tr>
                                <td>Over 150%</td>
                                <td>- 2 bp</td>
                            </tr>
                        </table>

                    </div>
                    <h2>Calculate score</h2>
                    <form onSubmit={(event => {
                        event.preventDefault();
                        const result1 = this.result1.value
                        const result2 = this.result2.value
                        const result3 = this.result3.value
                        const result4 = this.result4.value
                        this.calculate(result1, result2, result3, result4)
                    })}>

                        <label 
                            for="kpi1"
                            className="font-weight-bold"
                        >Energy Performance - kwH/m2</label>
                        <input
                            id='kpi1'
                            type='number'
                            className='form-control mb-1'
                            min='0'
                            required
                            ref={(input) => { this.result1 = input }}
                        />
                        <span className="font-weight-light">Target: {this.state.target1} kWh/m2</span>
                        <br />
                        <br />
                        <label 
                            for="kpi2"
                            className="font-weight-bold"
                        >Carbon performance - % percentage of carbon emissions avoided vs. local baseline</label>
                        <input
                            id='kpi2'
                            type='number'
                            className='form-control mb-1'
                            min='0'
                            required
                            ref={(input) => { this.result2 = input }}
                        />
                        <span className="font-weight-light">Target: {this.state.target2} %</span>
                        <br />
                        <br />
                        <label 
                            for="kpi3"
                            className="font-weight-bold"
                        >Water efficiency - amount of rainwater harvested m3/a</label>
                        <input
                            id='kpi3'
                            type='number'
                            className='form-control mb-1'
                            min='0'
                            required
                            ref={(input) => { this.result3 = input }}
                        />
                        <span className="font-weight-light">Target: {this.state.target3} %</span>
                        <br />
                        <br />
                        <label 
                            for="kpi4"
                            className="font-weight-bold"
                        >Waste management - recycling percentage</label>
                        <input
                            id='kpi4'
                            type='number'
                            className='form-control mb-1'
                            min='0'
                            required
                            ref={(input) => { this.result4 = input }}
                        />
                        <span className="font-weight-light">Target: {this.state.target4} %</span>
                        <br />
                        <br />

                        <button 
                            type="submit"
                            className='btn btn-block btn-primary mt-4'
                            >Calculate</button>
                        <br />
                        <br />
                        <div className="border border-danger mb-4">
                           <p className="font-weight-bold px-3 py-4">Overall Score: {this.state.finalScore}</p>
                        </div>
                        
                    </form>
                </div>

               
            </>


        );
    }
} export default Verifier;