type AuthToggleButtonProps = {
  active: boolean;
  onClick: () => void;
  children: string;
};

export function AuthToggleButton({ active, onClick, children }: AuthToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`auth-tab ${active ? "auth-tab--active" : ""}`}
    >
      {children}
    </button>
  );
}

type AuthSubmitButtonProps = {
  children: string;
  type?: "button" | "submit" | "reset";
};

export function AuthSubmitButton({ children, type = "submit" }: AuthSubmitButtonProps) {
  return (
    <button type={type} className="auth-submit-button">
      {children}
    </button>
  );
}
