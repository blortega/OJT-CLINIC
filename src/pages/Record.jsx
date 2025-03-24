import React from "react";
import Sidebar from "../components/Sidebar";

const Record = () => {
  return (
    <Sidebar>
      <div style={styles.container}>
        <h1>Records Page</h1>
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

export default Record;
