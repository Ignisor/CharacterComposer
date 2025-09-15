export const CardHeader = ({children, className, ...props}) => {
  return (
    <div
      {...props}
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
    >
      {children}
    </div>
  )
};