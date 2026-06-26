import * as React from "react"

const MOBILE_BREAKPOINT = 768
const LG_BREAKPOINT = 1024

export function getIsMobileViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
}

export function getIsBelowLgViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth < LG_BREAKPOINT
}

export function useIsBelowLg() {
  const [isBelowLg, setIsBelowLg] = React.useState<boolean>(getIsBelowLgViewport)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${LG_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsBelowLg(window.innerWidth < LG_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsBelowLg(window.innerWidth < LG_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isBelowLg
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(getIsMobileViewport)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
