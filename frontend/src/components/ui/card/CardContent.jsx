export const CardContent = ({children, className, ...props}) => {
  return (
    <div
      {...props}
      className={`p-6 pt-0 ${className}`}
    >
      {children}
    </div>
  )
};