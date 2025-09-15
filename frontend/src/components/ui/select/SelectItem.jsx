export const SelectItem = ({children, className, ...props}) => {
  return (
    <option
      {...props}
      className={`flex items-center justify-between px-3 py-2 text-sm ${className}`}
    >
      {children}
    </option>
  )
}