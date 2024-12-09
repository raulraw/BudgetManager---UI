import { useState } from "react";
import axios from "axios";

function BudgetForm({ userId }) {
  const [amount, setAmount] = useState("");
  const [resetDay, setResetDay] = useState("");
  const [newBudget, setNewBudget] = useState(''); // Pentru valoarea noului buget
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
            amount: newBudget, // Noul buget introdus
            resetDay: resetDay, // Ziua de resetare introdusă
        })
        .then((response) => {
            alert('Budget updated successfully!');
            const updatedBudget = response.data;
            setNewBudget(updatedBudget.amount); // Actualizăm starea cu bugetul primit de la server
            setResetDay(updatedBudget.resetDay); // Actualizăm starea cu ziua de resetare primită
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
                value={newBudget} // Legăm starea de input
                onChange={handleBudgetChange} // Actualizăm starea la schimbare
                required
            />
            <label>Reset Date (1-31):</label>
            <input
                type="number"
                placeholder="Enter reset day"
                min="1"
                max="31"
                value={resetDay} // Legăm starea de input
                onChange={handleResetDayChange} // Actualizăm starea la schimbare
                required
            />
            <button type="submit">Save</button>
        </form>
        {message && <p>{message}</p>}
      </div>
   
  );
}

export default BudgetForm;
