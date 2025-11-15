"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface HoverCardContextValue {
  open: boolean;
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(
  null
);

export interface HoverCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  openDelay?: number;
  closeDelay?: number;
}

export function HoverCard({
  children,
  className,
  openDelay = 100,
  closeDelay = 120,
  onMouseEnter,
  onMouseLeave,
  ...props
}: HoverCardProps) {
  const [open, setOpen] = React.useState(false);
  const openTimeout = React.useRef<ReturnType<typeof setTimeout>>();
  const closeTimeout = React.useRef<ReturnType<typeof setTimeout>>();

  const clearTimers = () => {
    if (openTimeout.current) {
      clearTimeout(openTimeout.current);
      openTimeout.current = undefined;
    }
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = undefined;
    }
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    onMouseEnter?.(event);
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = undefined;
    }
    openTimeout.current = setTimeout(() => setOpen(true), openDelay);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    onMouseLeave?.(event);
    if (openTimeout.current) {
      clearTimeout(openTimeout.current);
      openTimeout.current = undefined;
    }
    closeTimeout.current = setTimeout(() => setOpen(false), closeDelay);
  };

  React.useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <HoverCardContext.Provider value={{ open }}>
      <div
        className={cn("group relative inline-flex", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  );
}

export type HoverCardTriggerProps = React.HTMLAttributes<HTMLDivElement>;

export const HoverCardTrigger = React.forwardRef<
  HTMLDivElement,
  HoverCardTriggerProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("inline-flex w-full cursor-pointer", className)}
    {...props}
  />
));
HoverCardTrigger.displayName = "HoverCardTrigger";

export type HoverCardContentProps = React.HTMLAttributes<HTMLDivElement>;

export const HoverCardContent = React.forwardRef<
  HTMLDivElement,
  HoverCardContentProps
>(({ className, ...props }, ref) => {
  const context = React.useContext(HoverCardContext);
  const open = context?.open ?? false;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-hidden={!open}
      data-state={open ? "open" : "closed"}
      className={cn(
        "pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-72 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 opacity-0 shadow-xl ring-1 ring-black/5 transition-all duration-150 ease-out dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
        open && "pointer-events-auto -translate-y-1 opacity-100",
        className
      )}
      {...props}
    />
  );
});
HoverCardContent.displayName = "HoverCardContent";
