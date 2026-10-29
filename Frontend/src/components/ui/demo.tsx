import * as React from "react"
import { LiquidToggle, NimbusToggleIcons } from "@/components/ui/liquid-glass-toggle"

export default function Demo() {
  const [dark, setDark] = React.useState(false)
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 36,
        padding: "0 16px",
        background: dark ? "#070B0A" : "#F8FAFC",
        transition: "background-color .6s ease",
      }}
    >
      <LiquidToggle
        size={64}
        tone={dark ? "dark" : "light"}
        checked={dark}
        onCheckedChange={setDark}
        icons={{ off: NimbusToggleIcons.sun, on: NimbusToggleIcons.moon }}
        label="Dark mode"
      />
      <span
        style={{
          font: "500 12px/1 ui-sans-serif, -apple-system, 'Segoe UI', system-ui, sans-serif",
          color: dark ? "rgba(241,247,255,.5)" : "rgba(11,19,43,.5)",
          transition: "color .6s ease",
        }}
      >
        Darsh Dental Depot · Liquid Glass Toggle · Nimbus UI
      </span>
    </div>
  )
}
