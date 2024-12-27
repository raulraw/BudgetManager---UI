import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';
import '../styles/Home.css';
import BudgetForm from '../components/BudgetForm';
import EditNameForm from '../components/EditNameForm';
import ExpenseChart from '../components/ExpenseChart'; // Importăm noua componentă pentru grafic

const Home = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [expenses, setExpenses] = useState({});
  const [fullName, setFullName] = useState(localStorage.getItem('fullName') || '');
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
  const [remainingExpenses, setRemainingExpenses] = useState(0);

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

  const toggleAccordion = (section) => {
    setExpanded(expanded === section ? null : section);
  };

  const handleSave = (updatedName) => {
    console.log('Updated user name:', updatedName);
  
    localStorage.setItem('fullName', updatedName);
    setFullName(updatedName);
    setExpanded(null);
  };

  const handleChartClick = (clickedCategory) => {
    console.log('Category clicked:', clickedCategory);
    if (clickedCategory && expenses[clickedCategory]) {
      setSelectedCategory(clickedCategory);
    }
  };

  return (
    <div className="home-container">
      <h1>
        Welcome, {fullName ? fullName : 'User'}
        <FaCog className="settings-icon" onClick={() => setShowSettings(true)} />
      </h1>

      {/* Meniu de setări */}
      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <span className="close-icon" onClick={() => setShowSettings(false)}>
              &times;
            </span>
            <h2>Settings</h2>
            <div className="accordion">
              <div className={`accordion-item ${expanded === 'budget' ? 'open' : ''}`}>
                <button onClick={() => toggleAccordion('budget')}>Edit Monthly Budget and Reset Date</button>
                <div className="accordion-content">
                  {expanded === 'budget' && <BudgetForm userId={userId} />}
                </div>
              </div>
              <div className="accordion-item">
                <button onClick={() => toggleAccordion('statement')}>Monthly Statement</button>
                {expanded === 'statement' && <p>Here is your monthly statement.</p>}
              </div>
              <div className={`accordion-item ${expanded === 'editName' ? 'open' : ''}`}>
                <button onClick={() => toggleAccordion('editName')}>Edit Your Name</button>
                <div className="accordion-content">
                  {expanded === 'editName' && <EditNameForm userId={userId} onSave={handleSave} />}
                </div>
              </div>
              <div className="accordion-item">
                <button
                  className="logout-button"
                  onClick={() => {
                    localStorage.removeItem('userId');
                    navigate('/login');
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Chart */}
      <ExpenseChart data={chartData} onChartClick={handleChartClick} />

      {/* Detalii pentru categoria selectată */}
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
