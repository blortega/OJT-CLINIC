import React, { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InventoryAlert = ({ medicines }) => {
  useEffect(() => {
    const lowStockItems = medicines.filter(
      (medicine) => medicine.stock > 0 && medicine.stock <= 20
    );
    const outOfStockItems = medicines.filter(
      (medicine) => medicine.stock === 0
    );

    const speak = (text) => {
      const msg = new SpeechSynthesisUtterance(text);
      msg.pitch = 1.2;
      msg.rate = 1;
      msg.volume = 1;
      msg.lang = "en-US";
      window.speechSynthesis.speak(msg);
    };

    if (lowStockItems.length > 0) {
      const message = `${lowStockItems.length} medicine${lowStockItems.length > 1 ? "s are" : " is"} low stock.`;
      toast.warning(message, { autoClose: 3000 });
      speak(message);
    }

    if (outOfStockItems.length > 0) {
      const message = `${outOfStockItems.length} medicine${outOfStockItems.length > 1 ? "s are" : " is"} out of stock.`;
      toast.error(message, { autoClose: 3000 });
      speak(message);
    }
  }, [medicines]);

  return <ToastContainer />;
};

export default InventoryAlert;
