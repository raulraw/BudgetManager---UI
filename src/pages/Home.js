import React, { useEffect, useState, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

// Înregistrăm componentele necesare din ChartJS
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const Home = () => {
  const [expenses, setExpenses] = useState({});
  const [chartData, setChartData] = useState({
    labels: ['No Expenses'],
    datasets: [
      {
        data: [100],
        backgroundColor: ['#FF6384'],
      },
    ],
  });
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const chartRef = useRef(null); // Ref pentru grafic
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
    } else {
      axios
        .get(`http://localhost:8080/api/expenses/user/${userId}/details`)
        .then((response) => {
          if (response.data && Object.keys(response.data).length > 0) {
            const categories = response.data;
            const labels = Object.keys(categories);

            const data = labels.map((category) =>
              Array.isArray(categories[category])
                ? categories[category].reduce((acc, expense) => acc + expense.amount, 0)
                : categories[category] || 0
            );

            const total = data.reduce((acc, val) => acc + val, 0);
            setTotalExpenses(total);

            setChartData({
              labels: labels,
              datasets: [
                {
                  data: data,
                  backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'],
                },
              ],
            });
            setExpenses(categories);
          } else {
            setExpenses({});
            setTotalExpenses(0);
            setChartData({
              labels: ['No Expenses'],
              datasets: [
                {
                  data: [100],
                  backgroundColor: ['#FF6384'],
                },
              ],
            });
          }
        })
        .catch((error) => {
          console.error('Error fetching expenses:', error);
        });
    }
  }, [userId, navigate]);

  const handleChartClick = (event) => {
    const chart = chartRef.current;
    if (chart) {
      // Folosim getElementsAtEventForMode pentru compatibilitate
      const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true });

      if (elements.length > 0) {
        const clickedIndex = elements[0].index;
        const clickedCategory = chartData.labels[clickedIndex];
        setSelectedCategory(clickedCategory);
      }
    }
  };

  return (
    <div className="home-container">
      <h1>Welcome to Your Budget</h1>
      <button
      className="logout-button"
        onClick={() => {
          localStorage.removeItem('userId');
          navigate('/login');
        }}
      >
        Logout
      </button>

      <div className="expenses-chart">
        <p>Expense Distribution</p>
        <Doughnut
          ref={chartRef}
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const value = context.raw;
                    return `${context.label}: ${value.toFixed(2)} $`;
                  },
                },
              },
            },
            onClick: handleChartClick, // Evenimentul de clic
          }}
        />
      </div>

      {selectedCategory && (
        <div className="expense-details">
          <h2>Details for {selectedCategory}</h2>
          {expenses[selectedCategory]?.length > 0 ? (
            expenses[selectedCategory].map((expense, index) => (
              <div key={index} className="expense-item">
                <p>
                  <strong>Name:</strong> {expense.name}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Amount:</strong> {expense.amount.toFixed(2)} $
                </p>
              </div>
            ))
          ) : (
            <p>No expenses found in this category.</p>
          )}
        </div>
      )}

      <div className="total-expenses">
        <p>Total Expenses: {totalExpenses.toFixed(2)} $</p>
      </div>
    </div>
  );
};

export default Home;
