export const Card = ({children, className, ...props}) => {
  return (
    <div
      {...props}
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}