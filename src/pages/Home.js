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
  const [budget, setBudget] = useState({
    amount: 0,
    remainingAmount: 0,
    resetDay: 0,
  });
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

  // Funcția pentru calcularea următoarei date de reset
  const [resetDay, setResetDay] = useState(0); // Adaugă un state pentru resetDay
  const calculateNextResetDate = (resetDay) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    if (resetDay < 1 || resetDay > 31) return 'Invalid reset day';

    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1; // Dacă este decembrie, trecem la ianuarie
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    const nextResetDate = new Date(nextYear, nextMonth, resetDay);

    return nextResetDate.toLocaleDateString('default', {
      day: 'numeric',
      month: 'long',
    });
  };

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  

  useEffect(() => {
    if (!userId) {
      navigate('/login');
    } else {
      axios
        .get(`http://localhost:8080/api/expenses/user/${userId}/details`)
        .then((response) => {
          if (response.data && Object.keys(response.data).length > 0) {
            const categories = response.data;
            
  
            // Obține luna și anul curent
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
  
            // Filtrează cheltuielile pentru luna curentă
            const filteredCategories = Object.keys(categories).reduce((filtered, category) => {
              const filteredExpenses = categories[category].filter((expense) => {
                const expenseDate = new Date(expense.date);
                return (
                  expenseDate.getMonth() === currentMonth &&
                  expenseDate.getFullYear() === currentYear
                );
              });
  
              if (filteredExpenses.length > 0) {
                filtered[category] = filteredExpenses;
              }
  
              return filtered;
            }, {});
  
            const labels = Object.keys(filteredCategories);
  
            const data = labels.map((category) =>
              Array.isArray(filteredCategories[category])
                ? filteredCategories[category].reduce((acc, expense) => acc + expense.amount, 0)
                : 0
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
  
            setExpenses(filteredCategories);
            if (budget.amount) {
              setBudget((prevBudget) => ({
                  ...prevBudget,
                  remainingAmount: prevBudget.amount - total,
              }));
          }
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

        // Preluarea bugetului
        axios
        .get(`http://localhost:8080/api/users/${userId}`)
        .then((response) => {
          const userData = response.data;
  
          // Setăm bugetul în starea componentei
          if (userData.budget) {
            const { amount, remainingAmount, resetDay } = userData.budget;
            setBudget({
              amount,
              remainingAmount,
              resetDay,
            });
      
            // Actualizăm resetDay separat
            setResetDay(resetDay);
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
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
      <h2>Here is your journey in {currentMonth}</h2> 

      <div className="budget-overview">
        <div>
          <h3>Total Budget:</h3>
          <p>{budget.amount ? budget.amount.toFixed(2) : 'Loading...'} $</p>
        </div>
        <div>
          <h3>Remaining Budget:</h3>
          <p>{budget.remainingAmount ? budget.remainingAmount.toFixed(2) : 'Loading...'} $</p>
        </div>
        <div>
          <h3>Total Expenses:</h3>
          <p>{totalExpenses ? totalExpenses.toFixed(2) : 'Loading...' } $</p>
        </div>
        <div>
          <h3>Next Reset Day:</h3>
          <p>{resetDay ? calculateNextResetDate(resetDay) : "Not set yet"}</p>
        </div>
      </div>

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
                  {expanded === 'budget' && <BudgetForm 
    userId={userId} 
    onSave={(updatedBudget) => setBudget(updatedBudget)} 
    setBudget={setBudget}   
    totalExpenses={totalExpenses}  
/>}
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
      {/* Trebuie facut componenta pentru asta */}
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

    </div>
  );
};

export default Home;
