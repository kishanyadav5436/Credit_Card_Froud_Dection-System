import { X } from "lucide-react";

function Drawer({
  open,
  onClose,
  title,
  children,
}) {
  if (!open) return null;

  return (
    <div
      className="drawer-overlay"
      onClick={onClose}
    >
      <aside
        className="drawer"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="drawer-header">
          <div>
            <h2>{title}</h2>
            <span>
              Transaction investigation
            </span>
          </div>

          <button
            className="drawer-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          {children}
        </div>
      </aside>
    </div>
  );
}

export default Drawer;