// components/ui/Button.tsx
import React from "react"
import clsx from "clsx"

type ButtonProps = {
  children: React.ReactNode
  variant?: "primary" | "secondary"
  size?: "sm" | "md" | "lg"
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const baseStyles =
  "font-medium rounded-xs capitalize cursor-pointer transition-colors duration-200"

const variants = {
  primary: "bg-[#2A2A72] hover:bg-[#1f1f54] text-white",
  secondary: "bg-[#FFA400] hover:bg-[#e69500] text-white",
}

const sizes = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
