export const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3
      {...props}
      className={`text-2xl font-semibold leading-none tracking-tight flex items-center gap-3 text-white ${className}`}
    >
      {children}
    </h3>
  )
}