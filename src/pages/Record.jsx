import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../components/Sidebar";
import { db } from "../firebase";
import { FaTrash, FaEye } from "react-icons/fa";
import "../styles/Records.css";

const Record = () => {
  const [records, setRecords] = useState([]);
  const [hoveredRecord, setHoveredRecord] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "medicineRequests"));
      const recordList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          employeeID: data.employeeID || "Not Available",
          firstname: data.firstname || "",
          middleInitial: data.middleInitial || "",
          lastname: data.lastname || "",
          fullName: data.firstname
            ? `${data.firstname} ${
                data.middleInitial ? data.middleInitial + ". " : ""
              }${data.lastname || ""}`
            : "Not Available",
          gender: data.gender || "Not Available",
          medicine: data.medicine || "Not Available",
          complaint: data.complaint || "Not Available",
          status: data.status || "Pending",
          date: data.dateVisit?.toDate().toLocaleString() || "N/A",
          rawDate: data.dateVisit,
          dateVisit: data.dateVisit,
          additionalNotes: data.additionalNotes || "None",
        };
      });

      recordList.sort((a, b) => {
        if (!a.rawDate) return 1;
        if (!b.rawDate) return -1;
        return b.rawDate.seconds - a.rawDate.seconds;
      });

      setRecords(recordList);
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleView = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleDelete = async (record) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the record for ${record.fullName}?`
    );
    if (!confirmDelete) return;

    setDeletingId(record.id);
    try {
      await deleteDoc(doc(db, "medicineRequests", record.id));
      toast.success("Record deleted successfully!");
      await fetchRecords();
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Sidebar>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="records-container">
      <div className="dashboard-header">
          <h1>Medicine Request Records</h1>
          <p className="dashboard-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="card">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <table className="records-table">
              <thead>
                <tr>
                  <th className="table-head" style={{ width: "100px" }}>
                    Employee ID
                  </th>
                  <th className="table-head" style={{ width: "150px" }}>
                    Name
                  </th>
                  <th className="table-head" style={{ width: "120px" }}>
                    Gender
                  </th>
                  <th className="table-head" style={{ width: "120px" }}>
                    Medicine
                  </th>
                  <th className="table-head" style={{ width: "150px" }}>
                    Complaint
                  </th>
                  <th className="table-head" style={{ width: "100px" }}>
                    Status
                  </th>
                  <th className="table-head" style={{ width: "150px" }}>
                    Date
                  </th>
                  <th className="table-head" style={{ width: "100px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`table-row ${
                      index % 2 === 0 ? "even-row" : "odd-row"
                    }`}
                  >
                    <td className="table-cell">{record.employeeID}</td>
                    <td className="table-cell">{record.fullName}</td>
                    <td className="table-cell">{record.gender}</td>
                    <td className="table-cell">{record.medicine}</td>
                    <td className="table-cell">{record.complaint}</td>
                    <td className="table-cell">
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor:
                            record.status === "Approved"
                              ? "#10b981"
                              : record.status === "Completed"
                              ? "#10b981"
                              : record.status === "Rejected"
                              ? "#ef4444"
                              : record.status === "Pending"
                              ? "#f59e0b"
                              : "#6b7280",
                        }}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="table-cell">{record.date}</td>
                    <td className="action-cell">
                      <button
                        className={`icon-button ${
                          hoveredRecord === record.id && hoveredIcon === "view"
                            ? "button-hover"
                            : ""
                        }`}
                        onMouseEnter={() => {
                          setHoveredRecord(record.id);
                          setHoveredIcon("view");
                        }}
                        onMouseLeave={() => setHoveredIcon(null)}
                        onClick={() => handleView(record)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>

                      <button
                        className={`icon-button ${
                          hoveredRecord === record.id &&
                          hoveredIcon === "delete"
                            ? "button-hover"
                            : ""
                        }`}
                        onMouseEnter={() => {
                          setHoveredRecord(record.id);
                          setHoveredIcon("delete");
                        }}
                        onMouseLeave={() => setHoveredIcon(null)}
                        onClick={() => handleDelete(record)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {modalVisible && selectedRecord && (
        <div className="record-modal" onClick={() => setModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Medicine Request Details</h2>

            {/* Name Row */}
            <div className="form-row">
              <div className="third-width">
                <div className="form-group">
                  <label>First Name:</label>
                  <input
                    type="text"
                    value={selectedRecord.firstname}
                    className="record-input"
                    disabled
                  />
                </div>
              </div>
              <div className="third-width">
                <div className="form-group">
                  <label>Middle Initial:</label>
                  <input
                    type="text"
                    value={selectedRecord.middleInitial}
                    className="record-input"
                    disabled
                  />
                </div>
              </div>
              <div className="third-width">
                <div className="form-group">
                  <label>Last Name:</label>
                  <input
                    type="text"
                    value={selectedRecord.lastname}
                    className="record-input"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Employee ID & Gender */}
            <div className="form-row">
              <div className="half-width">
                <div className="form-group">
                  <label>Employee ID:</label>
                  <input
                    type="text"
                    value={selectedRecord.employeeID}
                    className="record-input"
                    disabled
                  />
                </div>
              </div>
              <div className="half-width">
                <div className="form-group">
                  <label>Gender:</label>
                  <input
                    type="text"
                    value={selectedRecord.gender}
                    className="record-input"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Medicine & Complaint */}
            <div className="form-row">
              <div className="half-width">
                <div className="form-group">
                  <label>Medicine:</label>
                  <input
                    type="text"
                    value={selectedRecord.medicine}
                    className="record-input"
                    disabled
                  />
                </div>
              </div>
              <div className="half-width">
                <div className="form-group">
                  <label>Complaint:</label>
                  <input
                    type="text"
                    value={selectedRecord.complaint}
                    className="record-input"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Status & Date Submitted */}
            <div className="form-row">
              <div className="half-width">
                <div className="form-group">
                  <label>Status:</label>
                  <input
                    type="text"
                    value={selectedRecord.status}
                    className="record-input status-input"
                    style={{
                      backgroundColor:
                        selectedRecord.status === "Approved"
                          ? "#dcfce7"
                          : selectedRecord.status === "Completed"
                          ? "#dcfce7"
                          : selectedRecord.status === "Rejected"
                          ? "#fee2e2"
                          : selectedRecord.status === "Pending"
                          ? "#fef3c7"
                          : "#f3f4f6",
                      color:
                        selectedRecord.status === "Approved"
                          ? "#166534"
                          : selectedRecord.status === "Completed"
                          ? "#166534"
                          : selectedRecord.status === "Rejected"
                          ? "#991b1b"
                          : selectedRecord.status === "Pending"
                          ? "#92400e"
                          : "#374151",
                    }}
                    disabled
                  />
                </div>
              </div>
              <div className="half-width">
                <div className="form-group">
                  <label>Date Submitted:</label>
                  <input
                    type="text"
                    value={selectedRecord.date}
                    className="record-input"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="form-row">
              <div className="full-width">
                <div className="form-group">
                  <label>Additional Notes:</label>
                  <textarea
                    value={selectedRecord.additionalNotes}
                    className="record-textarea"
                    disabled
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="button-container">
              <button
                onClick={() => setModalVisible(false)}
                className="close-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
};

export default Record;
