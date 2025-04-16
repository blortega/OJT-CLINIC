import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const FetchMedicineType = () => {
  const [medicineType, setMedicineType] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicineType = async () => {
      try {
        const formsRef = collection(db, "medicineType");
        const snapshot = await getDocs(formsRef);
        const forms = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name
          }));
        setMedicineType(forms);
      } catch (error) {
        console.error("Failed to fetch medicine type:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicineType();
  }, []);

  return { medicineType, loading };
};

export default FetchMedicineType;
