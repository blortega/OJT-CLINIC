import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const Record = () => {
  const [search, setSearch] = useState(""); // For tracking selected filters

  // Handle checkbox changes for multiple filters
  const handleCheckboxChange = (e, gender) => {
    if (e.target.checked) {
      setSearch((prev) => [...prev, gender]);
    } else {
      setSearch((prev) => prev.filter((item) => item !== gender));
    }
  };

  // Handle dropdown change
  const handleDropdownChange = (e) => {
    setSearch([e.target.value]); // Only one gender can be selected in the dropdown
  };

  return (
    <Sidebar>
      <div style={styles.container}>
        <h1 style={styles.text}>Records Page</h1>
        <p style={styles.text}>
          This is a test page to check if navigation is working properly.
        </p>

        {/* Dropdown Select Filter */}
        <div style={styles.filterSection}>
          <h3>Dropdown Select:</h3>
          <select
            value={search}
            onChange={handleDropdownChange}
            style={styles.select}
          >
            <option value="">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Checkbox Filter */}
        <div style={styles.filterSection}>
          <h3>Checkbox Filter:</h3>
          <label>
            <input
              type="checkbox"
              checked={search.includes("Male")}
              onChange={(e) => handleCheckboxChange(e, "Male")}
            />
            Male
          </label>
          <label>
            <input
              type="checkbox"
              checked={search.includes("Female")}
              onChange={(e) => handleCheckboxChange(e, "Female")}
            />
            Female
          </label>
          <label>
            <input
              type="checkbox"
              checked={search.includes("Other")}
              onChange={(e) => handleCheckboxChange(e, "Other")}
            />
            Other
          </label>
        </div>

        {/* Chips Filter */}
        <div style={styles.filterSection}>
          <h3>Chips Filter:</h3>
          {search && (
            <div style={styles.chipContainer}>
              {search.map((gender) => (
                <span key={gender} style={styles.chip}>
                  {gender}{" "}
                  <span
                    style={styles.chipClose}
                    onClick={() =>
                      setSearch(search.filter((item) => item !== gender))
                    }
                  >
                    x
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tab Filter */}
        <div style={styles.filterSection}>
          <h3>Tab Filter:</h3>
          {["Male", "Female", "Other"].map((gender) => (
            <div
              key={gender}
              onClick={() => setSearch(gender)}
              style={{
                ...styles.tab,
                backgroundColor: search === gender ? "#1e3a8a" : "#ccc",
              }}
            >
              {gender}
            </div>
          ))}
        </div>
      </div>
    </Sidebar>
  );
};

const styles = {
  container: {
    padding: "20px",
    textAlign: "center",
  },
  text: {
    color: "black",
  },
  filterSection: {
    marginTop: "20px",
    textAlign: "left",
  },
  select: {
    padding: "8px",
    margin: "10px 0",
    width: "200px",
  },
  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    marginTop: "10px",
  },
  chip: {
    backgroundColor: "#1e3a8a",
    color: "white",
    padding: "5px 10px",
    borderRadius: "16px",
    display: "inline-block",
    cursor: "pointer",
  },
  chipClose: {
    marginLeft: "8px",
    cursor: "pointer",
  },
  tab: {
    display: "inline-block",
    padding: "10px 20px",
    margin: "5px",
    cursor: "pointer",
    borderRadius: "5px",
  },
};

export default Record;
