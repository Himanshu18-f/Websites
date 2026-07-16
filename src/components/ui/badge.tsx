import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-white/10 bg-white/10 text-white/80",
        purple:
          "border-brand-purple/30 bg-brand-purple/10 text-brand-purple-light",
        blue:
          "border-brand-blue/30 bg-brand-blue/10 text-blue-400",
        cyan:
          "border-brand-cyan/30 bg-brand-cyan/10 text-cyan-400",
        outline:
          "border-white/20 text-white/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
