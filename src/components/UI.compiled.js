const { useState, useEffect } = React;
function StatusPill({ estatus }) {
  const labels = { sano: "Sano", atencion: "Atenci\xF3n", riesgo: "Riesgo" };
  return /* @__PURE__ */ React.createElement("span", { className: `status-pill ${estatus}` }, /* @__PURE__ */ React.createElement("span", { className: "status-dot" }), labels[estatus] || estatus);
}
function Modal({ title, onClose, children }) {
  return /* @__PURE__ */ React.createElement("div", { className: "modal-overlay", onClick: (e) => {
    if (e.target === e.currentTarget) onClose();
  } }, /* @__PURE__ */ React.createElement("div", { className: "modal-box" }, /* @__PURE__ */ React.createElement("h3", { style: { fontFamily: "var(--font-display)", fontSize: "20px", marginTop: 0, marginBottom: "18px" } }, title), children));
}
function EmptyState({ title, subtitle, actionLabel, onAction }) {
  return /* @__PURE__ */ React.createElement("div", { className: "empty-state" }, /* @__PURE__ */ React.createElement("div", { className: "empty-state-title" }, title), /* @__PURE__ */ React.createElement("p", null, subtitle), actionLabel && /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: onAction, style: { marginTop: "12px" } }, actionLabel));
}
function ProgressBar({ percent, color }) {
  const pct = Math.max(0, Math.min(100, percent * 100));
  return /* @__PURE__ */ React.createElement("div", { className: "progress-track" }, /* @__PURE__ */ React.createElement("div", { className: "progress-fill", style: { width: `${pct}%`, background: color } }));
}
