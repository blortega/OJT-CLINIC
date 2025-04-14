import React, { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const InventoryAlert = ({ medicines }) => {
  useEffect(() => {
    const lowStockItems = medicines.filter(
      (medicine) => medicine.stock > 0 && medicine.stock <= 20
    );
    const outOfStockItems = medicines.filter(
      (medicine) => medicine.stock === 0
    );

    // Show toast notification for low stock
    if (lowStockItems.length > 0) {
      toast.warning(`${lowStockItems.length} medicine(s) are running low on stock!`, {
        
        autoClose: 5000,
      });
    }

    // Show toast notification for out of stock
    if (outOfStockItems.length > 0) {
      toast.error(`${outOfStockItems.length} medicine(s) are out of stock!`, {
       
        autoClose: 5000,
      });
    }

  }, [medicines]); // Re-run when medicines list changes

  return (
    <div>
      {/* Toast container */}
      <ToastContainer />
    </div>
  );
};

export default InventoryAlert;
