import React from "react";
import Sidebar from "../components/Sidebar";

const Setting = () => {
  return (
    <Sidebar>
      <div style={styles.container}>
        <h1 style={styles.text}>Settings Page</h1>
        <p style={styles.text}>This is a test page to check if navigation is working properly.</p>
      </div>
    </Sidebar>
  );
};

const styles = {
  container: {
    padding: "20px",
    textAlign: "center",
  },
  text:{
    color: 'black',
  }
};

export default Setting;
