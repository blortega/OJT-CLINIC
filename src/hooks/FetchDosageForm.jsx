import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const FetchDosageForm = () => {
  const [dosageForms, setDosageForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDosageForms = async () => {
      try {
        const formsRef = collection(db, "dosageForms");
        const snapshot = await getDocs(formsRef);
        const forms = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name
          }));
        setDosageForms(forms);
      } catch (error) {
        console.error("Failed to fetch dosage forms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDosageForms();
  }, []);

  return { dosageForms, loading };
};

export default FetchDosageForm;
