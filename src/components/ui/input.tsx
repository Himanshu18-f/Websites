import * as React from "react";
import { cn } from "~/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 backdrop-blur-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-white/20 focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/30 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
