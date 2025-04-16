import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path if needed

const FetchComplaints = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const complaintCollection = collection(db, "complaints");
      const snapshot = await getDocs(complaintCollection);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComplaints(data);
    };

    fetchData();
  }, []);

  return { complaints };
};

export default FetchComplaints;
