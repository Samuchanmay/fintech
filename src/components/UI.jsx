const { useState, useEffect } = React;

function StatusPill({ estatus }) {
  const labels = { sano: "Sano", atencion: "Atención", riesgo: "Riesgo" };
  return (
    <span className={`status-pill ${estatus}`}>
      <span className="status-dot"></span>
      {labels[estatus] || estatus}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", marginTop: 0, marginBottom: "18px" }}>
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state-title">{title}</div>
      <p>{subtitle}</p>
      {actionLabel && (
        <button className="btn btn-primary" onClick={onAction} style={{ marginTop: "12px" }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function ProgressBar({ percent, color }) {
  const pct = Math.max(0, Math.min(100, percent * 100));
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${pct}%`, background: color }}></div>
    </div>
  );
}
