import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";

const MonthlyExpensesChart = ({ userId }) => {
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Preluăm datele pentru cheltuielile lunare
        axios
            .get(`http://localhost:8080/api/expenses/user/${userId}/months`) // Asigură-te că URL-ul este corect
            .then((response) => {
                const data = response.data;
                console.log("Cheltuieli lunare:", data); // Verificăm ce date sunt returnate
                const labels = Object.keys(data).map((month) => `Luna ${month}`);
                const values = Object.values(data);

                // Setăm datele pentru grafic
                setChartData({
                    labels,
                    datasets: [
                        {
                            label: "Cheltuieli (RON)",
                            data: values,
                            backgroundColor: "rgba(75, 192, 192, 0.6)",
                            borderColor: "rgba(75, 192, 192, 1)",
                            borderWidth: 1,
                        },
                    ],
                });

                setLoading(false);
            })
            .catch((error) => {
                console.error("Eroare la preluarea datelor:", error);
                setLoading(false);
            });
    }, [userId]);

    if (loading) {
        return <p>Se încarcă datele...</p>;
    }

    return (
        <div style={{ width: "80%", margin: "0 auto" }}>
            <h2>Cheltuieli lunare</h2>
            <Bar
                data={chartData}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: "top",
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                }}
            />
        </div>
    );
};

export default MonthlyExpensesChart;
