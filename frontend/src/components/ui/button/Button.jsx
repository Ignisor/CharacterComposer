export const BUTTON_VARIANT = {
  PRIMARY:'primary',
  OUTLINE:'outline',
  GHOST:'ghost',
}

const STYLES_BY_VARIANT = {
  [BUTTON_VARIANT.PRIMARY]: 'bg-primary hover:bg-primary/90 h-10',
  [BUTTON_VARIANT.OUTLINE]: '',
  [BUTTON_VARIANT.GHOST]: 'text-white/60 hover:text-white hover:bg-white/10 disabled:hover:bg-transparent',
};

export const Button = ({children, className, variant = BUTTON_VARIANT.GHOST, ...props}) => {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 text-white ${STYLES_BY_VARIANT[variant]} ${className}`}
    >
      {children}
    </button>
  );
}