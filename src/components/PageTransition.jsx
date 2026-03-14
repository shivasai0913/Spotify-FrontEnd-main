import { useState, useEffect, useRef } from "react";

/**
 * PageTransition
 * Wraps page content with smooth slide+fade animation on page change.
 * Usage: <PageTransition pageKey={page}>{renderPage()}</PageTransition>
 */
export default function PageTransition({ pageKey, children }) {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase]   = useState("visible"); // visible | exit | enter
  const prevKey = useRef(pageKey);

  useEffect(() => {
    if (pageKey === prevKey.current) return;
    prevKey.current = pageKey;

    // Exit current page
    setPhase("exit");

    const t1 = setTimeout(() => {
      setDisplayChildren(children);
      setPhase("enter");
    }, 180);

    const t2 = setTimeout(() => {
      setPhase("visible");
    }, 360);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [pageKey, children]);

  const styles = {
    visible: { opacity: 1,   transform: "translateY(0px)    scale(1)",    filter: "blur(0px)"   },
    exit:    { opacity: 0,   transform: "translateY(-12px)  scale(0.98)", filter: "blur(2px)"   },
    enter:   { opacity: 0,   transform: "translateY(16px)   scale(0.99)", filter: "blur(2px)"   },
  };

  return (
    <div style={{
      ...styles[phase],
      transition: phase === "exit"
        ? "opacity 0.18s ease, transform 0.18s ease, filter 0.18s ease"
        : "opacity 0.22s ease 0.02s, transform 0.28s cubic-bezier(0.34,1.2,0.64,1) 0.02s, filter 0.2s ease",
      willChange: "opacity, transform",
      minHeight:  "100%",
    }}>
      {displayChildren}
    </div>
  );
}