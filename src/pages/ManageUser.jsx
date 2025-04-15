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
  serverTimestamp,
} from "firebase/firestore";
import { app } from "../firebase";
import { FiPlus, FiEdit, FiTrash, FiUserX } from "react-icons/fi";
import { FaUserCheck, FaEdit } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ManageUser.css"; // Import the CSS file
import { FiAlertCircle } from "react-icons/fi";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [userForm, setUserForm] = useState({
    firstname: "",
    middleInitial: "",
    lastname: "",
    role: "",
    department: "",
    designation: "",
    gender: "",
    employeeID: "",
    dob: "",
  });
  const [formErrors, setFormErrors] = useState({
    firstname: "",
    middleInitial: "",
    lastname: "",
    email: "",
    role: "",
    department: "",
    designation: "",
    gender: "",
    employeeID: "",
    dob: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const db = getFirestore(app);
        const usersCollection = collection(db, "users");
        const snapshot = await getDocs(usersCollection);
        const usersList = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => a.lastname?.localeCompare(b.lastname));
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

    const fullName = `${user.firstname || ""} ${
      user.middleInitial ? user.middleInitial + "." : ""
    } ${user.lastname || ""}`.trim();

    const fieldsToSearch = [
      fullName,
      user.email || "Not Available",
      user.role || "Not Available",
      user.department || "Not Available",
      user.employeeID || "Not Available",
      user.gender || "Not Available",
      user.designation || "Not Available",
      user.dob || "Not Available",
    ];

    if (searchLower === "male" || searchLower === "female") {
      return user.gender.toLowerCase() === searchLower;
    }

    return fieldsToSearch.some((field) =>
      field.toLowerCase().includes(searchLower)
    );
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setIsEditable(true);
    setUserForm({
      firstname: "",
      middleInitial: "",
      lastname: "",
      email: "",
      role: "Employee",
      department: "",
      designation: "",
      gender: "",
      employeeID: "",
    });
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setIsEditable(false);
    setUserForm({
      firstname: user.firstname.toUpperCase(),
      middleInitial: user.middleInitial ? user.middleInitial.toUpperCase() : "",
      lastname: user.lastname ? user.lastname.toUpperCase() : "",
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation || "",
      gender: user.gender || "",
      employeeID: user.employeeID || "",
      dob: user.dob || "",
    });
    setIsEditable(false);
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
      const updatedUsersList = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => a.lastname?.localeCompare(b.lastname));
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

    if (name === "dob") {
      setUserForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
    } else if (
      name === "firstname" ||
      name === "middleInitial" ||
      name === "lastname" ||
      name === "designation"
    ) {
      setUserForm((prevForm) => ({
        ...prevForm,
        [name]: value.toUpperCase(),
      }));
    } else if (name === "employeeID") {
      setUserForm((prevForm) => ({
        ...prevForm,
        [name]: value.toUpperCase().trim(),
      }));
    } else {
      setUserForm((prevForm) => ({ ...prevForm, [name]: value }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!userForm.firstname) {
      errors.firstname = "First name is required";
      isValid = false;
    } else if (/\d/.test(userForm.firstname)) {
      errors.firstname = "First name cannot contain numbers";
      isValid = false;
    }

    if (!userForm.lastname) {
      errors.lastname = "Last name is required";
      isValid = false;
    } else if (/\d/.test(userForm.lastname)) {
      errors.lastname = "Last name cannot contain numbers";
      isValid = false;
    }
    if (!userForm.dob) {
      errors.dob = "Date of Birth is required";
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

    if (!userForm.employeeID) {
      errors.employeeID = "Employee ID is required";
      isValid = false;
    } else {
      const idExists = users.some(
        (u) =>
          u.employeeID?.toUpperCase() === userForm.employeeID.toUpperCase() &&
          u.id !== currentUser?.id
      );

      if (idExists) {
        errors.employeeID = "Employee ID already exists";
        isValid = false;
      }
    }

    if (!userForm.designation) {
      errors.designation = "Designation is required";
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
          firstname: userForm.firstname
            .toUpperCase()
            .trim()
            .replace(/\s+/g, " "),
          middleInitial: userForm.middleInitial.toUpperCase().trim(),
          lastname: userForm.lastname.toUpperCase().trim().replace(/\s+/g, " "),
          email: userForm.email,
          designation: userForm.designation,
          department: userForm.department,
          gender: userForm.gender,
          employeeID: userForm.employeeID || "Not Available",
          dob: userForm.dob,
        });

        toast.success("User updated successfully!");
      } else {
        // Add new user
        const newUserData = {
          firstname: userForm.firstname
            .toUpperCase()
            .trim()
            .replace(/\s+/g, " "),
          middleInitial: userForm.middleInitial.toUpperCase().trim(),
          lastname: userForm.lastname.toUpperCase().trim().replace(/\s+/g, " "),
          email: userForm.email,
          role: userForm.role,
          department: userForm.department,
          designation: userForm.designation,
          gender: userForm.gender,
          employeeID: userForm.employeeID || "Not Available",
          dob: userForm.dob,
          createdAt: serverTimestamp(),
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
        designation: "",
        gender: "",
        employeeID: "",
        dob: "",
      });
      setCurrentUser(null);
      setIsEditable(false);

      // Refresh the user list
      const snapshot = await getDocs(collection(db, "users"));
      const updatedUsersList = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => a.lastname?.localeCompare(b.lastname));
      setUsers(updatedUsersList);
    } catch (error) {
      console.error("Failed to save user:", error);
      toast.error("Failed to save user");
    }
  };

  return (
    <Sidebar>
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="user-container">
        <h1 className="user-heading">Manage User Page</h1>
        <div className="search-container">
          <input
            className="search-bar"
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="button-container">
            <button className="add-user-button" onClick={() => handleAddUser()}>
              <FiPlus className="add-icon" />
              Add Employee
            </button>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th className="table-head" style={{ width: "120px" }}>
                    Employee ID
                  </th>
                  <th className="table-head" style={{ width: "200px" }}>
                    Name
                  </th>
                  <th className="table-head" style={{ width: "150px" }}>
                    Date of Birth
                  </th>{" "}
                  <th className="table-head" style={{ width: "100px" }}>
                    Designation
                  </th>
                  <th className="table-head" style={{ width: "150px" }}>
                    Department
                  </th>
                  <th className="table-head" style={{ width: "100px" }}>
                    Gender
                  </th>
                  <th className="table-head" style={{ width: "120px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.filter(filterUsers).map((user) => (
                  <tr
                    key={user.id}
                    className={`table-row ${
                      users.indexOf(user) % 2 === 0 ? "even-row" : "odd-row"
                    }`}
                    style={
                      user.status === "Suspended"
                        ? { backgroundColor: "#FFCCCB", opacity: 0.8 }
                        : {}
                    }
                  >
                    <td className="table-cell">
                      {user.employeeID || "Not Available"}
                    </td>
                    <td className="table-cell">
                      {user.firstname}{" "}
                      {user.middleInitial ? user.middleInitial + ". " : ""}{" "}
                      {user.lastname || "Not Available"}
                    </td>
                    <td className="table-cell">
                      {/* Format the DOB if it exists */}
                      {user.dob
                        ? new Date(user.dob).toLocaleDateString()
                        : "Not Available"}
                    </td>
                    <td className="table-cell">
                      {user.designation || "Not Available"}
                    </td>
                    <td className="table-cell">
                      {user.department || "Not Available"}
                    </td>
                    <td className="table-cell">
                      {/* Gender Badge - keeping inline style for dynamic color */}
                      <span
                        className="gender-badge"
                        style={{
                          backgroundColor:
                            user.gender === "Male"
                              ? "#1e3a8a"
                              : user.gender === "Female"
                              ? "#d41c48"
                              : "#6c757d",
                        }}
                      >
                        {user.gender || "Not Available"}
                      </span>
                    </td>
                    <td className="action-cell">
                      {/* Edit Button */}
                      <button
                        className={`icon-button ${
                          hoveredUser === user.id && hoveredIcon === "edit"
                            ? "button-hover"
                            : ""
                        }`}
                        onMouseEnter={() => {
                          setHoveredUser(user.id);
                          setHoveredIcon("edit");
                        }}
                        onMouseLeave={() => setHoveredIcon(null)}
                        onClick={() => handleEdit(user)}
                        title="Edit"
                      >
                        <FiEdit />
                      </button>

                      {/* Suspend/Activate Button */}
                      {user.status === "Suspended" ? (
                        <button
                          className={`icon-button ${
                            hoveredUser === user.id && hoveredIcon === "suspend"
                              ? "button-hover"
                              : ""
                          }`}
                          onMouseEnter={() => {
                            setHoveredUser(user.id);
                            setHoveredIcon("suspend");
                          }}
                          onMouseLeave={() => setHoveredIcon(null)}
                          onClick={() => handleSuspend(user)}
                          title="Activate"
                        >
                          <FaUserCheck />
                        </button>
                      ) : (
                        <button
                          className={`icon-button ${
                            hoveredUser === user.id && hoveredIcon === "suspend"
                              ? "button-hover"
                              : ""
                          }`}
                          onMouseEnter={() => {
                            setHoveredUser(user.id);
                            setHoveredIcon("suspend");
                          }}
                          onMouseLeave={() => setHoveredIcon(null)}
                          onClick={() => handleSuspend(user)}
                          title="Suspend"
                        >
                          <FiUserX />
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        className={`icon-button ${
                          hoveredUser === user.id && hoveredIcon === "delete"
                            ? "button-hover"
                            : ""
                        }`}
                        onMouseEnter={() => {
                          setHoveredUser(user.id);
                          setHoveredIcon("delete");
                        }}
                        onMouseLeave={() => setHoveredIcon(null)}
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
        <div
          className="user-modal"
          onClick={() => {
            setModalVisible(false);
            setFormErrors({});
            setIsEditable(false);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              {currentUser ? "Edit Employee" : "Add Employee"}
              <button
                onClick={() => setIsEditable(!isEditable)}
                className={`edit-button ${isHovered ? "button-hover" : ""}`}
                title="Edit"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <FiEdit />
              </button>
            </h2>
            <div className="form-row">
              <div className="half-width">
                <div className="form-group">
                  <label>First Name:</label>
                  <input
                    type="text"
                    name="firstname"
                    value={userForm.firstname}
                    onChange={handleFormChange}
                    className="user-input"
                    disabled={!isEditable}
                  />
                  {formErrors.firstname && (
                    <p className="error-message">
                      <FiAlertCircle />
                      {formErrors.firstname}
                    </p>
                  )}
                </div>
              </div>
              <div className="half-width">
                <div className="form-group">
                  <label>Middle Initial:</label>
                  <input
                    type="text"
                    name="middleInitial"
                    value={userForm.middleInitial}
                    onChange={handleFormChange}
                    className="user-input"
                    disabled={!isEditable}
                  />
                  {formErrors.middleInitial && (
                    <p className="error-message">
                      <FiAlertCircle />
                    </p>
                  )}
                </div>
              </div>
              <div className="half-width">
                <div className="form-group">
                  <label>Last Name:</label>
                  <input
                    type="text"
                    name="lastname"
                    value={userForm.lastname}
                    onChange={handleFormChange}
                    className="user-input"
                    disabled={!isEditable}
                  />
                  {formErrors.lastname && (
                    <p className="error-message">
                      <FiAlertCircle />
                      {formErrors.lastname}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="half-width">
                <div className="form-group">
                  <label>Gender:</label>
                  <select
                    name="gender"
                    value={userForm.gender}
                    onChange={handleFormChange}
                    className="user-select"
                    disabled={!isEditable}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.gender && (
                    <p className="error-message">
                      <FiAlertCircle />
                      {formErrors.gender}
                    </p>
                  )}
                </div>
              </div>

              <div className="half-width">
                <div className="form-group">
                  <label>Employee ID:</label>
                  <input
                    type="text"
                    name="employeeID"
                    value={userForm.employeeID}
                    onChange={handleFormChange}
                    className="user-input"
                    disabled={!isEditable}
                  />
                  {formErrors.employeeID && (
                    <p className="error-message">
                      <FiAlertCircle />
                      {formErrors.employeeID}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="half-width">
                <div className="form-group">
                  <label>Date of Birth:</label>
                  <input
                    type="date"
                    name="dob"
                    value={userForm.dob}
                    onChange={handleFormChange}
                    className="user-input"
                    disabled={!isEditable}
                  />
                  {formErrors.dob && (
                    <p className="error-message">
                      <FiAlertCircle />
                      {formErrors.dob}
                    </p>
                  )}
                </div>
              </div>

              <div className="half-width">
                <div className="form-group">
                  <label>Department:</label>
                  <input
                    type="text"
                    name="department"
                    value={userForm.department}
                    onChange={handleFormChange}
                    className="user-input"
                    disabled={!isEditable}
                  />
                  {formErrors.department && (
                    <p className="error-message">
                      <FiAlertCircle />
                      {formErrors.department}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="half-width">
                <div className="form-group">
                  <label>Designation:</label>
                  <input
                    type="text"
                    name="designation"
                    value={userForm.designation}
                    onChange={handleFormChange}
                    className="user-input"
                    disabled={!isEditable}
                  />
                  {formErrors.designation && (
                    <p className="error-message">
                      <FiAlertCircle />
                      {formErrors.designation}
                    </p>
                  )}
                </div>
              </div>

              <div className="half-width">
                <div className="form-group">
                  <label>Role:</label>
                  <input
                    type="text"
                    name="role"
                    value={userForm.role}
                    onChange={handleFormChange}
                    className="user-input"
                    disabled={true}
                  />
                  {formErrors.role && (
                    <p className="error-message">{formErrors.role}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="button-container">
              <button
                onClick={handleSaveUser}
                className="save-button"
                disabled={isSaving || !isEditable}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setModalVisible(false);
                  setFormErrors({});
                  setIsEditable(false);
                }}
                className="cancel-button"
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

export default ManageUser;
