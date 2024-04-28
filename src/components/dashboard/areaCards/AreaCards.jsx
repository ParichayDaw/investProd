import React, { useState, useEffect } from "react";
import AreaCard from "./AreaCard";
import axios from 'axios';
import moneyImage1 from './../../../assest/images/money1.png';
import clientimg from './../../../assest/images/client.png';
import moneyImage2 from './../../../assest/images/money2.png';
import moneyImage3 from './../../../assest/images/money3.png';
import "./AreaCards.scss";

const AreaCards = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalClients, setTotalClients] = useState();
  const [totalInvestedAmount, setTotalInvestedAmount] = useState();
  const [totalCurrentProfit, setTotalCurrentProfit] = useState();
  const [plansData, setPlansData] = useState(null);
  const [datu, setDatu] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
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

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchTotalClients = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/advisor/get-no-of-clients', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setTotalClients(data);
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    };

    fetchTotalClients();
  }, []);

  useEffect(() => {
    const fetchTotalInvestedAmount = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/advisor/get-total-invested-amount', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setTotalInvestedAmount(data);
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    };

    fetchTotalInvestedAmount();
  }, []);

  useEffect(() => {
    const fetchTotalCurrentProfit = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/advisor/get-total-current-profit', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setTotalCurrentProfit(data);
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    };

    fetchTotalCurrentProfit();
  }, []);

  const formatCurrency = (value) => {
    const roundedValue = parseFloat(value).toFixed(2);
    return `₹${roundedValue}`;
  };

  if (isLoading) {
    return (
      <section className="content-area-cards">
        <div className="skeleton-card">
          <div className="loading-animation">
            {/* <img src="loading.gif" alt="Loading" /> */}
          </div>
        </div>
        <div className="skeleton-card">
          <div className="loading-animation">
            {/* <img src="loading.gif" alt="Loading" /> */}
          </div>
        </div>
        <div className="skeleton-card">
          <div className="loading-animation">
            {/* <img src="loading.gif" alt="Loading" /> */}
          </div>
        </div>
      </section>
    );
  }

  function calculateAverageGainPercentage(plansData) {
    let totalGainPercentage = 0;
    let totalStocks = 0;

    plansData.forEach((plan) => {
      plan.individual_stocks.forEach((stock) => {
        totalGainPercentage += stock.total_change_percent;
        totalStocks++;
      });
    });

    if (totalStocks === 0) {
      return 0;
    }

    const averageGainPercentage = totalGainPercentage / totalStocks;
    return averageGainPercentage;
  }

  const averageGainPercentage = calculateAverageGainPercentage(datu);

  return (
    <section className="content-area-cards">
      <AreaCard
        colors={["#e4e8ef", "#475be8"]}
        percentFillValue={80}
        cardInfo={{
          title: "Total Clients",
          value: totalClients?.noOfClients,
        }}
        imageSrc={clientimg}
      />
      <AreaCard
        colors={["#e4e8ef", "#4ce13f"]}
        percentFillValue={50}
        cardInfo={{
          title: "Invested Amount",
          value: formatCurrency(totalInvestedAmount?.totalInvestedAmount),
        }}
        imageSrc={moneyImage1}
      />
      <AreaCard
        colors={["#e4e8ef", "#f29a2e"]}
        percentFillValue={40}
        cardInfo={{
          title: "Current Profit",
          value: formatCurrency(averageGainPercentage * totalInvestedAmount?.totalInvestedAmount),
        }}
        imageSrc={moneyImage3}
      />
    </section>
  );
};

export default AreaCards;
