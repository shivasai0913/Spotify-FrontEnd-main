import { FaHouse, FaMagnifyingGlass, FaBookOpen, FaSpotify, FaPlus } from "react-icons/fa6";

/**
 * BottomNav — shown only on mobile (≤700px via CSS)
 * Props:
 *   activePage: "home" | "search" | "library" | "upload"
 *   onNavigate: (page) => void
 */
export default function BottomNav({ activePage, onNavigate }) {
  const items = [
    { id: "home",    icon: <FaHouse />,             label: "Home"        },
    { id: "search",  icon: <FaMagnifyingGlass />,    label: "Search"      },
    { id: "library", icon: <FaBookOpen />,           label: "Your Library"},
    { id: "premium", icon: <FaSpotify />,            label: "Premium"     },
    { id: "upload",  icon: <FaPlus />,               label: "Create"      },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.id}
          className={`bottom-nav-item ${activePage === item.id ? "active" : ""}`}
          onClick={() => onNavigate?.(item.id)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}