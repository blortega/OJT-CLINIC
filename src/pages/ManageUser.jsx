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
import { BsGenderAmbiguous } from "react-icons/bs";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userForm, setUserForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    role: "",
    department: "",
    phone: "",
    gender: "",
  });
  const [formErrors, setFormErrors] = useState({
    firstname: "",
    lastname: "",
    email: "",
    role: "",
    department: "",
    phone: "",
    gender: "",
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
      (user.firstname || "Not Available") + " " + (user.lastname || ""),
      user.email || "Not Available",
      user.role || "Not Available",
      user.department || "Not Available",
    ];

    return fieldsToSearch.some((field) =>
      field.toLowerCase().includes(searchLower)
    );
  };

  const handleAddUser = () => {
    setUserForm({
      firstname: "",
      lastname: "",
      email: "",
      role: "Employee",
      department: "",
      phone: "",
      gender: "",
    });
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setUserForm({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone || "",
      gender: user.gender || "",
    });
    setModalVisible(true);
  };

  const handleSuspend = async (user) => {
    if (
      !window.confirm(
        `Are you sure you want to ${
          user.status === "Active" ? "suspend" : "activate"
        } this user?`
      )
    ) {
      return;
    }
    const db = getFirestore(app);
    const userRef = doc(db, "users", user.id);

    try {
      if (user.status === "Active") {
        await updateDoc(userRef, { status: "Suspended" });
        toast.warn(`User ${user.firstname} ${user.lastname} is now Suspended.`);
      } else {
        await updateDoc(userRef, { status: "Active" });
        toast.success(`User ${user.firstname} ${user.lastname} is now Active.`);
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
    if (
      !window.confirm(
        `Are you sure you want to delete this user? This action cannot be undone.`
      )
    ) {
      return;
    }
    const db = getFirestore(app);
    const userRef = doc(db, "users", user.id);

    try {
      await deleteDoc(userRef);
      toast.success(
        `User ${user.firstname} ${user.lastname} deleted successfully!`
      );
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

    if (!userForm.firstname) {
      errors.firstname = "First name is required";
      isValid = false;
    }
    if (!userForm.lastname) {
      errors.lastname = "Last name is required";
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
    if (!userForm.gender) {
      errors.gender = "Gender is required";
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
          firstname: userForm.firstname,
          lastname: userForm.lastname,
          email: userForm.email,
          phone: userForm.phone,
          department: userForm.department,
          gender: userForm.gender,
        });
        toast.success("User updated successfully!");
      } else {
        // Add new user
        const newUserData = {
          firstname: userForm.firstname,
          lastname: userForm.lastname,
          email: userForm.email,
          role: userForm.role,
          department: userForm.department,
          phone: userForm.phone,
          gender: userForm.gender,
          createdAt: Timestamp.fromDate(new Date()),
          status: "Active",
        };

        // Create new user document
        await addDoc(collection(db, "users"), newUserData);
        toast.success(
          `${
            userForm.role.charAt(0).toUpperCase() + userForm.role.slice(1)
          } added successfully!`
        );
      }

      setModalVisible(false);
      setUserForm({
        firstname: "",
        lastname: "",
        email: "",
        role: "",
        department: "",
        phone: "",
        gender: "",
      });
      setCurrentUser(null);

      // Refresh the user list
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
              onClick={() => handleAddUser("Employee")}
            >
              <FiPlus style={styles.addIcon} />
              Add Employee
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
                      {user.firstname} {user.lastname || "Not Available"}
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
            <h2>{currentUser ? "Edit Employee" : "Add Employee"}</h2>
            <div style={styles.row}>
              <div style={styles.halfWidth}>
                <div style={styles.formGroup}>
                  <label>First Name:</label>
                  <input
                    type="text"
                    name="firstname"
                    value={userForm.firstname}
                    onChange={handleFormChange}
                    style={styles.input}
                  />
                  {formErrors.firstname && (
                    <p style={styles.errorMessage}>{formErrors.firstname}</p>
                  )}
                </div>
              </div>
              <div style={styles.halfWidth}>
                <div style={styles.formGroup}>
                  <label>Last Name:</label>
                  <input
                    type="text"
                    name="lastname"
                    value={userForm.lastname}
                    onChange={handleFormChange}
                    style={styles.input}
                  />
                  {formErrors.lastname && (
                    <p style={styles.errorMessage}>{formErrors.lastname}</p>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label>Gender:</label>
              <select
                name="gender"
                value={userForm.gender}
                onChange={handleFormChange}
                style={styles.select}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {formErrors.gender && (
                <p style={styles.errorMessage}>{formErrors.gender}</p>
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

            <div style={styles.row}>
              <div style={styles.halfWidth}>
                <div style={styles.formGroup}>
                  <label>Phone:</label>
                  <input
                    type="tel"
                    name="phone"
                    value={userForm.phone}
                    onChange={handleFormChange}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.halfWidth}>
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
              </div>
            </div>

            <div style={styles.formGroup}>
              <label>Role:</label>
              <input
                type="text"
                name="role"
                value={userForm.role}
                onChange={handleFormChange}
                style={styles.input}
                disabled
              />
              {formErrors.role && (
                <p style={styles.errorMessage}>{formErrors.role}</p>
              )}
            </div>

            <div style={styles.buttonContainer}>
              <button
                onClick={handleSaveUser}
                style={styles.saveButton}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
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
    justifyContent: "center",
    gap: "10px",
    marginTop: "20px",
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
    padding: "30px",
    borderRadius: "8px",
    width: "600px",
    maxWidth: "90%",
  },
  formGroup: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginTop: "8px",
    fontSize: "16px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
  },
  halfWidth: {
    width: "48%",
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginTop: "8px",
  },
  saveButton: {
    backgroundColor: "#1e3a8a",
    color: "#fff",
    padding: "12px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    color: "#000",
    padding: "12px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    width: "100%",
  },
};

export default ManageUser;
