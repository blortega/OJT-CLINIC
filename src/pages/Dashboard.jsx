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
    { name: "Male", value: 0 },
    { name: "Female", value: 0 },
  ]);

  const [topConditions, setTopConditions] = useState([]);

  useEffect(() => {
    const fetchGenderData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        let maleCount = 0;
        let femaleCount = 0;

        usersSnapshot.forEach((doc) => {
          const gender = doc.data().gender;
          if (gender === "Male") {
            maleCount += 1;
          } else if (gender === "Female") {
            femaleCount += 1;
          }
        });

        setGenderData([
          { name: "Male", value: maleCount },
          { name: "Female", value: femaleCount },
        ]);
      } catch (error) {
        console.error("Error fetching gender data:", error);
      }
    };

    fetchGenderData();
  }, []);

  useEffect(() => {
    const fetchConditions = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        let conditionCounts = {};

        usersSnapshot.forEach((doc) => {
          const userConditions = doc.data().conditions || [];
          userConditions.forEach((condition) => {
            conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
          });
        });

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
        <h1 style={styles.text}>Dashboard</h1>
        <p style={styles.text}>
          This is a test page to check if navigation is working properly.
        </p>

        <div style={styles.chartWrapper}>
          <div style={styles.chartContainer}>
            <h2 style={styles.text}>Gender Distribution</h2>
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

          <div style={styles.chartContainer}>
            <h2 style={styles.text}>Top 5 Conditions</h2>
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
    maxWidth: "100%",
    overflowX: "hidden",
  },
  chartWrapper: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    width: "100%",
  },
  chartContainer: {
    maxWidth: "100%",
    minWidth: "320px",
  },
  text: {
    color: "black",
  },
};

export default Dashboard;
