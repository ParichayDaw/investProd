// import React, { useEffect, useState } from 'react';
// import ReactApexChart from 'react-apexcharts';
// import styles from './dashboard.module.css'

// const ApexChart = ({ plans_data, widthChart }) => {
//   const [seriesData, setSeriesData] = useState([]);
//   const [options, setOptions] = useState({
//     chart: {
//       height: 200,
//       type: 'bar',
//     },
//     plotOptions: {
//       bar: {
//         borderRadius: 0,
//         columnWidth: '50%',
//       }
//     },
//     dataLabels: {
//       enabled: false
//     },
//     stroke: {
//       width: 2
//     },
    
//     grid: {
//       row: {
//         colors: ['#fff', '#f2f2f2']
//       }
//     },
//     xaxis: {
//       labels: {
//         rotate: -45
//       },
//       tickPlacement: 'on',
//     },
//     fill: {
//       type: 'gradient',
//       gradient: {
//         shade: 'light',
//         type: "horizontal",
//         shadeIntensity: 0.25,
//         gradientToColors: undefined,
//         inverseColors: true,
//         opacityFrom: 0.85,
//         opacityTo: 0.85,
//         stops: [50, 0, 100]
//       },
//     }
//   });

//   useEffect(() => {
//     console.log("Data from Flask:", plans_data);
//     prepareChartData();
//   }, [plans_data]);

//   const prepareChartData = () => {
//     if (!plans_data) {
//       // Handle the case where plans_data is null or undefined
//       return;
//     }
  
//     const newSeriesData = plans_data.map((plan) => ({
//       name: plan.planName,
//       data: [plan.total_current_gains],
//     }));
  
//     setSeriesData(newSeriesData);
//   };
  
//   return (
//     <div>
//       <div id="chart" style={{display:'grid', justifyItems:'center', paddingBottom:'20px'}}>
//         <ReactApexChart options={options} series={seriesData} type="bar" height={250} width={widthChart}/>
//       </div>
//     </div>
//   );
// };

// export default ApexChart;




import React, { Component } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

class ApexChart extends Component {
  render() {
    const { plans_data } = this.props;

    // Define an array of colors
    const colors = ["#543FF0", "#1C4CEF", "#3E4DE7", "#4169E1", "#45766F7"];

    const dataPoints = plans_data.map((plan, index) => ({
      x: index + 1,
      y: plan.total_current_gains,
      indexLabel: plan.planName, // Show plan name as index label
      color: colors[index % colors.length] // Assign a color from the colors array
    }));

    const options = {
      animationEnabled: true,
      exportEnabled: true,
      theme: "light2",
      title: {
        // text: "Bar Chart with Plan Names"
      },
      axisY: {
        includeZero: false // Set to false to start from negative values
      },
      data: [{
        type: "column",
        indexLabelFontColor: "#5A5757",
        indexLabelPlacement: "outside",
        columnWidth: 0.5, // Adjust the width of the bars (value between 0 and 1)
        dataPoints: dataPoints
      }]
    };

    return (
      <div>
        <CanvasJSChart options={options} />
      </div>
    );
  }
}

export default ApexChart;



// import React, { Component } from 'react';
// import CanvasJSReact from '@canvasjs/react-charts';

// var CanvasJS = CanvasJSReact.CanvasJS;
// var CanvasJSChart = CanvasJSReact.CanvasJSChart;

// class ApexChart extends Component {
//   render() {
//     const { plans_data } = this.props;

//     const oldData = plans_data.map(plan => ({
//       label: plan.planName,
//       y: plan.total_current_gains
//     }));

//     const dummyData = [
//       { label: "Dummy1", y: 150 },
//       { label: "Dummy2", y: 200 },
//       { label: "Dummy3", y: 250 },
//       { label: "Dummy4", y: 300 },
//       { label: "Dummy5", y: 350 }
//     ];

//     const axisYOptions = plans_data.map(plan => ({
//       title: plan.planName,
//       titleFontColor: "#4F81BC",
//       lineColor: "#4F81BC",
//       labelFontColor: "#4F81BC",
//       tickColor: "#4F81BC"
//     }));

//     const options = {
//       animationEnabled: true,
//       title: {
//         text: "Comparison of PlanName and Dummy Data"
//       },
//       axisX: {
//         title: "Plan Name",
//         titleFontColor: "#4F81BC",
//         lineColor: "#4F81BC",
//         labelFontColor: "#4F81BC",
//         tickColor: "#4F81BC"
//       },
//       axisY: {
//         title: "Data",
//         titleFontColor: "#4F81BC",
//         lineColor: "#4F81BC",
//         labelFontColor: "#4F81BC",
//         tickColor: "#4F81BC"
//       },
//       axisY2: {
//         title: "Dummy Data",
//         titleFontColor: "#C0504E",
//         lineColor: "#C0504E",
//         labelFontColor: "#C0504E",
//         tickColor: "#C0504E"
//       },
//       toolTip: {
//         shared: true
//       },
//       legend: {
//         cursor: "pointer",
//         itemclick: this.toggleDataSeries
//       },
//       data: [{
//         type: "column",
//         name: "Data",
//         legendText: "Data",
//         showInLegend: true,
//         dataPoints: oldData
//       },
//       {
//         type: "column",
//         name: "Dummy Data",
//         legendText: "Dummy Data",
//         axisYType: "secondary",
//         showInLegend: true,
//         dataPoints: dummyData,
//         color: "#818589"
//       }]
//     };

//     return (
//       <div>
//         <CanvasJSChart options={options} />
//       </div>
//     );
//   }

//   toggleDataSeries(e) {
//     if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
//       e.dataSeries.visible = false;
//     }
//     else {
//       e.dataSeries.visible = true;
//     }
//     e.chart.render();
//   }
// }

// export default ApexChart;
