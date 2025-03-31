import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { app } from "../firebase";
import { FiPlus, FiEdit, FiTrash, FiUserX } from "react-icons/fi";
import { FaUserCheck } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    phone: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const db = getFirestore(app);
        const usersCollection = collection(db, "users");
        const snapshot = await getDocs(usersCollection);
        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filterUsers = (user) => {
    const searchLower = search.toLowerCase();
    const fieldsToSearch = [
      user.name || "Not Available",
      user.email || "Not Available",
      user.role || "Not Available",
      user.department || "Not Available",
    ];

    return fieldsToSearch.some((field) =>
      field.toLowerCase().includes(searchLower)
    );
  };

  const handleAddUser = (role) => {
    setUserForm({
      name: "",
      email: "",
      role: role,
      department: "",
      phone: "",
    });
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone || "",
    });
    setModalVisible(true);
  };

  const handleSuspend = async (user) => {
    const db = getFirestore(app);
    const userRef = doc(db, "users", user.id);

    try {
      if (user.status === "Active") {
        await updateDoc(userRef, { status: "Suspended" });
        toast.warn(`User ${user.name} is now Suspended.`);
      } else {
        await updateDoc(userRef, { status: "Active" });
        toast.success(`User ${user.name} is now Active.`);
      }

      const snapshot = await getDocs(collection(db, "users"));
      const updatedUsersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(updatedUsersList);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (user) => {
    const db = getFirestore(app);
    const userRef = doc(db, "users", user.id);

    try {
      await deleteDoc(userRef);
      toast.success(`User ${user.name || "Unknown"} deleted successfully!`);
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user.");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!userForm.name) {
      errors.name = "Name is required";
      isValid = false;
    }
    if (!userForm.email) {
      errors.email = "Email is required";
      isValid = false;
    }
    if (!userForm.role) {
      errors.role = "Role is required";
      isValid = false;
    }
    if (!userForm.department) {
      errors.department = "Department is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSaveUser = async () => {
    if (!validateForm()) {
      return;
    }

    const db = getFirestore(app);
    try {
      if (currentUser) {
        // Update existing user
        const userRef = doc(db, "users", currentUser.id);
        await updateDoc(userRef, {
          name: userForm.name,
          email: userForm.email,
          phone: userForm.phone,
          department: userForm.department,
        });
        toast.success("User updated successfully!");
      } else {
        await addDoc(collection(db, "users"), {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          department: userForm.department,
          phone: userForm.phone,
          createdAt: Timestamp.fromDate(new Date()),
        });
        toast.success(
          `${
            userForm.role.charAt(0).toUpperCase() + userForm.role.slice(1)
          } added successfully!`
        );
      }

      setModalVisible(false);
      setUserForm({ name: "", email: "", role: "", department: "", phone: "" });
      setCurrentUser(null);

      const snapshot = await getDocs(collection(db, "users"));
      const updatedUsersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(updatedUsersList);
    } catch (error) {
      console.error("Failed to save user:", error);
      toast.error("Failed to save user");
    }
  };

  return (
    <Sidebar>
      <ToastContainer position="top-right" autoClose={2000} />
      <div style={styles.container}>
        <h1 style={styles.heading}>Manage User Page</h1>
        <p style={styles.subheading}>
          This is a test page to check if navigation is working properly.
        </p>

        <div style={styles.searchContainer}>
          <input
            style={styles.searchBar}
            type="text"
            placeholder="Search by Name, Email, Role, or Department"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={styles.buttonContainer}>
            <button
              style={{
                ...styles.addUserButton,
                backgroundColor: isHovered ? "#162d5e" : "#1e3a8a",
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => handleAddUser("Admin")}
            >
              <FiPlus style={styles.addIcon} />
              Add Admin
            </button>
            <button
              style={{
                ...styles.addUserButton,
                backgroundColor: isHovered ? "#162d5e" : "#1e3a8a",
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => handleAddUser("Patient")}
            >
              <FiPlus style={styles.addIcon} />
              Add Patient
            </button>
          </div>
        </div>

        <div style={styles.card}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.tableHead, width: "200px" }}>Name</th>
                  <th style={{ ...styles.tableHead, width: "180px" }}>Email</th>
                  <th style={{ ...styles.tableHead, width: "100px" }}>Role</th>
                  <th style={{ ...styles.tableHead, width: "150px" }}>
                    Department
                  </th>
                  <th style={{ ...styles.tableHead, width: "120px" }}>
                    Actions
                  </th>
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
                      ...(user.status === "Suspended"
                        ? { backgroundColor: "#FFCCCB", opacity: 0.8 }
                        : {}),
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
                    <td style={styles.tableCell}>
                      {user.department || "Not Available"}
                    </td>
                    <td style={styles.actionCell}>
                      <button
                        style={styles.iconButton}
                        onClick={() => handleEdit(user)}
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      {user.status === "Suspended" ? (
                        <button
                          style={styles.iconButton}
                          onClick={() => handleSuspend(user)}
                          title="Activate"
                        >
                          <FaUserCheck />
                        </button>
                      ) : (
                        <button
                          style={styles.iconButton}
                          onClick={() => handleSuspend(user)}
                          title="Suspend"
                        >
                          <FiUserX />
                        </button>
                      )}
                      <button
                        style={styles.iconButton}
                        onClick={() => handleDelete(user)}
                        title="Delete"
                      >
                        <FiTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalVisible && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>{currentUser ? "Edit User" : "Add User"}</h2>
            <div style={styles.formGroup}>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={userForm.name}
                onChange={handleFormChange}
                style={styles.input}
              />
              {formErrors.name && (
                <p style={styles.errorMessage}>{formErrors.name}</p>
              )}
            </div>
            <div style={styles.formGroup}>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={userForm.email}
                onChange={handleFormChange}
                style={styles.input}
              />
              {formErrors.email && (
                <p style={styles.errorMessage}>{formErrors.email}</p>
              )}
            </div>
            <div style={styles.formGroup}>
              <label>Role:</label>
              <input
                type="text"
                name="role"
                value={userForm.role}
                onChange={handleFormChange}
                style={styles.input}
                disabled={true} // Prevent role from being changed
              />
              {formErrors.role && (
                <p style={styles.errorMessage}>{formErrors.role}</p>
              )}
            </div>
            <div style={styles.formGroup}>
              <label>Department:</label>
              <input
                type="text"
                name="department"
                value={userForm.department}
                onChange={handleFormChange}
                style={styles.input}
              />
              {formErrors.department && (
                <p style={styles.errorMessage}>{formErrors.department}</p>
              )}
            </div>
            <div style={styles.formGroup}>
              <label>Phone:</label>
              <input
                type="text"
                name="phone"
                value={userForm.phone}
                onChange={handleFormChange}
                style={styles.input}
              />
              {formErrors.phone && (
                <p style={styles.errorMessage}>{formErrors.phone}</p>
              )}
            </div>
            <button onClick={handleSaveUser} style={styles.saveButton}>
              Save Changes
            </button>
            <button
              onClick={() => setModalVisible(false)}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Sidebar>
  );
};

const styles = {
  errorMessage: {
    color: "red",
    fontSize: "12px",
    marginTop: "5px",
  },
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
    width: "22%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    color: "#000",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
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
    background: "#fff",
  },
  tableHead: {
    padding: "12px",
    background: "#1e3a8a",
    color: "#fff",
    borderBottom: "2px solid #ddd",
    textAlign: "center",
  },
  tableCell: {
    padding: "6px",
    borderBottom: "1px solid #ccc",
    textAlign: "center",
    color: "#000",
  },
  actionCell: {
    display: "flex",
    justifyContent: "center",
    padding: "6px",
    borderBottom: "1px solid #ccc",
  },
  evenRow: {
    backgroundColor: "#f9f9f9",
  },
  oddRow: {
    backgroundColor: "#ffffff",
  },
  tableRow: {
    transition: "background-color 0.3s ease",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    color: "#1e3a8a",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "500px",
  },
  formGroup: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  saveButton: {
    backgroundColor: "#1e3a8a",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    color: "#000",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginLeft: "10px",
    fontWeight: "bold",
    fontSize: "16px",
  },
};

export default ManageUser;
