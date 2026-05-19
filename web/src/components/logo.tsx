interface CubeLogoProps {
  size?: number;
  className?: string;
  heroSpin?: boolean;
}

export function CubeLogo({ size = 40, className = "", heroSpin = false }: CubeLogoProps) {
  const s = size;
  const half = s / 2;

  const faceStyle = (transform: string, bg: string, border: string) => ({
    transform,
    background: bg,
    border: `1.5px solid ${border}`,
    borderRadius: "20%",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.1)",
  });

  return (
    <div
      className={`cube-scene ${className}`}
      style={{ width: s, height: s }}
      aria-label="FrameUI 3D logo"
    >
      <div className={`cube-inner ${heroSpin ? "hero-spin" : ""}`}>
        {/* Front face */}
        <div
          className="cube-face"
          style={faceStyle(
            `translateZ(${half}px)`,
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            "rgba(99,102,241,0.6)"
          )}
        >
          <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="9" height="2.5" rx="1" fill="white" />
            <rect x="3" y="3" width="2.5" height="13" rx="1" fill="white" />
            <rect x="3" y="9.25" width="6.5" height="2.5" rx="1" fill="white" />
            <rect x="15" y="10.5" width="3.5" height="2.5" rx="1" fill="rgba(165,180,252,0.9)" />
            <rect x="15" y="14.5" width="3.5" height="3.5" rx="1" fill="rgba(165,180,252,0.9)" />
          </svg>
        </div>

        {/* Back face */}
        <div
          className="cube-face"
          style={faceStyle(
            `rotateY(180deg) translateZ(${half}px)`,
            "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)",
            "rgba(99,102,241,0.4)"
          )}
        >
          <span style={{ color: "rgba(165,180,252,0.7)", fontSize: s * 0.25, fontWeight: 700, fontFamily: "monospace" }}>UI</span>
        </div>

        {/* Right face */}
        <div
          className="cube-face"
          style={faceStyle(
            `rotateY(90deg) translateZ(${half}px)`,
            "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
            "rgba(99,102,241,0.5)"
          )}
        >
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: s * 0.18, fontWeight: 600, fontFamily: "monospace", letterSpacing: "0.05em" }}>Frame</span>
        </div>

        {/* Left face */}
        <div
          className="cube-face"
          style={faceStyle(
            `rotateY(-90deg) translateZ(${half}px)`,
            "linear-gradient(135deg, #1e1b4b 0%, #1a1a3e 100%)",
            "rgba(99,102,241,0.4)"
          )}
        >
          <span style={{ color: "rgba(165,180,252,0.5)", fontSize: s * 0.14, fontWeight: 500, fontFamily: "monospace" }}>v1.0</span>
        </div>

        {/* Top face */}
        <div
          className="cube-face"
          style={faceStyle(
            `rotateX(90deg) translateZ(${half}px)`,
            "linear-gradient(135deg, #4338ca 0%, #6366f1 100%)",
            "rgba(165,180,252,0.6)"
          )}
        >
          <div style={{ width: s * 0.4, height: 2, background: "rgba(255,255,255,0.5)", borderRadius: 2 }} />
        </div>

        {/* Bottom face */}
        <div
          className="cube-face"
          style={faceStyle(
            `rotateX(-90deg) translateZ(${half}px)`,
            "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
            "rgba(99,102,241,0.3)"
          )}
        >
          <div style={{ width: s * 0.3, height: 2, background: "rgba(99,102,241,0.5)", borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

export function InlineLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FrameUI"
    >
      <rect width="28" height="28" rx="7" className="fill-foreground" />
      <rect x="7" y="7" width="10" height="2.5" rx="1" className="fill-background" />
      <rect x="7" y="7" width="2.5" height="14" rx="1" className="fill-background" />
      <rect x="7" y="12.75" width="7.5" height="2.5" rx="1" className="fill-background" />
      <rect x="17.5" y="13" width="3.5" height="2.5" rx="1" fill="currentColor" className="fill-background opacity-70" />
      <rect x="17.5" y="17" width="3.5" height="4" rx="1" fill="currentColor" className="fill-background opacity-70" />
    </svg>
  );
}
