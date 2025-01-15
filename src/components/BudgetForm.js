import { useState } from "react";
import axios from "axios";
import "../styles/BudgetForm.css";

function BudgetForm({ userId, onSave, setBudget, totalExpenses }) {
  const [newBudget, setNewBudget] = useState("");
  const [resetDay, setResetDay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleBudgetChange = (e) => {
    setNewBudget(e.target.value);
  };

  const handleResetDayChange = (e) => {
    setResetDay(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Previne apelurile multiple
    setIsSubmitting(true);

    axios
      .post(`http://localhost:8080/api/users/${userId}/budget`, {
        amount: newBudget,
        resetDay: resetDay,
      })
      .then((response) => {
        const updatedBudget = response.data;
        const newRemainingAmount = updatedBudget.amount - totalExpenses;

        if (typeof setBudget === "function") {
          setBudget((prevBudget) => ({
            ...prevBudget,
            amount: updatedBudget.amount,
            remainingAmount: newRemainingAmount,
          }));
        }

        setNewBudget("");
        setResetDay("");
        setMessage({ type: "success", text: "Budget updated successfully!" });

        // Ascunde popup-ul după câteva secunde
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      })
      .catch((error) => {
        console.error("Error updating budget:", error);
        setMessage({
          type: "error",
          text: "Failed to update budget. Please try again.",
        });

        // Ascunde popup-ul după câteva secunde
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      })
      .finally(() => setIsSubmitting(false));
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
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </form>

      {/* Popup pentru mesaje */}
      {message.text && (
        <div
          className={`popup-message ${message.type}`}
          role="alert"
          aria-live="assertive"
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

export default BudgetForm;
