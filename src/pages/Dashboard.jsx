import React from "react";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  return (
    <Sidebar>
      <div style={styles.container}>
        <h1>Dashboards Page</h1>
        <p>This is a test page to check if navigation is working properly.</p>
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
