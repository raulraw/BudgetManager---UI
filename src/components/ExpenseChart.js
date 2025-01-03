import React, { useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

// Înregistrăm componentele ChartJS
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const ExpenseChart = ({ data, onChartClick }) => {
  const chartRef = useRef(null);

  const handleChartClick = (event) => {
    const chart = chartRef.current;
    if (chart) {
      const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true });
      if (elements.length > 0) {
        const clickedIndex = elements[0]?.index;
        const clickedCategory = data.labels[clickedIndex];
        console.log('Clicked index:', clickedIndex);
        console.log('Clicked category:', clickedCategory);

        if (clickedCategory) {
          onChartClick(clickedCategory);
        }
      } else {
        console.log('No elements clicked');
      }
    }
  };

  return (
    <div className="expenses-chart">
      <p>Expense Distribution</p>
      <Doughnut
        ref={chartRef}
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => `${context.label}: $${context.raw.toFixed(2)}`,
              },
            },
          },
          onClick: handleChartClick, // Înregistrăm click-ul
        }}
      />
    </div>
  );
};

export default ExpenseChart;