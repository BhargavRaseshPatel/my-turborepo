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
      className={`auth-toggle ${active ? "auth-toggle--active" : ""}`}
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
    <button type={type} className="auth-submit-btn">
      {children}
    </button>
  );
}
