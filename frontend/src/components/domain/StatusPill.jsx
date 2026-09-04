function StatusPill({ status }) {
  return (
    <span className={`status-pill ${status.toLowerCase().replace(" ", "-")}`}>
      <span className="status-dot"></span>
      {status}
    </span>
  );
}

export default StatusPill;