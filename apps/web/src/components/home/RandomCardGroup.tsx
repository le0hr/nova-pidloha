"use client";

import { createContext, useCallback, useEffect, useRef, type ReactNode } from "react";

type Register = (advance: () => void) => () => void;
export const CardAutoplayContext = createContext<Register | null>(null);

export default function RandomCardGroup({ children, className }: { children: ReactNode; className: string }) {
  const cards = useRef(new Set<() => void>());
  const register = useCallback<Register>((advance) => {
    cards.current.add(advance);
    return () => { cards.current.delete(advance); };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const eligible = [...cards.current];
      if (eligible.length) eligible[Math.floor(Math.random() * eligible.length)]();
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  return <CardAutoplayContext.Provider value={register}><div className={className}>{children}</div></CardAutoplayContext.Provider>;
}
