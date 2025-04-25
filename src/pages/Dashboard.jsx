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
import { collection, getDocs, getFirestore } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";
import InventoryAlert from "../components/InventoryAlert";


const GENDER_COLORS = ["#0088FE", "#FF69B4"];
const CONDITION_COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#8543E0"];
const MEDICINE_COLORS = ["#00C49F", "#0088FE", "#FFBB28", "#FF8042", "#8884d8"];
const COMPLAINT_COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c"];
const MALE_COLORS = ["#0088FE", "#4285F4", "#00B2FF", "#0070FF", "#5C7AEA"];
const FEMALE_COLORS = ["#FF69B4", "#FF8FAB", "#FF5C8D", "#FF96A7", "#FFC0CB"];


const Dashboard = () => {
  const [genderData, setGenderData] = useState([
    { name: "Male", value: 0 },
    { name: "Female", value: 0 },
  ]);

  const [medicines, setMedicines] = useState([]);
  const [topConditions, setTopConditions] = useState([]);
  const [topMedicines, setTopMedicines] = useState([]);
  const [topComplaints, setTopComplaints] = useState([]);
  const [maleComplaints, setMaleComplaints] = useState([]);
  const [femaleComplaints, setFemaleComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topVisitors, setTopVisitors] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
    

        await Promise.all([
          fetchGenderData(),
          fetchConditions(),
          fetchTopRequestedMedicines(),
          fetchGenderSpecificComplaints(),
          fetchTopComplaints(),
          fetchMedicines(),
          fetchTopVisitors(),
        
        ]);


        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchTopVisitors = async () => {
    try {
      const requestsSnapshot = await getDocs(collection(db, "medicineRequests"));
      const userMap = {};
  
      requestsSnapshot.forEach((doc) => {
        const { firstname, middleInitial, lastname } = doc.data();
        const fullName = `${firstname} ${middleInitial}. ${lastname}`;
  
        if (fullName) {
          userMap[fullName] = (userMap[fullName] || 0) + 1;
        }
      });
  
      const sortedVisitors = Object.entries(userMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
  
      setTopVisitors(sortedVisitors);
    } catch (error) {
      console.error("Error fetching top visitors:", error);
    }
  };

  const fetchGenderSpecificComplaints = async () => {
    try {
      const requestsSnapshot = await getDocs(collection(db, "medicineRequests"));
      
      // Count complaints by gender
      const maleComplaintMap = {};
      const femaleComplaintMap = {};
      
      requestsSnapshot.forEach((doc) => {
        const data = doc.data();
        const gender = data.gender;
        const complaint = data.complaint;
        
        if (!complaint) return;
        
        if (gender === "Male") {
          maleComplaintMap[complaint] = (maleComplaintMap[complaint] || 0) + 1;
        } else if (gender === "Female") {
          femaleComplaintMap[complaint] = (femaleComplaintMap[complaint] || 0) + 1;
        }
      });
      
      // Sort and get top 10 complaints for each gender
      const sortedMaleComplaints = Object.entries(maleComplaintMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
        
      const sortedFemaleComplaints = Object.entries(femaleComplaintMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
        
      setMaleComplaints(sortedMaleComplaints);
      setFemaleComplaints(sortedFemaleComplaints);
      
    } catch (error) {
      console.error("Error fetching gender-specific complaints:", error);
    }
  };
  

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

  const fetchTopComplaints = async () => {
    try {
      const requestsSnapshot = await getDocs(collection(db, "medicineRequests"));
      const complaintMap = {};

      requestsSnapshot.forEach((doc) => {
        const complaint = doc.data().complaint;
        if (complaint) {
          complaintMap[complaint] = (complaintMap[complaint] || 0) + 1;
        }
      });

      const sortedComplaints = Object.entries(complaintMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      setTopComplaints(sortedComplaints);
    } catch (error) {
      console.error("Error fetching top complaints:", error);
    }
  };
 
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
      console.error("Failed to fetch Medicines: ", error);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${payload[0].payload.name}`}</p>
          <p className="tooltip-value">{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Modified PieChartCard with adjusted height and positioning
  const PieChartCard = ({ title, data, colors, icon }) => (
    <div className="dashboard-card">
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        <h2>{title}</h2>
      </div>
      <div className="card-content pie-chart-content">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"  // Moved up slightly to give more room for labels
              outerRadius={80}  // Reduced slightly to provide more space
              dataKey="value"
              labelLine={true}  // Enable label lines
              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const BarChartCard = ({ title, data, colors, icon }) => (
    <div className="dashboard-card">
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        <h2>{title}</h2>
      </div>
      <div className="card-content">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
              tickFormatter={(value) =>
                value.length > 12 ? `${value.slice(0, 12)}...` : value
              }
            />
            <YAxis allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Count">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <Sidebar>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Clinic Dashboard</h1>
          <p className="dashboard-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="alert-section">
          <InventoryAlert medicines={medicines} />
        </div>

        
    

        <div className="dashboard-grid">
          <PieChartCard 
            title="Patient Gender Distribution" 
            data={genderData} 
            colors={GENDER_COLORS} 
            icon="👥" 
          />
          
    
          <BarChartCard 
            title="Most Requested Medicines" 
            data={topMedicines} 
            colors={MEDICINE_COLORS} 
            icon="💊" 
          />
          
          <BarChartCard 
            title="Common Patient Complaints" 
            data={topComplaints} 
            colors={COMPLAINT_COLORS} 
            icon="📊" 
          />

<BarChartCard 
  title="Top 5 Frequent Clinic Visitors" 
  data={topVisitors} 
  colors={["#5C7AEA", "#82ca9d", "#8884d8", "#ffc658", "#ff8a65"]} 
  icon="🧍" 
/>

<BarChartCard 
  title="Top 10 Male Patient Complaints" 
  data={maleComplaints} 
  colors={MALE_COLORS} 
  icon="♂️" 
/>

<BarChartCard 
  title="Top 10 Female Patient Complaints" 
  data={femaleComplaints} 
  colors={FEMALE_COLORS} 
  icon="♀️" 
/>

        </div>
      </div>
    </Sidebar>
  );
};

export default Dashboard;