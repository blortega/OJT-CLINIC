import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase";
import { FiPlus } from "react-icons/fi";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      user.name || "Not Available",
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

        {/* Search and Add User Button Container */}
        <div style={styles.searchContainer}>
          <input
            style={styles.searchBar}
            type="text"
            placeholder="Search by Name, Email, or Role"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            style={{
              ...styles.addUserButton,
              backgroundColor: isHovered ? "#162d5e" : "#1e3a8a",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <FiPlus style={styles.addIcon} />
            Add Patient
          </button>
        </div>

        <div style={styles.card}>
          {loading ? (
            <div>Loading...</div>
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
                {users.filter(filterUsers).map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      ...(users.indexOf(user) % 2 === 0
                        ? styles.evenRow
                        : styles.oddRow),
                      ...styles.tableRow,
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
  searchContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
    margin: "0 auto 15px auto",
  },
  searchBar: {
    width: "250px",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    color: "#000",
  },
  addUserButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#1e3a8a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.3s",
    fontSize: "16px",
    fontWeight: "bold",
  },
  addIcon: {
    fontSize: "20px",
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
  tableCell: {
    padding: "12px",
    borderBottom: "1px solid #ccc",
    borderRight: "1px solid #ddd",
    color: "#000",
  },
  evenRow: {
    backgroundColor: "#f9f9f9",
  },
  oddRow: {
    backgroundColor: "#ffffff",
  },
  tableRow: {
    cursor: "pointer",
    transition: "background-color 0.3s ease, background 0.2s",
  },
};

export default ManageUser;
