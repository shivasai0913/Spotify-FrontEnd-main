// ── Skeleton shimmer base ──────────────────────────────────────────────────
const shimmer = {
  background: "linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
  borderRadius: "0.4rem",
};

// ── Song Card Skeleton ─────────────────────────────────────────────────────
export function CardSkeleton() {
  return (
    <div style={{ background:"#181818", width:160, borderRadius:"0.75rem", padding:"1rem", flexShrink:0 }}>
      <div style={{ ...shimmer, width:"100%", aspectRatio:"1", borderRadius:"0.5rem", marginBottom:"0.6rem" }} />
      <div style={{ ...shimmer, height:14, width:"80%", marginBottom:"0.4rem" }} />
      <div style={{ ...shimmer, height:11, width:"55%" }} />
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

// ── Recent Card Skeleton ───────────────────────────────────────────────────
export function RecentCardSkeleton() {
  return (
    <div style={{ background:"#232323", borderRadius:"0.5rem", display:"flex", alignItems:"center", width:215, overflow:"hidden", height:56 }}>
      <div style={{ ...shimmer, width:56, height:56, flexShrink:0, borderRadius:0 }} />
      <div style={{ ...shimmer, height:13, width:"55%", margin:"0 0.75rem" }} />
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

// ── Song Row Skeleton ──────────────────────────────────────────────────────
export function SongRowSkeleton() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"40px 1fr 1fr 60px", alignItems:"center", padding:"0.5rem 1rem", gap:"0.5rem" }}>
      <div style={{ ...shimmer, width:28, height:14, margin:"0 auto" }} />
      <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
        <div style={{ ...shimmer, width:42, height:42, borderRadius:4, flexShrink:0 }} />
        <div>
          <div style={{ ...shimmer, height:13, width:120, marginBottom:"0.35rem" }} />
          <div style={{ ...shimmer, height:10, width:80 }} />
        </div>
      </div>
      <div style={{ ...shimmer, height:11, width:90 }} />
      <div style={{ ...shimmer, height:11, width:32, marginLeft:"auto" }} />
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

// ── Full page skeleton for Home ────────────────────────────────────────────
export function HomeSkeleton() {
  return (
    <div>
      {/* Recent row */}
      <div style={{ margin:"1rem 1.5rem 0.75rem", height:22, width:180, ...shimmer, borderRadius:6 }} />
      <div style={{ display:"flex", gap:"0.75rem", padding:"0 1.5rem", flexWrap:"wrap" }}>
        {[...Array(6)].map((_,i) => <RecentCardSkeleton key={i} />)}
      </div>

      {/* Cards row */}
      <div style={{ margin:"1.5rem 1.5rem 0.75rem", height:22, width:160, ...shimmer, borderRadius:6 }} />
      <div style={{ display:"flex", gap:"1rem", padding:"0 1.5rem", overflowX:"hidden" }}>
        {[...Array(5)].map((_,i) => <CardSkeleton key={i} />)}
      </div>

      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}