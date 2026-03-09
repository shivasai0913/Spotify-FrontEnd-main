import { FaMagnifyingGlass } from "react-icons/fa6";
import "../styles/App.css";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-box">
      <FaMagnifyingGlass style={{ color: "#000", fontSize: "1rem" }} />
      <input
        className="search-input"
        placeholder="What do you want to listen to?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
    </div>
  );
}
