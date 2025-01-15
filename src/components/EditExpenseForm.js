import { useState } from "react";
import axios from "axios";
import "../styles/EditExpenseForm.css";

function EditExpenseForm({ userId, expense, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    amount: expense.amount || "",
    category: expense.category || "",
    description: expense.name || "",
    date: expense.date
      ? new Date(expense.date).toISOString().split("T")[0]
      : "",
  });

  const [message, setMessage] = useState("");

  const categoryOptions = [
    "FOOD",
    "TRANSPORT",
    "ENTERTAINMENT",
    "UTILITIES",
    "OTHER",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !formData.date) {
      setMessage("All fields except description are required.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/api/expenses/user/${userId}/${expense.id}`,
        {
          ...formData,
          name: formData.description,
        }
      );

      const updatedExpense = response.data;
      updatedExpense.description = updatedExpense.name;

      onSave(updatedExpense); // Actualizează datele
    } catch (error) {
      console.error("Error updating expense:", error);
      setMessage("Failed to update expense. Please try again.");
    }
  };

  return (
    <div className="modal-overlay visible">
      <form onSubmit={handleSubmit} className="add-expense-form">
        <h2 className="edit-expense-title">Edit Expense</h2>
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          required
          className="edit-expense-input"
        />
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="edit-expense-select"
        >
          <option value="" disabled>
            Select Category
          </option>
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0) + option.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="edit-expense-input"
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
          className="edit-expense-textarea"
        />
        <button type="submit" className="edit-expense-button">
          Save Changes
        </button>
        <button
          type="button"
          className="edit-expense-cancel-button"
          onClick={onCancel}
        >
          Cancel
        </button>
        {message && <p className="edit-expense-error-message">{message}</p>}
      </form>
    </div>
  );
}

export default EditExpenseForm;