import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase"; // Assuming you have a firebase.js file that exports the initialized Firebase app

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const db = getFirestore(app); // Get Firestore instance
        const usersCollection = collection(db, "users"); // Access the 'users' collection
        const snapshot = await getDocs(usersCollection); // Get all documents from the collection
        const usersList = snapshot.docs.map((doc) => doc.data()); // Map the documents to an array
        setUsers(usersList);
      } catch (error) {
        // No toast notification, just a console log or other method if needed
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Function to check if the search term matches any of the fields, including "Not Available"
  const filterUsers = (user) => {
    const searchLower = search.toLowerCase();
    const fieldsToSearch = [
      user.name || "Not Available", // Use "Not Available" as default if the field is empty
      user.email || "Not Available",
      user.role || "Not Available",
    ];

    return fieldsToSearch.some((field) =>
      field.toLowerCase().includes(searchLower)
    );
  };

  return (
    <Sidebar>
      <div style={styles.container}>
        <h1 style={styles.heading}>Manage User Page</h1>
        <p style={styles.subheading}>
          This is a test page to check if navigation is working properly.
        </p>

        {/* Search Bar */}
        <input
          style={styles.searchBar}
          type="text"
          placeholder="Search by Name, Email, or Role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={styles.card}>
          {loading ? (
            <div>Loading...</div> // Replace this with a Spinner component if you have one
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHead}>Name</th>
                  <th style={styles.tableHead}>Email</th>
                  <th style={styles.tableHead}>Role</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(filterUsers) // Filter based on the search term
                  .map((user, index) => (
                    <tr
                      key={index}
                      style={{
                        ...(index % 2 === 0 ? styles.evenRow : styles.oddRow),
                        ...styles.tableRow, // Apply hover effect here
                      }}
                    >
                      <td style={styles.tableCell}>
                        {user.name || "Not Available"}
                      </td>
                      <td style={styles.tableCell}>
                        {user.email || "Not Available"}
                      </td>
                      <td style={styles.tableCell}>
                        {user.role || "Not Available"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
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
  heading: {
    fontSize: "32px",
    color: "#333",
    marginBottom: "20px",
  },
  subheading: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "30px",
  },
  searchBar: {
    width: "50%", // Adjusted from full width to 50% for better balance
    minWidth: "250px", // Ensures it doesn't shrink too much on small screens
    padding: "8px",
    margin: "10px auto", // Centers it properly
    display: "block",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  card: {
    width: "80%",
    margin: "auto",
    overflowX: "auto",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    background: "#fff",
  },
  tableHead: {
    padding: "12px",
    background: "#1e3a8a",
    color: "#fff",
    borderBottom: "2px solid #ddd",
  },
  tableRow: { transition: "background 0.2s" },
  tableCell: {
    padding: "12px",
    borderBottom: "1px solid #ccc",
    borderRight: "1px solid #ddd",
  },
  evenRow: {
    backgroundColor: "#f9f9f9",
  },
  oddRow: {
    backgroundColor: "#ffffff",
  },
  tableRow: {
    cursor: "pointer", // Change the cursor to indicate hover
    transition: "background-color 0.3s ease", // Smooth transition for background color
  },
};

export default ManageUser;
