export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const baseStyles =
    "px-6 py-2 rounded-full text-sm font-medium transition";

  const variants = {
    primary: "bg-primary text-white hover:opacity-90",  
    secondary: "border border-jaune text-white hover:bg-jaune hover:text-white",
    secondary1: "border border-primary text-white hover:bg-primary hover:text-white",
    outline: "border border-primary text-primary hover:bg-primary hover:text-white",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      {...props}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
