function SeverityTag({ severity }) {
  return (
    <span className={`severity-tag ${severity.toLowerCase()}`}>
      {severity}
    </span>
  );
}

export default SeverityTag;