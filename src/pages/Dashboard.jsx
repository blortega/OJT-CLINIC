import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { db } from "../firebase"; // Adjust import based on your Firebase setup
import { collection, getDocs } from "firebase/firestore";
import Sidebar from "../components/Sidebar";

const GENDER_COLORS = ["#0088FE", "#FF69B4"]; // Blue for Male, Pink for Female
const CONDITION_COLORS = [
  "#0088FE",
  "#FF69B4",
  "#FFBB28",
  "#00C49F",
  "#FF8042",
]; // Top 5 condition colors

const Dashboard = () => {
  const [genderData, setGenderData] = useState([
    { name: "Male", value: 50 },
    { name: "Female", value: 50 },
  ]);

  const [topConditions, setTopConditions] = useState([]);

  useEffect(() => {
    // Simulate gender distribution updates every 5 seconds
    const interval = setInterval(() => {
      const malePercentage = Math.floor(Math.random() * 100);
      const femalePercentage = 100 - malePercentage;
      setGenderData([
        { name: "Male", value: malePercentage },
        { name: "Female", value: femalePercentage },
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchConditions = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users")); // Adjust collection name if needed
        let conditionCounts = {};

        usersSnapshot.forEach((doc) => {
          const userConditions = doc.data().conditions || [];
          userConditions.forEach((condition) => {
            conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
          });
        });

        // Convert to array, sort by occurrences, and get top 5
        const sortedConditions = Object.entries(conditionCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        setTopConditions(sortedConditions);
      } catch (error) {
        console.error("Error fetching conditions:", error);
      }
    };

    fetchConditions();
  }, []);

  return (
    <Sidebar>
      <div style={styles.container}>
        <h1>Dashboard</h1>
        <p>This is a test page to check if navigation is working properly.</p>

        <div style={styles.chartWrapper}>
          {/* Gender Pie Chart */}
          <div style={styles.chartContainer}>
            <h2>Gender Distribution</h2>
            <PieChart width={300} height={300}>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {genderData.map((entry, index) => (
                  <Cell
                    key={`cell-gender-${index}`}
                    fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          {/* Top 5 Conditions Pie Chart */}
          <div style={styles.chartContainer}>
            <h2>Top 5 Conditions</h2>
            <PieChart width={300} height={300}>
              <Pie
                data={topConditions}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {topConditions.map((entry, index) => (
                  <Cell
                    key={`cell-condition-${index}`}
                    fill={CONDITION_COLORS[index % CONDITION_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

const styles = {
  container: {
    padding: "20px",
    textAlign: "center",
    maxWidth: "100%", // Prevents content from exceeding screen width
    overflowX: "hidden", // Removes unwanted horizontal scroll
  },
  chartWrapper: {
    display: "flex",
    flexWrap: "wrap", // Ensures charts wrap instead of causing horizontal overflow
    justifyContent: "center", // Centers the charts and prevents them from going off-screen
    alignItems: "center",
    gap: "20px", // Adds spacing between charts
    width: "100%",
  },
  chartContainer: {
    maxWidth: "100%",
    minWidth: "320px", // Ensures proper spacing on small screens
  },
};

export default Dashboard;
