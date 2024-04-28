import React, { useState, useEffect } from 'react';
import { ThemeContext } from "../../../context/ThemeContext";
import "./AreaCharts.scss";
import axios from 'axios';
import ApexChart from '../../../ClientScreens/DashBoard/BarChart';
import loadingGif from "./../../../assest/images/Animation2.gif"; // Import your loading GIF image

const AreaBarChart = () => {
  const [plansData, setPlansData] = useState(null);
  const [datu, setDatu] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchPlansData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/advisor/list-of-plans", {
          method: "GET",
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        const data = await response.json();
        setPlansData(data);

        const mappedData = data.plans.map(item => ({
          planName: item.planName,
          stocks: item.stocks,
          startVal: item.minInvestmentAmount,
          cash: item.cash
        }));
  
        const axiosResponse = await axios.post('http://localhost:5000/calculate_sts', { plans_data: mappedData });
        const calculatedData = axiosResponse.data;
  
        const mapData = calculatedData.plans_data.map((plan) => ({
          Name: plan.planName,
          gains: plan.total_current_gains,
        }));
        setDatu(calculatedData.plans_data);
        setLoading(false); // Set loading to false once data is loaded
      } catch (error) {
        console.error('Error fetching plans data:', error.message);
      }
    };
    fetchPlansData();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bar-chart">
      <div className="bar-chart-info">
        <h5 className="bar-chart-title">Returns</h5>
        <div className="chart-info-data"></div>
      </div>
      <div className="bar-chart-wrapper">
        {loading ? ( // Conditionally render loading animation
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <img src={loadingGif} alt="Loading..." style={{ maxWidth: '100%', maxHeight: '100%' }} />
          </div>
        ) : (
          datu ? (
            <ApexChart plans_data={datu} widthChart={600}/>
          ) : (
            <div></div>
          )
        )}
      </div>
    </div>
  );
};

export default AreaBarChart;






// import { useContext, useState, useEffect } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { ThemeContext } from "../../../context/ThemeContext";
// import { FaArrowUpLong } from "react-icons/fa6";
// import { LIGHT_THEME } from "../../../constants/themeConstants";
// import "./AreaCharts.scss";

// const AreaBarChart = () => {
//   const { theme } = useContext(ThemeContext);
//   const [totalInvestedAmount, setTotalInvestedAmount] = useState();
//   const [totalCurrentProfit, setTotalCurrentProfit] = useState();

//   useEffect(() => {
//     const fetchTotalInvestedAmount = async () => {
//       try {
//         const response = await fetch(
//           "http://localhost:8000/api/v1/advisor/get-total-invested-amount",
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             credentials: "include",
//           }
//         );

//         if (!response.ok) {
//           throw new Error("Failed to fetch user data");
//         }
//         const data = await response.json();
//         setTotalInvestedAmount(data.totalInvestedAmount);
//       } catch (error) {
//         console.error("Error fetching user data:", error.message);
//       }
//     };

//     fetchTotalInvestedAmount();
//   }, []);

//   useEffect(() => {
//     const fetchTotalCurrentProfit = async () => {
//       try {
//         const response = await fetch(
//           "http://localhost:8000/api/v1/advisor/get-total-current-profit",
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             credentials: "include",
//           }
//         );

//         if (!response.ok) {
//           throw new Error("Failed to fetch user data");
//         }
//         const data = await response.json();
//         setTotalCurrentProfit(data.totalCumulativeProfit);
//       } catch (error) {
//         console.error("Error fetching user data:", error.message);
//       }
//     };

//     fetchTotalCurrentProfit();
//   }, []);

//   const data = [
//     {
//       month: "Total Revenue",
//       value: totalInvestedAmount,
//     },
//     {
//       month: "Current Profit",
//       value: totalCurrentProfit,
//     },
//   ];

//   const formatTooltipValue = (value) => {
//     return `${value}k`;
//   };

//   const formatYAxisLabel = (value) => {
//     return `${value}k`;
//   };

//   const formatLegendValue = (value) => {
//     return value.charAt(0).toUpperCase() + value.slice(1);
//   };

//   return (
//     <div className="bar-chart">
//       <div className="bar-chart-wrapper">
//       <h5 className="bar-chart-title">Total Revenue</h5>
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart
//             width={500}
//             height={200}
//             data={data}
//             margin={{
//               top: 5,
//               right: 5,
//               left: 0,
//               bottom: 5,
//             }}
//           >
//             <XAxis
//               padding={{ left: 10 }}
//               dataKey="month"
//               tickSize={0}
//               axisLine={false}
//               tick={{
//                 fill: `${theme === LIGHT_THEME ? "#676767" : "#f3f3f3"}`,
//                 fontSize: 14,
//               }}
//             />
//             <YAxis
//               padding={{ bottom: 10, top: 10 }}
//               tickFormatter={formatYAxisLabel}
//               tickCount={6}
//               axisLine={false}
//               tickSize={0}
//               tick={{
//                 fill: `${theme === LIGHT_THEME ? "#676767" : "#f3f3f3"}`,
//               }}
//             />
//             <Tooltip
//               formatter={formatTooltipValue}
//               cursor={{ fill: "transparent" }}
//             />
//             <Legend
//               iconType="circle"
//               iconSize={10}
//               verticalAlign="top"
//               align="right"
//               formatter={formatLegendValue}
//             />
//             <Bar
//               dataKey="value"
//               fill="#475be8"
//               activeBar={false}
//               isAnimationActive={false}
//               barSize={24}
//               radius={[4, 4, 4, 4]}
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default AreaBarChart;

