import React from "react";

// PUBLIC_INTERFACE
const Modal = ({ onClose, children }) => (
  <div className="crm-modal-backdrop" onClick={onClose}>
    <div
      className="crm-modal"
      onClick={(e) => e.stopPropagation()}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      {children}
    </div>
  </div>
);
export default Modal;
