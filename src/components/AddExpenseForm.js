import { useState } from "react";
import axios from "axios";
import "../styles/AddExpenseForm.css";

function AddExpenseForm({ userId, onSave }) {
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
  });

  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Valorile enum pentru categorii
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
      const response = await axios.post(`http://localhost:8080/api/expenses`, {
        ...formData,
        name: formData.description, // Mapează description pe name
        userId,
      });

      const newExpense = response.data;
      newExpense.description = newExpense.name; // Mapează name pe description pentru afișare
      onSave(newExpense);

      // Resetează formularul și închide imediat
      setFormData({ amount: "", category: "", description: "", date: "" });
      setMessage("");
      setSuccessMessage("Your expense has been added successfully!");
      setIsFormVisible(false); // Închide formularul direct
    } catch (error) {
      console.error("Error adding expense:", error);
      setMessage("Failed to add expense. Please try again.");
    }
  };

  const handleClose = () => {
    if (isAnimating) return; // Previne închiderea dacă animația este deja în derulare

    setIsAnimating(true); // Activăm animația
    const modal = document.querySelector(".modal-overlay");
    if (modal) {
      modal.classList.add("fade-out");
      setTimeout(() => {
        setIsFormVisible(false); // După animatie setăm starea la false
        modal.classList.remove("fade-out");
        setIsAnimating(false); // După ce animatia se încheie, setăm starea
      }, 500); // Timpul pentru animația de închidere
    }
  };

  const handleToggle = () => {
    if (isFormVisible) {
      handleClose(); // Dacă formularul este deja vizibil, închide-l
    } else {
      setIsFormVisible(true); // Dacă formularul nu este vizibil, deschide-l
    }
  };

  // Previne închiderea formularului dacă faci click pe câmpurile de completat
  const handleFormClick = (e) => {
    e.stopPropagation(); // Previne propagarea click-ului către overlay
  };

  return (
    <>
      {/* Overlay pentru formular */}
      {isFormVisible && (
        <div
          className="modal-overlay visible"
          onClick={handleClose} // Închide formularul la clic pe overlay
        >
          <form
            onSubmit={handleSubmit}
            className="add-expense-form"
            onClick={handleFormClick} // Previi închiderea când faci click pe formular
          >
            <h2 className="add-expense-form-title">Add Expense</h2>
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className="add-expense-form-input"
            />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="add-expense-form-select"
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
              className="add-expense-form-input"
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={handleChange}
              className="add-expense-form-textarea"
            />
            <button type="submit" className="add-expense-form-button">
              Add Expense
            </button>
            {message && <p className="add-expense-error-message">{message}</p>}
          </form>
        </div>
      )}

      {/* Iconița care deschide și închide formularul */}
      <div className="add-expense-button" onClick={handleToggle}>
        <span className="add-expense-plus-icon">+</span>
      </div>

      {/* Mesaj de succes */}
      {successMessage && (
        <div className="add-expense-success-popup">{successMessage}</div>
      )}
    </>
  );
}

export default AddExpenseForm;
