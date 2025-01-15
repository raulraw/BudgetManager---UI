import React, { useState } from "react";
import axios from "axios";
import "../styles/EditNameForm.css";

const EditNameForm = ({ userId, onSave }) => {
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Previne apelurile multiple
    setIsSubmitting(true);

    try {
      const response = await axios.put(
        `http://localhost:8080/api/users/${userId}/name`,
        { name: newName }
      );

      if (response.status === 200) {
        setMessage({ type: "success", text: "Name updated successfully!" });

        // Notifică componenta părinte că numele a fost salvat
        onSave(newName);

        // Resetează formularul
        setNewName("");

        // Ascunde mesajul după câteva secunde
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      console.error("Error updating name:", error);
      setMessage({
        type: "error",
        text: "Failed to update name. Please try again.",
      });

      // Ascunde mesajul după câteva secunde
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>New Name:</label>
        <input
          type="text"
          placeholder="Enter new name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
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
};

export default EditNameForm;
