import { ChevronDown } from "lucide-react";

export const Select = ({children, className, ...props}) => {
  return (
    <div className={'relative'}>
      <select
        {...props}
        className={`appearance-none flex h-10 w-full items-center justify-between rounded-md border pl-3 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 bg-white/5 border-white/20 text-white`}
      >
        {children}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
    </div>
  )
}