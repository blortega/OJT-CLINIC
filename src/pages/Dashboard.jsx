import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { db, app } from "../firebase";
import { collection, getDocs,  getFirestore } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css"; // ✅ Importing the new CSS file
import InventoryAlert from "../components/InventoryAlert";

const GENDER_COLORS = ["#0088FE", "#FF69B4"];
const CONDITION_COLORS = [
  "#0088FE",
  "#FF69B4",
  "#FFBB28",
  "#00C49F",
  "#FF8042",
];

const Dashboard = () => {
  const [genderData, setGenderData] = useState([
    { name: "Male", value: 0 },
    { name: "Female", value: 0 },
  ]);

  const [medicines, setMedicines] = useState([]);

  const [topConditions, setTopConditions] = useState([]);

  const [topMedicines, setTopMedicines] = useState([]);

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

  useEffect(() => {
    const fetchTopRequestedMedicines = async () => {
      try {
        const requestsSnapshot = await getDocs(collection(db, "medicineRequests"));
        const countMap = {};
  
        requestsSnapshot.forEach((doc) => {
          const medicine = doc.data().medicine;
          if (medicine) {
            countMap[medicine] = (countMap[medicine] || 0) + 1;
          }
        });
  
        const sortedTopMedicines = Object.entries(countMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
  
        setTopMedicines(sortedTopMedicines);
      } catch (error) {
        console.error("Error fetching top requested medicines:", error);
      }
    };
  
    fetchTopRequestedMedicines();
  }, []);
  

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const db = getFirestore(app);
        const medicineCollection = collection(db, "medicine");
        const snapshot = await getDocs(medicineCollection);
        const medicineLists = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMedicines(medicineLists);
      } catch (error) {
        toast.error("Failed to fetch Medicines!");
        console.error("Failed to fetch Medicines: ", error);
      }
    };

    fetchMedicines();
  }, []);

  const areValuesEqual = (data) => {
    if (data.length === 0) return false;
    const firstValue = data[0].value;
    return data.every((item) => item.value === firstValue);
  };

  return (
    <Sidebar>
      <div className="dashboard-container">
        <h1 className="dashboard-text">Dashboard</h1>
        <p className="dashboard-text">
          This is a test page to check if navigation is working properly.
        </p>

        <div className="chart-wrapper">
          <div className="chart-container">
            <h2 className="dashboard-text">Gender Distribution</h2>
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

          <InventoryAlert medicines={medicines} />

          <div className="chart-container">
            <h2 className="dashboard-text">Top 5 Most Requested Medicine</h2>
            <ResponsiveContainer width="100%" minWidth={400} height={300}>
              <BarChart
                data={topMedicines}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  tickFormatter={(value) =>
                    value.length > 10 ? `${value.slice(0, 10)}...` : value
                  }
                />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(value, name, props) => [
                    value,
                    props.payload.name,
                  ]}
                />
                {/* <Legend /> <-- removed to prevent "value" label under chart */}
                <Bar dataKey="value" fill="#8884d8">
                  {topMedicines.map((entry, index) => (
                    <Cell
                      key={`cell-bar-${index}`}
                      fill={CONDITION_COLORS[index % CONDITION_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default Dashboard;
