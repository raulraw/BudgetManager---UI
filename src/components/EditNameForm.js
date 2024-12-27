// src/components/EditNameForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditNameForm = ({ userId, onSave }) => {
  const [newName, setNewName] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:8080/api/users/${userId}/name`,
        { name: newName }
      );

      if (response.status === 200) {
        

        // Alertează utilizatorul
        alert('Name updated successfully!');

        // Notifică componenta părinte că numele a fost salvat
        onSave(newName);
      }
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Failed to update name');
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
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default EditNameForm;
