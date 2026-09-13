function SeverityTag({ severity }) {
  const safeSeverity = String(severity || "Medium");

  return (
    <span className={`severity-tag ${safeSeverity.toLowerCase()}`}>
      {safeSeverity}
    </span>
  );
}

export default SeverityTag;