import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { FaUsers, FaChartLine, FaShoppingCart, FaClock } from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [data, setData] = useState({
    newUsers: 1689,
    pendingVerification: 93,
    netSales: 12465,
    transactions: 58,
    cancellationRate: 3,
    averageTransactions: 12,
    grossSales: 20581,
  });

  const [transactionsData, setTransactionsData] = useState([
    { name: "Mon", value: 8 },
    { name: "Tue", value: 15 },
    { name: "Wed", value: 12 },
    { name: "Thu", value: 20 },
    { name: "Fri", value: 10 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTransactionsData((prevData) =>
        prevData.map((day) => ({
          ...day,
          value: Math.max(
            0,
            day.value +
              (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5)
          ),
        }))
      );

      setData((prevData) => ({
        ...prevData,
        cancellationRate: Math.max(
          0,
          Math.min(
            10,
            prevData.cancellationRate + (Math.random() > 0.5 ? 0.5 : -0.5)
          )
        ),
        grossSales: Math.max(
          10000,
          prevData.grossSales + Math.floor(Math.random() * 500 - 250)
        ),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <Sidebar>
        <div style={styles.content}>
          <h2>Dashboard</h2>
          <div style={styles.statsGrid}>
            {/** Card 1 */}
            <div style={styles.card}>
              <FaUsers style={styles.icon} />
              <div>
                <h4>New Users</h4>
                <p>{data.newUsers.toLocaleString()}</p>
                <span style={styles.greenText}>⬆️ 8.5% Up from yesterday</span>
              </div>
            </div>
            {/** Card 2 */}
            <div style={styles.card}>
              <FaClock style={styles.icon} />
              <div>
                <h4>Pending Verification</h4>
                <p>{data.pendingVerification}</p>
                <span style={styles.linkText}>Verify users now</span>
              </div>
            </div>
            {/** Card 3 */}
            <div style={styles.card}>
              <FaChartLine style={styles.icon} />
              <div>
                <h4>Net Sales</h4>
                <p>${data.netSales.toLocaleString()}</p>
                <span style={styles.greenText}>⬆️ 0.5% Up from past month</span>
              </div>
            </div>
            {/** Card 4 */}
            <div style={styles.card}>
              <FaShoppingCart style={styles.icon} />
              <div>
                <h4>Transactions</h4>
                <p>{data.transactions}</p>
                <span style={styles.greenText}>⬆️ 1.8% Up from yesterday</span>
              </div>
            </div>
          </div>

          <h2>Performance</h2>
          <div style={styles.performanceGrid}>
            {/** Graph 1 */}
            <div style={styles.performanceCard}>
              <h4>Cancellation Rate: {data.cancellationRate.toFixed(1)}%</h4>
              <span style={styles.redText}>⬇️ 1% Decrease</span>
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={transactionsData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="red"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/** Graph 2 */}
            <div style={styles.performanceCard}>
              <h4>Average Transactions: {data.averageTransactions}</h4>
              <span style={styles.greenText}>⬆️ 3.5% Increase</span>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={transactionsData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f0ad4e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/** Graph 3 */}
            <div style={styles.performanceCard}>
              <h4>Gross Sales: ${data.grossSales.toLocaleString()}</h4>
              <span style={styles.greenText}>⬆️ 1.1% Increase</span>
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={transactionsData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="green"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

const styles = {
  container: {
    overflowX: "hidden",
    display: "flex",
  },
  content: {
    marginLeft: "20px",
    padding: "30px",
    backgroundColor: "#f8f9fc",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  icon: {
    fontSize: "24px",
    color: "#555",
  },
  greenText: {
    color: "#28a745",
    fontSize: "12px",
  },
  redText: {
    color: "#dc3545",
    fontSize: "12px",
  },
  linkText: {
    color: "#007bff",
    fontSize: "12px",
    cursor: "pointer",
  },
  performanceGrid: {
    marginTop: "30px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  performanceCard: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
};

export default Dashboard;
