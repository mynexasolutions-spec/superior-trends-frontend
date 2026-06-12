import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'brand'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold disabled:pointer-events-none disabled:opacity-50",
          // Variants
          variant === 'default' && "bg-brand-charcoal text-brand-cream hover:bg-brand-gold hover:text-brand-charcoal",
          variant === 'brand' && "bg-brand-gold text-brand-charcoal hover:bg-brand-gold-dark",
          variant === 'destructive' && "bg-red-600 text-white hover:bg-red-700",
          variant === 'outline' && "border border-brand-border bg-transparent hover:bg-brand-cream hover:text-brand-charcoal text-brand-charcoal",
          variant === 'secondary' && "bg-brand-cream text-brand-charcoal hover:bg-brand-border",
          variant === 'ghost' && "hover:bg-brand-cream hover:text-brand-charcoal text-brand-charcoal",
          variant === 'link' && "text-brand-charcoal underline-offset-4 hover:underline",
          // Sizes
          size === 'default' && "h-10 px-4 py-2",
          size === 'sm' && "h-8 rounded-md px-3 text-xs",
          size === 'lg' && "h-12 rounded-xl px-8 text-base",
          size === 'icon' && "h-10 w-10",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
