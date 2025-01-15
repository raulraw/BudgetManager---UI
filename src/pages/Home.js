import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import "../styles/Home.css";
import BudgetForm from "../components/BudgetForm";
import EditNameForm from "../components/EditNameForm";
import ExpenseChart from "../components/ExpenseChart";
import AddExpenseForm from "../components/AddExpenseForm";
import EditExpenseForm from "../components/EditExpenseForm";
import MonthlyStatement from "../components/MonthlyStatement";

const Home = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [fullName, setFullName] = useState(
    localStorage.getItem("fullName") || ""
  );
  const [budget, setBudget] = useState({
    amount: 0,
    remainingAmount: 0,
    resetDay: 0,
  });
  const [chartData, setChartData] = useState({
    labels: ["No Expenses"],
    datasets: [
      {
        data: [100],
        backgroundColor: ["#FF6384"],
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

    if (resetDay < 1 || resetDay > 31) return "Invalid reset day";

    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1; // Dacă este decembrie, trecem la ianuarie
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    const nextResetDate = new Date(nextYear, nextMonth, resetDay);

    return nextResetDate.toLocaleDateString("default", {
      day: "numeric",
      month: "long",
    });
  };

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const fetchChartData = () => {
    axios
      .get(`http://localhost:8080/api/expenses/user/${userId}/details`)
      .then((response) => {
        if (response.data && Object.keys(response.data).length > 0) {
          const categories = response.data;

          // Obține luna și anul curent
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();

          // Filtrează cheltuielile pentru luna curentă
          const filteredCategories = Object.keys(categories).reduce(
            (filtered, category) => {
              const filteredExpenses = categories[category].filter(
                (expense) => {
                  const expenseDate = new Date(expense.date);
                  return (
                    expenseDate.getMonth() === currentMonth &&
                    expenseDate.getFullYear() === currentYear
                  );
                }
              );

              if (filteredExpenses.length > 0) {
                filtered[category] = filteredExpenses;
              }

              return filtered;
            },
            {}
          );

          const labels = Object.keys(filteredCategories);

          const data = labels.map((category) =>
            Array.isArray(filteredCategories[category])
              ? filteredCategories[category].reduce(
                  (acc, expense) => acc + expense.amount,
                  0
                )
              : 0
          );

          const total = data.reduce((acc, val) => acc + val, 0);
          setTotalExpenses(total);

          setChartData({
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: [
                  "#FF6384",
                  "#36A2EB",
                  "#FFCE56",
                  "#4BC0C0",
                  "#FF9F40",
                ],
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
            labels: ["No Expenses"],
            datasets: [
              {
                data: [100],
                backgroundColor: ["#FF6384"],
              },
            ],
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching expenses:", error);
      });
  };

  const fetchBudget = () => {
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
        console.error("Error fetching user data:", error);
      });
  };

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    } else {
      fetchChartData();
      // Preluarea bugetului
      fetchBudget();
    }
  }, [userId, navigate]);

  const toggleAccordion = (id) => {
    setExpanded((prevExpanded) => (prevExpanded === id ? null : id));
  };

  const handleSave = (updatedName) => {
    console.log("Updated user name:", updatedName);

    localStorage.setItem("fullName", updatedName);
    setFullName(updatedName);
    setExpanded(null);
  };

  const handleChartClick = (clickedCategory) => {
    console.log("Category clicked:", clickedCategory);
    if (clickedCategory && expenses[clickedCategory]) {
      setSelectedCategory(clickedCategory);
    }
  };

  const closeSettings = () => {
    const modal = document.querySelector(".settings-modal");
    const content = document.querySelector(".settings-content");

    modal.classList.add("fade-out");
    content.classList.add("fade-out");

    setTimeout(() => {
      setShowSettings(false);
      document.body.classList.remove("modal-open");
    }, 400);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
  };

  const handleSaveEditedExpense = (updatedExpense) => {
    setExpenses((prevExpenses) => {
      console.log("Current state (prevExpenses):", prevExpenses); // Debugging

      if (!Array.isArray(prevExpenses)) {
        console.error("Expected an array, but got:", prevExpenses);
        return [];
      }

      return prevExpenses.map((exp) =>
        exp.id === updatedExpense.id ? updatedExpense : exp
      );
    });

    setEditingExpense(null);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleDeleteExpense = (expenseId) => {
    axios
      .delete(`http://localhost:8080/api/expenses/user/${userId}/${expenseId}`)
      .then(() => {
        console.log("Expense deleted successfully.");

        // Actualizează cheltuielile locale
        setExpenses((prevExpenses) => {
          const updatedExpenses = { ...prevExpenses };
          Object.keys(updatedExpenses).forEach((category) => {
            updatedExpenses[category] = updatedExpenses[category].filter(
              (expense) => expense.id !== expenseId
            );
          });
          return updatedExpenses;
        });

        // Recalculează totalul cheltuielilor
        const updatedTotalExpenses =
          totalExpenses -
            expenses[selectedCategory]?.find(
              (expense) => expense.id === expenseId
            )?.amount || 0;
        setTotalExpenses(updatedTotalExpenses);

        // Actualizează bugetul rămas
        setBudget((prevBudget) => ({
          ...prevBudget,
          remainingAmount: prevBudget.amount - updatedTotalExpenses,
        }));

        // Actualizează graficul
        setChartData((prevChartData) => {
          const updatedChartData = { ...prevChartData };
          const categoryIndex =
            updatedChartData.labels.indexOf(selectedCategory);

          if (categoryIndex !== -1) {
            const expenseAmount =
              expenses[selectedCategory]?.find(
                (expense) => expense.id === expenseId
              )?.amount || 0;
            updatedChartData.datasets[0].data[categoryIndex] -= expenseAmount;

            // Dacă categoria nu mai are cheltuieli, elimin-o din grafic
            if (updatedChartData.datasets[0].data[categoryIndex] <= 0) {
              updatedChartData.labels.splice(categoryIndex, 1);
              updatedChartData.datasets[0].data.splice(categoryIndex, 1);
            }
          }

          return updatedChartData;
        });
      })
      .catch((error) => {
        console.error("Error deleting expense:", error);
      });
  };

  return (
    <div className="home-container">
      <h1>
        Welcome, {fullName ? fullName : "User"}
        <FaCog
          className="settings-icon"
          onClick={() => setShowSettings(true)}
        />
      </h1>
      <h2>Here is your journey in {currentMonth}</h2>

      <div className="budget-overview">
        <div>
          <h3>Total Budget:</h3>
          <p>${budget.amount ? budget.amount.toFixed(2) : "Not set yet"}</p>
        </div>
        <div>
          <h3>Remaining Budget:</h3>
          <p>
            $
            {budget.remainingAmount
              ? budget.remainingAmount.toFixed(2)
              : "No expenses yet"}
          </p>
        </div>
        <div>
          <h3>Total Expenses:</h3>
          <p>${totalExpenses ? totalExpenses.toFixed(2) : "No expenses yet"}</p>
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
            <span className="close-icon" onClick={closeSettings}>
              &times;
            </span>
            <h2>Settings</h2>
            <div className="accordion">
              <div
                className={`accordion-item ${
                  expanded === "budget" ? "open" : ""
                }`}
              >
                <button onClick={() => toggleAccordion("budget")}>
                  Edit Monthly Budget and Reset Date
                </button>
                <div className="accordion-content">
                  {expanded === "budget" && (
                    <BudgetForm
                    userId={userId}
                    onSave={(updatedBudget) => setBudget(updatedBudget)}
                    setBudget={setBudget} // Acest prop trebuie transmis explicit
                    totalExpenses={totalExpenses}
                  />
                  )}
                </div>
              </div>
              <div
                className={`accordion-item ${
                  expanded === "statement" ? "open" : ""
                }`}
              >
                <button onClick={() => toggleAccordion("statement")}>
                  Monthly Statement
                </button>
                {expanded === "statement" && (
                  <div className="accordion-content">
                    <MonthlyStatement userId={userId} />
                  </div>
                )}
              </div>
              <div
                className={`accordion-item ${
                  expanded === "editName" ? "open" : ""
                }`}
              >
                <button onClick={() => toggleAccordion("editName")}>
                  Edit Your Name
                </button>
                <div className="accordion-content">
                  {expanded === "editName" && (
                    <EditNameForm userId={userId} onSave={handleSave} />
                  )}
                </div>
              </div>
              <div className="accordion-item">
                <button
                  className="logout-button"
                  onClick={() => {
                    localStorage.removeItem("userId");
                    navigate("/login");
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
      {selectedCategory && (
        <div className="expense-details">
          <h2>Details for {selectedCategory}</h2>
          {expenses[selectedCategory]?.length > 0 ? (
            expenses[selectedCategory].map((expense, index) => (
              <div key={index} className="expense-item">
                {/* Container pentru detalii */}
                <div className="expense-details-container">
                  <div className="expense-info">
                    <p>
                      <strong>Name:</strong> {expense.name}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Amount:</strong> {expense.amount.toFixed(2)} $
                    </p>
                  </div>

                  {/* Container pentru butoane (Edit/Delete) */}
                  <div className="expense-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditExpense(expense)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No expenses found in this category.</p>
          )}
        </div>
      )}

      {/* Adăugare de cheltuieli */}
      {editingExpense && (
        <EditExpenseForm
          userId={userId}
          expense={editingExpense}
          onSave={handleSaveEditedExpense}
          onCancel={handleCancelEdit}
        />
      )}

      <AddExpenseForm
        userId={userId}
        fetchChartData={fetchChartData}
        fetchBudget={fetchBudget}
        onSave={(newExpense) => {
          setExpenses((prevExpenses) => {
            const updatedExpenses = { ...prevExpenses };
            const category = newExpense.category;

            if (!updatedExpenses[category]) {
              updatedExpenses[category] = [];
            }

            updatedExpenses[category].push(newExpense);
            return updatedExpenses;
          });

          // Actualizează graficul
          setChartData((prevChartData) => {
            const updatedChartData = { ...prevChartData }; // Copie a datelor grafice
            const categoryIndex = updatedChartData.labels.indexOf(
              newExpense.category
            );

            if (categoryIndex !== -1) {
              updatedChartData.datasets[0].data[categoryIndex] +=
                newExpense.amount;
            } else {
              updatedChartData.labels.push(newExpense.category);
              updatedChartData.datasets[0].data.push(newExpense.amount);
            }

            return updatedChartData; // Actualizare corectă a stării
          });

          // Actualizează totalul cheltuielilor
          setTotalExpenses((prevTotal) => prevTotal + newExpense.amount);

          // Ajustează bugetul rămas
          setBudget((prevBudget) => ({
            ...prevBudget,
            remainingAmount:
              prevBudget.amount - (totalExpenses + newExpense.amount),
          }));
        }}
      />
    </div>
  );
};

export default Home;
