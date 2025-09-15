export const Label = ({ children, className, ...props }) => {
  return (
    <label
      {...props}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
      {children}
    </label>
  )
}