// src/components/ui/alert.jsx

export function Alert({ children, type = "info", className }) {
    const alertClasses = {
      info: "alert-info",
      success: "alert-success",
      warning: "alert-warning",
      error: "alert-error",
    };
  
    return (
      <div className={`alert ${alertClasses[type]} ${className}`}>
        {children}
      </div>
    );
  }
  
  export function AlertDescription({ children, className }) {
    return <p className={`alert-description ${className}`}>{children}</p>;
  }
  