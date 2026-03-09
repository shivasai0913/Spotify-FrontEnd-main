import { useState } from "react";

/**
 * MobileFilterChips — "All / Music / Podcasts" chips
 * Shown only on mobile via CSS (.mobile-chip class)
 */
export default function MobileFilterChips() {
  const [active, setActive] = useState("All");
  const chips = ["All", "Music", "Podcasts"];

  return (
    <>
      {chips.map((chip) => (
        <button
          key={chip}
          className={`mobile-chip ${active === chip ? "active" : ""}`}
          onClick={() => setActive(chip)}
        >
          {chip}
        </button>
      ))}
    </>
  );
}