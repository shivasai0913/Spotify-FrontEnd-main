/**
 * MoodFilter
 * Horizontal scrollable mood chips that filter the song list.
 * Pass allSongs and onFilter(filteredSongs)
 */
export default function MoodFilter({ allSongs, onFilter, activeMood, setActiveMood }) {
  const moods = [
    { id:"all",     label:"All",      emoji:"🎵", keywords:[] },
    { id:"happy",   label:"Happy",    emoji:"😊", keywords:["happy","joy","feel","love","good","fun","bright","dance"] },
    { id:"sad",     label:"Sad",      emoji:"😢", keywords:["sad","cry","miss","pain","heart","alone","lost","blue"] },
    { id:"workout", label:"Workout",  emoji:"💪", keywords:["power","strong","fire","beast","energy","pump","gym","run"] },
    { id:"chill",   label:"Chill",    emoji:"😌", keywords:["chill","relax","soft","slow","calm","peace","easy","lofi"] },
    { id:"party",   label:"Party",    emoji:"🎉", keywords:["party","night","club","beat","move","bang","bass","vibe"] },
    { id:"romance", label:"Romance",  emoji:"❤️", keywords:["love","baby","girl","boy","heart","kiss","touch","hold"] },
  ];

  const handleSelect = (mood) => {
    setActiveMood(mood.id);
    if (mood.id === "all") {
      onFilter(allSongs);
      return;
    }
    const filtered = allSongs.filter(song => {
      const text = `${song.title} ${song.artist} ${song.album} ${song.genre}`.toLowerCase();
      return mood.keywords.some(kw => text.includes(kw));
    });
    onFilter(filtered.length > 0 ? filtered : allSongs);
  };

  return (
    <div style={{
      display:        "flex",
      gap:            "0.5rem",
      padding:        "0 1.5rem 0.75rem",
      overflowX:      "auto",
      scrollbarWidth: "none",
      flexWrap:       "nowrap",
    }}>
      {moods.map(mood => (
        <button
          key={mood.id}
          onClick={() => handleSelect(mood)}
          style={{
            background:   activeMood === mood.id ? "#1DB954" : "rgba(255,255,255,0.07)",
            border:       activeMood === mood.id ? "none" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: "100px",
            padding:      "0.4rem 1rem",
            color:        activeMood === mood.id ? "#000" : "#fff",
            fontSize:     "0.82rem",
            fontWeight:   700,
            fontFamily:   "Montserrat,sans-serif",
            cursor:       "pointer",
            whiteSpace:   "nowrap",
            flexShrink:   0,
            transition:   "all 0.2s",
            display:      "flex",
            alignItems:   "center",
            gap:          "0.3rem",
          }}
        >
          {mood.emoji} {mood.label}
        </button>
      ))}
      <style>{`::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}