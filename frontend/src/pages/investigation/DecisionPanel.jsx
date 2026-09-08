import { useState } from "react";
import {
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Save,
} from "lucide-react";

function DecisionPanel({
  currentDecision,
  onDecision,
  onSave,
  saving = false,
}) {
  const [selectedDecision, setSelectedDecision] = useState(
    currentDecision || "BLOCK"
  );

  const [note, setNote] = useState("");

  const handleDecision = (decision) => {
    setSelectedDecision(decision);

    if (onDecision) {
      onDecision(decision);
    }
  };

  const handleSave = () => {
    if (!selectedDecision) return;

    if (onSave) {
      onSave({
        decision: selectedDecision,
        note: note.trim(),
      });
    }
  };

  return (
    <div className="decision-panel">
      <div className="decision-panel-header">
        <div>
          <h3>Analyst Decision</h3>

          <p>
            Review the investigation and make a final decision.
          </p>
        </div>
      </div>

      {/* DECISION OPTIONS */}

      <div className="decision-options">
        {/* APPROVE */}

        <button
          type="button"
          className={
            selectedDecision === "APPROVE"
              ? "decision-option approve selected"
              : "decision-option approve"
          }
          onClick={() => handleDecision("APPROVE")}
        >
          <CheckCircle2 size={18} />

          <div>
            <strong>Approve</strong>
            <span>Allow this transaction</span>
          </div>
        </button>

        {/* BLOCK */}

        <button
          type="button"
          className={
            selectedDecision === "BLOCK"
              ? "decision-option block selected"
              : "decision-option block"
          }
          onClick={() => handleDecision("BLOCK")}
        >
          <ShieldAlert size={18} />

          <div>
            <strong>Block</strong>
            <span>Stop this transaction</span>
          </div>
        </button>

        {/* ESCALATE */}

        <button
          type="button"
          className={
            selectedDecision === "ESCALATE"
              ? "decision-option escalate selected"
              : "decision-option escalate"
          }
          onClick={() => handleDecision("ESCALATE")}
        >
          <AlertTriangle size={18} />

          <div>
            <strong>Escalate</strong>
            <span>Send for further review</span>
          </div>
        </button>
      </div>

      {/* ANALYST NOTE */}

      <div className="decision-note">
        <label htmlFor="analyst-note">
          Analyst Note
        </label>

        <textarea
          id="analyst-note"
          value={note}
          onChange={(event) =>
            setNote(event.target.value)
          }
          placeholder="Enter the reason for your decision..."
          rows={4}
        />
      </div>

      {/* SELECTED DECISION */}

      <div className="selected-decision">
        <span>Selected Decision</span>

        <strong>{selectedDecision}</strong>
      </div>

      {/* SAVE */}

      <button
        type="button"
        className="save-decision-button"
        onClick={handleSave}
        disabled={saving}
      >
        <Save size={16} />

        {saving
          ? "Saving..."
          : "Confirm & Save Decision"}
      </button>
    </div>
  );
}

export default DecisionPanel;