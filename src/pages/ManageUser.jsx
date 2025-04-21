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
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { app } from "../firebase";
import {
  FiPlus,
  FiEdit,
  FiTrash,
  FiUserX,
  FiUpload,
  FiTrash2,
} from "react-icons/fi";
import { FaUserCheck, FaEdit } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ManageUser.css";
import { FiAlertCircle } from "react-icons/fi";
import * as XLSX from "xlsx";

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
  const [isUploading, setIsUploading] = useState(false);
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
    role: "",
    department: "",
    designation: "",
    gender: "",
    employeeID: "",
    dob: "",
  });

  useEffect(() => {
    /**
     * Fetches all users from Firestore database
     * Sorts users alphabetically by last name
     */
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

  /**
   * Handles Excel file upload for bulk user import
   * Processes first 10 rows of employee data from specific columns
   * Extracts employee details and saves to Firestore
   */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];

          const users = [];
          let rowIndex = 2;
          const maxRows = 10;
          let rowCount = 0;

          while (rowCount < maxRows) {
            const employeeIDCell = worksheet[`B${rowIndex}`];
            const nameCell = worksheet[`C${rowIndex}`];
            const dobCell = worksheet[`D${rowIndex}`];
            const genderCell = worksheet[`E${rowIndex}`];
            const designationCell = worksheet[`M${rowIndex}`];
            const departmentCell = worksheet[`N${rowIndex}`];

            if (!employeeIDCell || !employeeIDCell.v) break;

            const employeeID = String(employeeIDCell.v).trim();

            let firstname = "";
            let middleInitial = "";
            let lastname = "";

            if (nameCell && nameCell.v) {
              const fullName = String(nameCell.v).trim();

              /**
               * Parse name in format "lastname, firstname middleInitial."
               */
              if (fullName.includes(",")) {
                const [lastPart, firstPart] = fullName
                  .split(",")
                  .map((part) => part.trim());

                lastname = lastPart;

                const firstNameParts = firstPart.split(" ");

                if (firstNameParts.length >= 1) {
                  firstname = firstNameParts[0];

                  const lastPartIndex = firstNameParts.length - 1;
                  const potentialMiddleInitial = firstNameParts[lastPartIndex];

                  if (
                    potentialMiddleInitial &&
                    potentialMiddleInitial.endsWith(".")
                  ) {
                    middleInitial = potentialMiddleInitial.replace(".", "");

                    if (firstNameParts.length > 1) {
                      firstname = firstNameParts
                        .slice(0, lastPartIndex)
                        .join(" ");
                    }
                  } else if (firstNameParts.length > 1) {
                    firstname = firstNameParts[0];
                    middleInitial = firstNameParts[1].charAt(0);
                  }
                }
              } else {
                lastname = fullName;
              }
            }

            /**
             * Process Date of Birth from Excel
             * Handles both Excel date serial numbers and string formats
             */
            let dob = null;
            if (dobCell && dobCell.v) {
              if (typeof dobCell.v === "number") {
                dob = new Date(Math.round((dobCell.v - 25569) * 86400 * 1000));
              } else {
                const dobString = String(dobCell.v).trim();
                const dobParts = dobString.split("/");

                if (dobParts.length === 3) {
                  const month = parseInt(dobParts[0], 10) - 1;
                  const day = parseInt(dobParts[1], 10);
                  const year = parseInt(dobParts[2], 10);

                  dob = new Date(year, month, day);

                  if (isNaN(dob.getTime())) {
                    dob = null;
                  }
                }
              }
            }

            /**
             * Process Gender - normalize to "Male" or "Female"
             */
            let gender = "";
            if (genderCell && genderCell.v) {
              const genderValue = String(genderCell.v).trim().toLowerCase();
              gender =
                genderValue.charAt(0).toUpperCase() + genderValue.slice(1);

              if (gender !== "Male" && gender !== "Female") {
                if (
                  gender.startsWith("M") ||
                  gender === "M" ||
                  gender === "m"
                ) {
                  gender = "Male";
                } else if (
                  gender.startsWith("F") ||
                  gender === "F" ||
                  gender === "f"
                ) {
                  gender = "Female";
                }
              }
            }

            let designation = "";
            if (designationCell && designationCell.v) {
              designation = String(designationCell.v).trim().toUpperCase();
            }

            let department = "";
            if (departmentCell && departmentCell.v) {
              department = String(departmentCell.v).trim();
              department = capitalizeWords(department);
            }

            users.push({
              employeeID,
              firstname: firstname.toUpperCase(),
              middleInitial: middleInitial.toUpperCase(),
              lastname: lastname.toUpperCase(),
              dob,
              gender,
              designation,
              department,
            });

            rowIndex++;
            rowCount++;
          }

          if (users.length === 0) {
            toast.error("No employee data found in the Excel file");
            setIsUploading(false);
            return;
          }

          if (rowCount === maxRows) {
            toast.warning(
              `Only the first ${maxRows} employees were processed. Additional rows were ignored.`
            );
          }

          await saveEmployeesToFirestore(users);
        } catch (error) {
          console.error("Error processing Excel file:", error);
          toast.error("Failed to process Excel file");
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read the file");
        setIsUploading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("File upload failed");
      setIsUploading(false);
    }

    e.target.value = null;
  };

  /**
   * Saves imported employee data to Firestore
   * Tracks successful and failed operations
   * Updates UI with results
   */
  const saveEmployeesToFirestore = async (users) => {
    const db = getFirestore(app);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const user of users) {
        try {
          const userRef = doc(db, "users", user.employeeID);

          const userData = {
            employeeID: user.employeeID,
            firstname: user.firstname,
            middleInitial: user.middleInitial,
            lastname: user.lastname,
            designation: user.designation,
            department: user.department,
            role: "Employee",
            gender: user.gender,
            dob: user.dob ? Timestamp.fromDate(user.dob) : null,
            createdAt: serverTimestamp(),
            status: "Active",
          };

          await setDoc(userRef, userData);
          successCount++;
        } catch (err) {
          console.error(`Error adding employee ${user.employeeID}:`, err);
          errorCount++;
        }
      }

      const snapshot = await getDocs(collection(db, "users"));
      const updatedUsersList = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => a.lastname?.localeCompare(b.lastname));
      setUsers(updatedUsersList);

      if (errorCount === 0) {
        toast.success(`Successfully added ${successCount} employees`);
      } else {
        toast.warning(
          `Added ${successCount} employees with ${errorCount} errors`
        );
      }
    } catch (error) {
      console.error("Failed to save employee data:", error);
      toast.error("Failed to save employee data to database");
    }
  };

  /**
   * Filters users based on search input
   * Searches across multiple fields including name, role, department, etc.
   * Special case handling for searching by gender
   */
  const filterUsers = (user) => {
    const searchLower = search.toLowerCase();

    const fullName = `${user.firstname || ""} ${
      user.middleInitial ? user.middleInitial + "." : ""
    } ${user.lastname || ""}`.trim();

    const fieldsToSearch = [
      fullName,
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

  /**
   * Prepares the modal for adding a new user
   * Resets form fields and sets modal state
   */
  const handleAddUser = () => {
    setCurrentUser(null);
    setIsEditable(true);
    setUserForm({
      firstname: "",
      middleInitial: "",
      lastname: "",
      role: "Employee",
      department: "",
      designation: "",
      gender: "",
      employeeID: "",
    });
    setModalVisible(true);
  };

  /**
   * Prepares the modal for editing an existing user
   * Populates form with user data
   */
  const handleEdit = (user) => {
    setCurrentUser(user);
    setIsEditable(false);
    setUserForm({
      firstname: user.firstname.toUpperCase(),
      middleInitial: user.middleInitial ? user.middleInitial.toUpperCase() : "",
      lastname: user.lastname ? user.lastname.toUpperCase() : "",
      role: user.role,
      department: user.department,
      designation: user.designation || "",
      gender: user.gender || "",
      employeeID: user.employeeID || "",
      dob: user.dob ? user.dob.toDate().toISOString().split("T")[0] : "",
    });
    setIsEditable(false);
    setModalVisible(true);
  };

  /**
   * Toggles user status between Active and Suspended
   * Updates Firestore and refreshes user list
   */
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

  /**
   * Deletes a single user from Firestore
   * Confirms with user before deletion
   */
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

  /**
   * Deletes all users except the one with employeeID 'T6N'
   * Used for admin reset functionality
   */
  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete all users except the one with employeeID 'T6N'? This action cannot be undone.`
      )
    ) {
      return;
    }

    const db = getFirestore(app);
    const usersCollection = collection(db, "users");

    try {
      const snapshot = await getDocs(usersCollection);
      const usersToDelete = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.employeeID !== "T6N") {
          usersToDelete.push(docSnap.id);
        }
      });

      await Promise.all(
        usersToDelete.map(async (userId) => {
          await deleteDoc(doc(db, "users", userId));
        })
      );

      toast.success("All users except T6N have been deleted.");

      setUsers((prevUsers) => prevUsers.filter((u) => u.employeeID === "T6N"));
    } catch (error) {
      console.error("Failed to delete users:", error);
      toast.error("Failed to delete users.");
    }
  };

  /**
   * Helper function to capitalize each word in a string
   * Used for formatting department names consistently
   */
  const capitalizeWords = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  /**
   * Handles form field changes with appropriate formatting
   * Applies specific formatting rules based on field type
   */
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
    } else if (name === "department") {
      setUserForm((prevForm) => ({
        ...prevForm,
        [name]: capitalizeWords(value),
      }));
    } else {
      setUserForm((prevForm) => ({ ...prevForm, [name]: value }));
    }
  };

  /**
   * Validates user form before saving
   * Checks required fields and data format
   * Prevents duplicate employee IDs
   */
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

  /**
   * Saves user data to Firestore
   * Handles both new user creation and existing user updates
   * Validates form before saving
   */
  const handleSaveUser = async () => {
    if (!validateForm()) {
      return;
    }

    const db = getFirestore(app);
    try {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.id);
        await updateDoc(userRef, {
          firstname: userForm.firstname
            .toUpperCase()
            .trim()
            .replace(/\s+/g, " "),
          middleInitial: userForm.middleInitial.toUpperCase().trim(),
          lastname: userForm.lastname.toUpperCase().trim().replace(/\s+/g, " "),
          designation: userForm.designation,
          department: userForm.department,
          gender: userForm.gender,
          employeeID: userForm.employeeID || "Not Available",
          dob: userForm.dob ? Timestamp.fromDate(new Date(userForm.dob)) : null,
        });

        toast.success("User updated successfully!");
      } else {
        const newUserData = {
          firstname: userForm.firstname
            .toUpperCase()
            .trim()
            .replace(/\s+/g, " "),
          middleInitial: userForm.middleInitial.toUpperCase().trim(),
          lastname: userForm.lastname.toUpperCase().trim().replace(/\s+/g, " "),
          role: userForm.role,
          department: userForm.department,
          designation: userForm.designation,
          gender: userForm.gender,
          employeeID: userForm.employeeID || "Not Available",
          dob: userForm.dob ? Timestamp.fromDate(new Date(userForm.dob)) : null,
          createdAt: serverTimestamp(),
          status: "Active",
        };

        const userRef = doc(db, "users", userForm.employeeID);
        await setDoc(userRef, newUserData);

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
        role: "",
        department: "",
        designation: "",
        gender: "",
        employeeID: "",
        dob: "",
      });
      setCurrentUser(null);
      setIsEditable(false);

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
            {/* Excel Upload Button */}
            <label className="upload-button">
              <FiUpload className="upload-icon" />
              {isUploading ? "Uploading..." : "Upload Excel"}
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                disabled={isUploading}
              />
            </label>
            <button className="delete-all-button" onClick={handleDeleteAll}>
              <FiTrash2 className="delete-icon" />
              Delete All Employee
            </button>
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
                {users
                  .filter((user) => user.employeeID?.trim()) // only include users with an employeeID
                  .filter(filterUsers)
                  .map((user) => (
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
                          ? user.dob.toDate().toLocaleDateString()
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
                              hoveredUser === user.id &&
                              hoveredIcon === "suspend"
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
                              hoveredUser === user.id &&
                              hoveredIcon === "suspend"
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
