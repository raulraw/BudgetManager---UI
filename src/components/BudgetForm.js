import { useState } from "react";
import axios from "axios";

function BudgetForm({ userId, onSave, setBudget, totalExpenses }) {
    const [newBudget, setNewBudget] = useState('');
    const [resetDay, setResetDay] = useState('');
    const [message, setMessage] = useState("");
  
    const handleBudgetChange = (e) => {
      setNewBudget(e.target.value);
    };
  
    const handleResetDayChange = (e) => {
      setResetDay(e.target.value);
    };
  
    const handleSubmit = (e) => {
        e.preventDefault();
        axios
          .post(`http://localhost:8080/api/users/${userId}/budget`, {
            amount: newBudget,
            resetDay: resetDay,
          })
          .then((response) => {
            alert('Budget updated successfully!');
            const updatedBudget = response.data;
      
            // Calculează noul remainingAmount
            const newRemainingAmount = updatedBudget.amount - totalExpenses;
      
            // Actualizează starea bugetului în Home
            setBudget((prevBudget) => ({
              ...prevBudget,
              amount: updatedBudget.amount,
              remainingAmount: newRemainingAmount,
            }));
      
            setNewBudget(''); // Resetează inputul
            setResetDay(''); // Resetează inputul
          })
          .catch((error) => {
            console.error('Error updating budget:', error);
            alert('Failed to update budget. Please try again.');
          });
      };
  
    return (
      <div className="accordion-content open">
        <form onSubmit={handleSubmit}>
          <label>Monthly Budget:</label>
          <input
            type="number"
            placeholder="Enter new budget"
            value={newBudget}
            onChange={handleBudgetChange}
            required
          />
          <label>Reset Date (1-31):</label>
          <input
            type="number"
            placeholder="Enter reset day"
            min="1"
            max="31"
            value={resetDay}
            onChange={handleResetDayChange}
            required
          />
          <button type="submit">Save</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    );
  }
  
  export default BudgetForm;

