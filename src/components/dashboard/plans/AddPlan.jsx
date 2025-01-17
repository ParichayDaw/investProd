import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from "./AdNewPlans.module.css";
import axios from 'axios';
import StockList from './StockList';
import TextArea from 'antd/es/input/TextArea';

const AddPlan = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [formData, setFormData] = useState({
    planName: '',
    risk: '',
    minInvestmentAmount: '',
    advise: '',
    stocks: [],
    cash: 0,
    photo: null,
    isPremium: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedPrices, setSelectedPrices] = useState({});
  const [newSymbol, setNewSymbol] = useState('');
  const [newQty, setNewQty] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://invest-nse.azurewebsites.net/get_symbol_lastprice');
        setSelectedPrices(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleChangeToggle = (event) => {
    const { name, checked } = event.target;
    setFormData({ ...formData, [name]: checked });
  };
  

  const formatCurrency = (amount) => {
    // Convert amount to a number
    const parsedAmount = parseFloat(amount);

    // Check if parsedAmount is a valid number
    if (!isNaN(parsedAmount)) {
      // Use toFixed to limit the decimal places to 3 and convert it back to string
      const roundedAmount = parsedAmount.toFixed(2);
      const formattedAmount = roundedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `₹ ${formattedAmount}`;
    } else {
      // If amount is not a valid number, return empty string or handle accordingly
      return '';
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData({
        ...formData,
        photo: {
          data: base64String.split(',')[1],
          contentType: file.type,
        },
      });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleAddStock = () => {
    if (newSymbol && newQty > 0) {
      const price = selectedPrices[newSymbol];
      if (price) {
        let updatedStocks = [...formData.stocks];
        const existingStockIndex = updatedStocks.findIndex(stock => stock.symbol === newSymbol);
        if (existingStockIndex !== -1) {
          updatedStocks[existingStockIndex].qty += newQty;
        } else {
          updatedStocks.push({ symbol: newSymbol, qty: newQty });
        }
        // Remove stocks with zero quantity
        updatedStocks = updatedStocks.filter(stock => stock.qty > 0);
        formData.stocks = [...updatedStocks];
        calculateMini();
        setNewSymbol('');
        setNewQty(1);
      } else {
        alert('Data Not Available');
      }
    } else {
      alert('Please enter a valid symbol and quantity.');
    }
  };

  const handleSellStock = (symbol, qty, price) => {
    const existingStockIndex = formData.stocks.findIndex(stock => stock.symbol === symbol);
    if (existingStockIndex !== -1 && formData.stocks[existingStockIndex].qty >= qty) {
      const updatedStocks = [...formData.stocks];
      updatedStocks[existingStockIndex].qty -= qty;
      // Remove stocks with zero quantity
      const filteredStocks = updatedStocks.filter(stock => stock.qty > 0);

      formData.stocks = [...filteredStocks];
      calculateMini();
    } else {
      alert('Cannot sell stocks with insufficient quantity.');
    }
  };

  const handleBuyStock = (symbol, qty, price) => {
    const existingStockIndex = formData.stocks.findIndex(stock => stock.symbol === symbol);
    if (existingStockIndex !== -1) {
      const updatedStocks = [...formData.stocks];
      updatedStocks[existingStockIndex].qty += qty;
      setFormData({ ...formData, stocks: updatedStocks });
      calculateMini();
    } else {
      const updatedStocks = [...formData.stocks, { symbol, qty }];
      setFormData({ ...formData, stocks: updatedStocks });
      calculateMini();
    }
  };

  const getPricePercentage = (price) => {
    const totalValue = calculateTotalValue();
    if (totalValue === 0) return 0; // Avoid division by zero
    return ((price / totalValue) * 100).toFixed(2); // Calculate percentage and round to 2 decimal places
  };

  const calculateTotalValue = () => {
    let total = formData.cash; // Start with the cash balance

    // Add the value of each stock based on its quantity and price
    formData.stocks.forEach(stock => {
      const price = selectedPrices[stock.symbol];
      if (price) {
        total += stock.qty * price;
      }
    });

    return total;
  };


  const addPrci = () => {
    formData.stocks.forEach(stock => {
      const { symbol, qty } = stock;
      stock.price = selectedPrices[symbol];
    });

  }

  const handleSubmit = (e) => {
    e.preventDefault();
    addPrci();

    handleSimplifyStocks();

    const newErrors = {};

    if (!formData.planName) {
      newErrors.planName = 'Plan name is required';
    }
    if (!formData.risk) {
      newErrors.risk = 'Risk is required';
    }
    if (!formData.minInvestmentAmount) {
      newErrors.minInvestmentAmount = 'Minimum investment amount is required';
    }
    if (formData.stocks.length === 0) {
      newErrors.stocks = 'Add Atleast One Stock';
    }
    if (formData.photo === null) {
      newErrors.photo = 'Photo upload is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to create a new plan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, create it!'
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('Form data:', formData);
          axios.post('https://team4api.azurewebsites.net/api/v1/advisor/add-plans', formData, { withCredentials: true })
            .then(response => {
              console.log('Response:', response.data);
              navigate("/advisor/planList");
            })
            .catch(error => {
              console.error('Error:', error);
            });
        }
      });
    }
  };

  const handleSimplifyStocks = () => {
    const quantities = formData.stocks.map(stock => stock.qty);
    const gcd = findGCDArray(quantities);
    const simplifiedStocks = formData.stocks.map(stock => ({
      ...stock,
      qty: stock.qty / gcd
    }));
    formData.stocks = [...simplifiedStocks];
  };

  const findGCDArray = (arr) => {
    const gcd = (a, b) => {
      if (b === 0) return a;
      return gcd(b, a % b);
    };
    return arr.reduce((acc, curr) => gcd(acc, curr), arr[0]);
  };

  const calculateMini = () => {
    const ocks = [...formData.stocks];
    const quantities = ocks.map(stock => stock.qty);
    const gcd = findGCDArray(quantities);
    const simplifiedStocks = ocks.map(stock => ({
      ...stock,
      qty: stock.qty / gcd
    }));

    let mini = 0;

    for (const item of simplifiedStocks) {
      const { symbol, qty } = item;
      if (selectedPrices[symbol]) {
        mini += qty * selectedPrices[symbol];
      }
    }
    setFormData({ ...formData, minInvestmentAmount: mini });
  }

  const handleSymbolClick = (symbol) => {
    setNewSymbol(symbol);
  };


  return (
    <div style={{ display: "flex", flexDirection: "row" }} className={styles.addPlan_form_container}>
      <StockList selectedDate={date} prices={selectedPrices} handleSymbolClick={handleSymbolClick} />
      <hr className={styles.addPlan_hr} />
      <div >
        {/* <div className={styles.addPlan_image_container}>
          <img src="https://media.istockphoto.com/id/1372102011/vector/business-analyst-financial-data-analysis-advisor-analyzing-financial-report.jpg?s=612x612&w=0&k=20&c=LpfJhQ4yLFPh-yXebLXpPZFHhDhT3lGzjA2mkGioiLw=" alt="Financial Analysis" />
        </div> */}
        <div className={styles.addPlan_form_section}>
          <form id={styles.new_plan_form} onSubmit={handleSubmit}>
            <div className={styles.formGrp}>
              <label className={styles.addPlan_label} htmlFor="planName">Plan Name<span className={styles.required}>*</span>:</label>
              <input className={styles.addPlan_input} type="text" id="planName" name="planName" value={formData.planName} onChange={handleChange} required />
              {errors.planName && <div className={styles.error}><strong>{errors.planName}</strong></div>}
            </div>
            <div className={styles.formGrp}>
              <label className={styles.addPlan_label} htmlFor="risk">Risk<span className={styles.required}>*</span>:</label>
              <select className={styles.addPlan_select} id="risk" name="risk" value={formData.risk} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {errors.risk && <div className={styles.error}><strong>{errors.risk}</strong></div>}
            </div>
            <div className={styles.formGrp}>
              <label htmlFor="photoId" className={styles.addPlan_label}>Upload Photo<span className={styles.required}>*</span>:</label>
              <input
                type="file"
                id="photoId"
                name="photoId"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
              {errors.photo && <div className={styles.error}><strong>{errors.photo}</strong></div>}
            </div>
            <div className={styles.formGrp}>
              <label className={styles.addPlan_label} htmlFor="minInvestmentAmount">Minimum Investment Amount:</label>
              <input
                className={styles.addPlan_input}
                type="text"
                id="minInvestmentAmount"
                name="minInvestmentAmount"
                value={formatCurrency(formData.minInvestmentAmount)}
                onChange={(e) => { handleChange(e); }} // No need to call formatCurrency here
                readOnly
              />
              {errors.minInvestmentAmount && <div className={styles.error}><strong>{errors.minInvestmentAmount}</strong></div>}
            </div>
            <div className={styles.formGrp}>
              <label className={styles.addPlan_label} htmlFor="isPremium">Premium</label>
              <input className={styles.addPlan_input} type="checkbox" id="isPremium" name="isPremium" checked={formData.isPremium} onChange={handleChangeToggle} />
            </div>
            <div className={`${styles.formGrp} ${styles.formGrp3}`}>
              <label className={styles.addPlan_label} htmlFor="advise">Advise<span className={styles.required}>*</span>:</label>
              <TextArea className={styles.addPlan_input} type="text" id="advise" name="advise" value={formData.advise} onChange={handleChange} required />
              {errors.advise && <div className={styles.error}><strong>{errors.advise}</strong></div>}
            </div>

            <div className={`${styles.formGrp} ${styles.addPlan_stocks}`}>
              {/* <h2>Add New Stock</h2> */}
              <label className={styles.addPlan_label}>Stock</label>
              {/* <label htmlFor="newSymbol">Symbol:</label> */}
              <input type="text" id="newSymbol" value={newSymbol} onChange={e => setNewSymbol(e.target.value)} readOnly />
              {/* <label htmlFor="newQty">Quantity:</label>
            <input type="number" id="newQty" value={newQty} onChange={e => setNewQty(parseInt(e.target.value))} /> */}
              <button type="button" onClick={handleAddStock}>&#x2713;</button>
            </div>
            <div style={{ position: 'relative', width: '100%' }}>
              <hr style={{ width: '35.7vw', margin: '0', marginLeft: '0vw' }} />
            </div>
            <div className={styles.addPlan_stock_cards}>
              {formData.stocks.map(stock => (
                <div key={stock.symbol} className={styles.addPlan_card}>
                  <div className={styles.addPlan_card_detail}>
                    <p style={{ fontWeight: '600' }}>{stock.symbol}</p>
                    <p>
                      Weightage - {(stock.qty * getPricePercentage(selectedPrices[stock.symbol])).toFixed(2)}% of Total Value
                    </p>
                    <p>Price:</p>
                  </div>
                  <div className={styles.addPlan_card_button}>
                    <button type="button" onClick={() => handleBuyStock(stock.symbol, 1, selectedPrices[stock.symbol])} style={{ color: 'green' }}>+</button>
                    <button type="button" onClick={() => handleSellStock(stock.symbol, 1, selectedPrices[stock.symbol])} style={{ color: 'red' }}>-</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" className={styles.addPlan_add_stock_btn}>Create Plan</button>
            {/* <button type="button" onClick={handleSimplifyStocks} className={styles.addPlan_simplify_btn}>Simplify</button> */}

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPlan;
