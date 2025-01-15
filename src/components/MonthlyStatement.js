import React, { useState } from "react";
import axios from "axios";
import "../styles/MonthlyStatement.css"; // Fișierul CSS personalizat

const MonthlyStatement = ({ userId }) => {
  const [selectedMonths, setSelectedMonths] = useState([]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const toggleMonthSelection = (month) => {
    setSelectedMonths((prevSelected) =>
      prevSelected.includes(month)
        ? prevSelected.filter((m) => m !== month)
        : [...prevSelected, month]
    );
  };

  const downloadExpensesCsv = async () => {
    if (selectedMonths.length === 0) {
      console.error("No months selected!");
      return;
    }

    const params = new URLSearchParams();
    selectedMonths.forEach((month) => params.append("selectedMonths", month));

    try {
      const response = await axios.post(
        "http://localhost:8080/api/expenses/generateCsv",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const fileData = response.data;
      const blob = new Blob([atob(fileData.fileContent)], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      // Creează un link pentru descărcare
      const link = document.createElement("a");
      link.href = url;
      link.download = fileData.fileName || "expenses.csv"; // Folosește numele fișierului din răspuns
      link.click();

      // Cură URL-ul
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating CSV:", error.response || error);
    }
  };

  return (
    <div className="monthly-statement">
      <h3>Select Months</h3>
      <div className="multi-select">
        {months.map((month, index) => (
          <div
            key={index}
            className={`multi-select-item ${
              selectedMonths.includes(month) ? "selected" : ""
            }`}
            onClick={() => toggleMonthSelection(month)}
          >
            {month}
          </div>
        ))}
      </div>
      <button
        className="get-statement-download-btn"
        onClick={downloadExpensesCsv}
        disabled={selectedMonths.length === 0}
      >
        Get Statement
      </button>
    </div>
  );
};

export default MonthlyStatement;
