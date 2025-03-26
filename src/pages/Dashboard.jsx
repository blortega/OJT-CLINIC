import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import Sidebar from "../components/Sidebar";

const COLORS = ["#0088FE", "#FF69B4"]; // Blue for Male, Pink for Female

const Dashboard = () => {
  const [data, setData] = useState([
    { name: "Male", value: 50 },
    { name: "Female", value: 50 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const malePercentage = Math.floor(Math.random() * 100);
      const femalePercentage = 100 - malePercentage;
      setData([
        { name: "Male", value: malePercentage },
        { name: "Female", value: femalePercentage },
      ]);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Sidebar>
      <div style={styles.container}>
        <h1>Dashboards Page</h1>
        <p>This is a test page to check if navigation is working properly.</p>
        <PieChart width={300} height={300}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </Sidebar>
  );
};

const styles = {
  container: {
    padding: "20px",
    textAlign: "center",
  },
};

export default Dashboard;
