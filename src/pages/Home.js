import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css'; // Importă stilul CSS pentru Home

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
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); // Preia userId din localStorage

  // Funcția pentru a obține cheltuielile utilizatorului
  useEffect(() => {
    if (!userId) {
      navigate('/login'); // Navighează spre login dacă nu există userId
    } else {
      axios
        .get(`http://localhost:8080/api/expenses/user/${userId}/details`)
        .then((response) => {
          const categories = response.data;

          if (categories && Object.keys(categories).length > 0) {
            const labels = Object.keys(categories);

            // Calculăm suma totală a cheltuielilor
            const data = labels.map((category) =>
              categories[category].reduce((acc, expense) => acc + expense.amount, 0)
            );

            const total = data.reduce((acc, val) => acc + val, 0);
            setTotalExpenses(total);

            // Actualizăm datele graficului
            setChartData({
              labels: labels,
              datasets: [
                {
                  data: data.map((amount) => ((amount / total) * 100).toFixed(1)),
                  backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'],
                },
              ],
            });

            // Actualizăm cheltuielile
            setExpenses(categories);
          } else {
            // Dacă nu sunt cheltuieli
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

  return (
    <div className="home-container">
      <h1>Welcome to Your Budget</h1>
      <button
        onClick={() => {
          localStorage.removeItem('userId');
          navigate('/login');
        }}
      >
        Logout
      </button>

      {Object.keys(expenses).length === 0 ? (
        <div className="no-expenses">
          <p>You have no expenses.</p>
        </div>
      ) : (
        <div className="expenses-chart">
          <p>Expense Distribution</p>
          <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      )}

      {Object.keys(expenses).length > 0 && (
        <div className="expense-details">
          <h2>Expense Details</h2>
          {Object.keys(expenses).map((category, index) => (
            <div key={index} className="category-details">
              <h3>{category}</h3>
              {Array.isArray(expenses[category]) && expenses[category].length > 0 ? (
                <div className="expense-list">
                  {expenses[category].map((expense, i) => (
                    <div key={i} className="expense-item">
                      <p>
                        <strong>{expense.name}</strong> on{' '}
                        <em>{new Date(expense.date).toLocaleDateString()}</em> cost:{' '}
                        <strong>${expense.amount.toFixed(2)}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No expenses found in this category.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {Object.keys(expenses).length > 0 && (
        <div className="total-expenses">
          <p>Total Expenses: {totalExpenses.toFixed(2)} $</p>
        </div>
      )}
    </div>
  );
};

export default Home;
