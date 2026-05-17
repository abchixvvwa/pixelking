// ─── 8-bit Pixel Art Icon Components ───
// All icons use the DUELS color palette and render as crisp SVGs

// ──── Feature Icons ────

export function PixelRobot({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
      {/* Antenna */}
      <rect x="7" y="0" width="2" height="2" fill="#f7c948" />
      <rect x="6" y="2" width="4" height="1" fill="#f7c948" />
      {/* Head */}
      <rect x="3" y="3" width="10" height="7" fill="#a0a0c0" />
      <rect x="4" y="3" width="8" height="1" fill="#d0d0e0" />
      {/* Eyes */}
      <rect x="5" y="5" width="2" height="2" fill="#e63946" />
      <rect x="9" y="5" width="2" height="2" fill="#e63946" />
      {/* Eye glow */}
      <rect x="5" y="5" width="1" height="1" fill="#ff6b6b" />
      <rect x="9" y="5" width="1" height="1" fill="#ff6b6b" />
      {/* Mouth */}
      <rect x="5" y="8" width="6" height="1" fill="#1a1c2c" />
      <rect x="6" y="8" width="1" height="1" fill="#f7c948" />
      <rect x="8" y="8" width="1" height="1" fill="#f7c948" />
      {/* Body */}
      <rect x="4" y="10" width="8" height="4" fill="#3b3966" />
      <rect x="5" y="11" width="6" height="2" fill="#2d2b55" />
      {/* Chest light */}
      <rect x="7" y="11" width="2" height="2" fill="#4cc9f0" />
      {/* Arms */}
      <rect x="2" y="11" width="2" height="3" fill="#a0a0c0" />
      <rect x="12" y="11" width="2" height="3" fill="#a0a0c0" />
      {/* Feet */}
      <rect x="4" y="14" width="3" height="2" fill="#a0a0c0" />
      <rect x="9" y="14" width="3" height="2" fill="#a0a0c0" />
    </svg>
  );
}

export function PixelBrain({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
      {/* Brain outline */}
      <rect x="3" y="2" width="10" height="1" fill="#f7c948" />
      <rect x="2" y="3" width="1" height="2" fill="#f7c948" />
      <rect x="13" y="3" width="1" height="2" fill="#f7c948" />
      <rect x="1" y="5" width="1" height="6" fill="#f7c948" />
      <rect x="14" y="5" width="1" height="6" fill="#f7c948" />
      <rect x="2" y="11" width="1" height="2" fill="#f7c948" />
      <rect x="13" y="11" width="1" height="2" fill="#f7c948" />
      <rect x="3" y="13" width="10" height="1" fill="#f7c948" />
      {/* Brain fill */}
      <rect x="3" y="3" width="10" height="10" fill="#e63946" />
      {/* Brain folds */}
      <rect x="4" y="4" width="8" height="1" fill="#c1121f" />
      <rect x="7" y="3" width="1" height="10" fill="#c1121f" />
      <rect x="4" y="6" width="3" height="1" fill="#c1121f" />
      <rect x="9" y="6" width="3" height="1" fill="#c1121f" />
      <rect x="4" y="9" width="3" height="1" fill="#c1121f" />
      <rect x="9" y="9" width="3" height="1" fill="#c1121f" />
      {/* Highlights */}
      <rect x="4" y="4" width="2" height="1" fill="#ff6b6b" />
      <rect x="10" y="4" width="2" height="1" fill="#ff6b6b" />
      {/* Sparkle */}
      <rect x="5" y="1" width="1" height="1" fill="#f7c948" opacity="0.7" />
      <rect x="11" y="1" width="1" height="1" fill="#f7c948" opacity="0.7" />
    </svg>
  );
}

export function PixelLightningBolt({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
      {/* Main bolt */}
      <rect x="8" y="0" width="3" height="2" fill="#f7c948" />
      <rect x="7" y="2" width="3" height="2" fill="#f7c948" />
      <rect x="6" y="4" width="3" height="1" fill="#f7c948" />
      <rect x="5" y="5" width="6" height="2" fill="#f7c948" />
      <rect x="7" y="7" width="3" height="2" fill="#f7c948" />
      <rect x="6" y="9" width="3" height="2" fill="#f7c948" />
      <rect x="5" y="11" width="3" height="2" fill="#f7c948" />
      <rect x="4" y="13" width="3" height="2" fill="#f7c948" />
      {/* Inner highlight */}
      <rect x="8" y="1" width="2" height="1" fill="#ffe066" />
      <rect x="7" y="3" width="2" height="1" fill="#ffe066" />
      <rect x="6" y="5" width="4" height="1" fill="#ffe066" />
      <rect x="7" y="8" width="2" height="1" fill="#ffe066" />
      <rect x="6" y="10" width="2" height="1" fill="#ffe066" />
      <rect x="5" y="12" width="2" height="1" fill="#ffe066" />
      {/* Glow sparks */}
      <rect x="12" y="4" width="1" height="1" fill="#f7c948" opacity="0.5" />
      <rect x="3" y="8" width="1" height="1" fill="#f7c948" opacity="0.5" />
      <rect x="11" y="7" width="1" height="1" fill="#f7c948" opacity="0.4" />
    </svg>
  );
}

// ──── Archetype Avatars ────

export function WolfAvatar({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
      {/* Ears */}
      <rect x="2" y="1" width="2" height="3" fill="#a0a0c0" />
      <rect x="12" y="1" width="2" height="3" fill="#a0a0c0" />
      <rect x="3" y="1" width="1" height="2" fill="#e63946" />
      <rect x="12" y="1" width="1" height="2" fill="#e63946" />
      {/* Head */}
      <rect x="3" y="3" width="10" height="8" fill="#a0a0c0" />
      <rect x="4" y="3" width="8" height="2" fill="#c0c0d8" />
      {/* Eyes */}
      <rect x="4" y="5" width="3" height="2" fill="#1a1c2c" />
      <rect x="9" y="5" width="3" height="2" fill="#1a1c2c" />
      <rect x="5" y="5" width="1" height="1" fill="#e63946" />
      <rect x="10" y="5" width="1" height="1" fill="#e63946" />
      {/* Snout */}
      <rect x="5" y="8" width="6" height="3" fill="#c0c0d8" />
      <rect x="7" y="8" width="2" height="1" fill="#1a1c2c" />
      {/* Mouth / fangs */}
      <rect x="6" y="10" width="1" height="1" fill="#f4f4f4" />
      <rect x="9" y="10" width="1" height="1" fill="#f4f4f4" />
      <rect x="6" y="9" width="4" height="1" fill="#1a1c2c" />
      {/* Neck */}
      <rect x="5" y="11" width="6" height="2" fill="#a0a0c0" />
      {/* Fur tuft */}
      <rect x="4" y="12" width="1" height="2" fill="#888" />
      <rect x="11" y="12" width="1" height="2" fill="#888" />
    </svg>
  );
}

export function FoxAvatar({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
      {/* Ears */}
      <rect x="2" y="0" width="3" height="4" fill="#e63946" />
      <rect x="11" y="0" width="3" height="4" fill="#e63946" />
      <rect x="3" y="1" width="1" height="2" fill="#f7c948" />
      <rect x="12" y="1" width="1" height="2" fill="#f7c948" />
      {/* Head */}
      <rect x="3" y="3" width="10" height="8" fill="#e63946" />
      {/* White face patch */}
      <rect x="5" y="6" width="6" height="5" fill="#f4f4f4" />
      {/* Eyes */}
      <rect x="4" y="5" width="2" height="2" fill="#1a1c2c" />
      <rect x="10" y="5" width="2" height="2" fill="#1a1c2c" />
      <rect x="4" y="5" width="1" height="1" fill="#f7c948" />
      <rect x="10" y="5" width="1" height="1" fill="#f7c948" />
      {/* Nose */}
      <rect x="7" y="7" width="2" height="1" fill="#1a1c2c" />
      {/* Mouth */}
      <rect x="7" y="8" width="1" height="1" fill="#1a1c2c" />
      <rect x="6" y="9" width="1" height="1" fill="#1a1c2c" />
      <rect x="9" y="9" width="1" height="1" fill="#1a1c2c" />
      {/* Cheeks */}
      <rect x="3" y="7" width="1" height="2" fill="#f7c948" />
      <rect x="12" y="7" width="1" height="2" fill="#f7c948" />
      {/* Chin */}
      <rect x="5" y="11" width="6" height="2" fill="#f4f4f4" />
    </svg>
  );
}

export function LightningAvatar({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
      {/* Head circle */}
      <rect x="4" y="2" width="8" height="10" fill="#f7c948" />
      <rect x="3" y="4" width="1" height="6" fill="#f7c948" />
      <rect x="12" y="4" width="1" height="6" fill="#f7c948" />
      {/* Face */}
      <rect x="5" y="3" width="6" height="8" fill="#ffe066" />
      {/* Eyes */}
      <rect x="5" y="5" width="2" height="2" fill="#1a1c2c" />
      <rect x="9" y="5" width="2" height="2" fill="#1a1c2c" />
      <rect x="5" y="5" width="1" height="1" fill="#fff" />
      <rect x="9" y="5" width="1" height="1" fill="#fff" />
      {/* Lightning on forehead */}
      <rect x="7" y="3" width="2" height="1" fill="#e63946" />
      <rect x="6" y="4" width="2" height="1" fill="#e63946" />
      <rect x="7" y="5" width="2" height="1" fill="#e63946" />
      {/* Mouth */}
      <rect x="6" y="8" width="4" height="1" fill="#1a1c2c" />
      <rect x="7" y="9" width="2" height="1" fill="#1a1c2c" />
      {/* Hair spikes */}
      <rect x="3" y="2" width="2" height="2" fill="#f7c948" />
      <rect x="11" y="2" width="2" height="2" fill="#f7c948" />
      <rect x="6" y="1" width="4" height="1" fill="#f7c948" />
      <rect x="5" y="0" width="2" height="1" fill="#f7c948" />
      <rect x="9" y="0" width="2" height="1" fill="#f7c948" />
      {/* Neck */}
      <rect x="6" y="12" width="4" height="2" fill="#ffe066" />
    </svg>
  );
}

export function IceAvatar({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
      {/* Ice crystal head */}
      <rect x="5" y="0" width="6" height="1" fill="#4cc9f0" />
      <rect x="4" y="1" width="8" height="1" fill="#4cc9f0" />
      <rect x="3" y="2" width="10" height="10" fill="#4cc9f0" />
      <rect x="4" y="12" width="8" height="1" fill="#4cc9f0" />
      <rect x="5" y="13" width="6" height="1" fill="#4cc9f0" />
      {/* Inner face */}
      <rect x="4" y="3" width="8" height="8" fill="#7dd3fc" />
      {/* Eyes - cold stare */}
      <rect x="5" y="5" width="2" height="2" fill="#1a1c2c" />
      <rect x="9" y="5" width="2" height="2" fill="#1a1c2c" />
      <rect x="5" y="5" width="1" height="1" fill="#bae6fd" />
      <rect x="9" y="5" width="1" height="1" fill="#bae6fd" />
      {/* Mouth - straight line */}
      <rect x="6" y="9" width="4" height="1" fill="#1a1c2c" />
      {/* Ice crystals around */}
      <rect x="2" y="4" width="1" height="1" fill="#bae6fd" opacity="0.8" />
      <rect x="13" y="4" width="1" height="1" fill="#bae6fd" opacity="0.8" />
      <rect x="1" y="6" width="1" height="1" fill="#4cc9f0" opacity="0.6" />
      <rect x="14" y="6" width="1" height="1" fill="#4cc9f0" opacity="0.6" />
      <rect x="2" y="8" width="1" height="1" fill="#bae6fd" opacity="0.5" />
      <rect x="13" y="8" width="1" height="1" fill="#bae6fd" opacity="0.5" />
      {/* Frost pattern on forehead */}
      <rect x="6" y="3" width="1" height="1" fill="#e0f2fe" />
      <rect x="9" y="3" width="1" height="1" fill="#e0f2fe" />
      <rect x="7" y="2" width="2" height="1" fill="#e0f2fe" />
      {/* Neck / body start */}
      <rect x="6" y="14" width="4" height="2" fill="#7dd3fc" />
    </svg>
  );
}

export function KingAvatar({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
      {/* Crown */}
      <rect x="3" y="0" width="2" height="3" fill="#f7c948" />
      <rect x="7" y="0" width="2" height="2" fill="#f7c948" />
      <rect x="11" y="0" width="2" height="3" fill="#f7c948" />
      <rect x="3" y="3" width="10" height="2" fill="#f7c948" />
      {/* Crown jewels */}
      <rect x="4" y="3" width="1" height="1" fill="#e63946" />
      <rect x="7" y="3" width="2" height="1" fill="#4cc9f0" />
      <rect x="11" y="3" width="1" height="1" fill="#e63946" />
      {/* Head */}
      <rect x="4" y="5" width="8" height="7" fill="#f4f4f4" />
      <rect x="3" y="6" width="1" height="5" fill="#f4f4f4" />
      <rect x="12" y="6" width="1" height="5" fill="#f4f4f4" />
      {/* Eyes */}
      <rect x="5" y="7" width="2" height="2" fill="#1a1c2c" />
      <rect x="9" y="7" width="2" height="2" fill="#1a1c2c" />
      <rect x="5" y="7" width="1" height="1" fill="#f7c948" />
      <rect x="9" y="7" width="1" height="1" fill="#f7c948" />
      {/* Mouth */}
      <rect x="6" y="10" width="4" height="1" fill="#1a1c2c" />
      {/* Beard */}
      <rect x="4" y="11" width="8" height="2" fill="#a0a0c0" />
      <rect x="5" y="13" width="6" height="1" fill="#a0a0c0" />
      {/* Robe collar */}
      <rect x="3" y="14" width="10" height="2" fill="#e63946" />
      <rect x="7" y="14" width="2" height="2" fill="#f7c948" />
    </svg>
  );
}

// ──── Decorative Elements ────

export function PixelCorner({ position = 'top-left', color = 'var(--accent-yellow)' }) {
  const rotations = {
    'top-left': 'rotate(0)',
    'top-right': 'rotate(90deg)',
    'bottom-right': 'rotate(180deg)',
    'bottom-left': 'rotate(270deg)',
  };
  return (
    <svg
      width="24" height="24" viewBox="0 0 8 8" fill="none"
      style={{ imageRendering: 'pixelated', transform: rotations[position] }}
    >
      <rect x="0" y="0" width="8" height="1" fill={color} />
      <rect x="0" y="0" width="1" height="8" fill={color} />
      <rect x="0" y="1" width="3" height="1" fill={color} />
      <rect x="1" y="2" width="1" height="1" fill={color} />
    </svg>
  );
}

export function PixelDivider({ color = 'var(--color-dim)' }) {
  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '16px 0' }}>
      <div style={{ flex: 1, height: '2px', background: `repeating-linear-gradient(to right, ${color} 0px, ${color} 4px, transparent 4px, transparent 8px)` }} />
      <svg width="16" height="16" viewBox="0 0 8 8" fill="none" style={{ imageRendering: 'pixelated', flexShrink: 0 }}>
        <rect x="3" y="0" width="2" height="2" fill={color} />
        <rect x="1" y="2" width="2" height="2" fill={color} />
        <rect x="5" y="2" width="2" height="2" fill={color} />
        <rect x="3" y="4" width="2" height="2" fill={color} />
        <rect x="0" y="3" width="1" height="1" fill={color} />
        <rect x="7" y="3" width="1" height="1" fill={color} />
      </svg>
      <div style={{ flex: 1, height: '2px', background: `repeating-linear-gradient(to right, ${color} 0px, ${color} 4px, transparent 4px, transparent 8px)` }} />
    </div>
  );
}

// ──── Map psychotype emoji to pixel component ────
const psychotypeMap = {
  'wolf': WolfAvatar,
  'fox': FoxAvatar,
  'lightning': LightningAvatar,
  'ice': IceAvatar,
  'king': KingAvatar,
};

export function PsychotypePixelAvatar({ id, emoji, size = 32 }) {
  const key = id || emoji;
  const Component = psychotypeMap[key];
  if (!Component) return <span style={{ fontSize: size * 0.6 }}>{key}</span>;
  return <Component size={size} />;
}

// ──── Additional Dashboard Icons ────

export function PixelUser({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
      {/* Head */}
      <rect x="5" y="1" width="6" height="6" fill="#a0a0c0" />
      <rect x="4" y="2" width="1" height="4" fill="#a0a0c0" />
      <rect x="11" y="2" width="1" height="4" fill="#a0a0c0" />
      <rect x="5" y="1" width="6" height="1" fill="#c0c0d8" />
      {/* Eyes */}
      <rect x="6" y="3" width="1" height="1" fill="#1a1c2c" />
      <rect x="9" y="3" width="1" height="1" fill="#1a1c2c" />
      {/* Mouth */}
      <rect x="6" y="5" width="4" height="1" fill="#1a1c2c" />
      {/* Body / shirt */}
      <rect x="4" y="9" width="8" height="5" fill="#3b3966" />
      <rect x="3" y="10" width="1" height="4" fill="#3b3966" />
      <rect x="12" y="10" width="1" height="4" fill="#3b3966" />
      <rect x="5" y="10" width="6" height="1" fill="#f7c948" />
      {/* Neck */}
      <rect x="6" y="7" width="4" height="2" fill="#a0a0c0" />
    </svg>
  );
}

export function PixelTwoPlayers({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
      {/* Left player head */}
      <rect x="1" y="2" width="5" height="5" fill="#a0a0c0" />
      <rect x="2" y="4" width="1" height="1" fill="#1a1c2c" />
      <rect x="4" y="4" width="1" height="1" fill="#1a1c2c" />
      <rect x="2" y="6" width="3" height="1" fill="#1a1c2c" />
      {/* Left player body */}
      <rect x="1" y="8" width="5" height="4" fill="#e63946" />
      <rect x="2" y="9" width="3" height="1" fill="#f7c948" />
      {/* Right player head */}
      <rect x="10" y="2" width="5" height="5" fill="#4cc9f0" />
      <rect x="11" y="4" width="1" height="1" fill="#1a1c2c" />
      <rect x="13" y="4" width="1" height="1" fill="#1a1c2c" />
      <rect x="11" y="6" width="3" height="1" fill="#1a1c2c" />
      {/* Right player body */}
      <rect x="10" y="8" width="5" height="4" fill="#3b3966" />
      <rect x="11" y="9" width="3" height="1" fill="#f7c948" />
      {/* VS in the middle */}
      <rect x="7" y="5" width="2" height="1" fill="#f7c948" />
      <rect x="7" y="7" width="2" height="1" fill="#f7c948" />
      <rect x="7" y="6" width="1" height="1" fill="#f7c948" />
      <rect x="8" y="6" width="1" height="1" fill="#f7c948" />
    </svg>
  );
}

export function PixelGalaxy({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
      {/* Stars background */}
      <rect x="2" y="1" width="1" height="1" fill="#f7c948" />
      <rect x="13" y="3" width="1" height="1" fill="#f7c948" />
      <rect x="1" y="10" width="1" height="1" fill="#4cc9f0" />
      <rect x="14" y="12" width="1" height="1" fill="#f7c948" />
      <rect x="5" y="14" width="1" height="1" fill="#4cc9f0" />
      {/* Galaxy swirl center */}
      <rect x="6" y="6" width="4" height="4" fill="#6c63ff" />
      <rect x="5" y="7" width="1" height="2" fill="#6c63ff" />
      <rect x="10" y="7" width="1" height="2" fill="#6c63ff" />
      <rect x="7" y="5" width="2" height="1" fill="#6c63ff" />
      <rect x="7" y="10" width="2" height="1" fill="#6c63ff" />
      {/* Swirl arms */}
      <rect x="4" y="5" width="2" height="2" fill="#9d94ff" />
      <rect x="10" y="9" width="2" height="2" fill="#9d94ff" />
      <rect x="10" y="5" width="2" height="2" fill="#4cc9f0" />
      <rect x="4" y="9" width="2" height="2" fill="#4cc9f0" />
      {/* Core glow */}
      <rect x="7" y="7" width="2" height="2" fill="#fff" opacity="0.8" />
    </svg>
  );
}

export function PixelStar({ size = 16, color = '#f7c948' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
      <rect x="7" y="1" width="2" height="2" fill={color} />
      <rect x="6" y="3" width="4" height="2" fill={color} />
      <rect x="1" y="5" width="14" height="2" fill={color} />
      <rect x="3" y="7" width="10" height="2" fill={color} />
      <rect x="5" y="9" width="6" height="2" fill={color} />
      <rect x="3" y="11" width="4" height="2" fill={color} />
      <rect x="9" y="11" width="4" height="2" fill={color} />
      <rect x="2" y="13" width="3" height="2" fill={color} />
      <rect x="11" y="13" width="3" height="2" fill={color} />
    </svg>
  );
}

export function PixelFire({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" style={{ imageRendering: 'pixelated' }}>
      <rect x="3" y="0" width="2" height="1" fill="#f7c948" />
      <rect x="2" y="1" width="4" height="1" fill="#f7c948" />
      <rect x="1" y="2" width="6" height="1" fill="#e63946" />
      <rect x="1" y="3" width="6" height="2" fill="#e63946" />
      <rect x="2" y="5" width="4" height="1" fill="#e63946" />
      <rect x="3" y="6" width="2" height="1" fill="#f7c948" />
      <rect x="2" y="3" width="1" height="2" fill="#f7c948" />
      <rect x="5" y="4" width="1" height="1" fill="#f7c948" />
    </svg>
  );
}

export function PixelRepeat({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
      {/* Arrow top going right */}
      <rect x="2" y="3" width="8" height="2" fill="#4cc9f0" />
      <rect x="10" y="1" width="2" height="2" fill="#4cc9f0" />
      <rect x="12" y="3" width="2" height="2" fill="#4cc9f0" />
      <rect x="10" y="5" width="2" height="2" fill="#4cc9f0" />
      {/* Arrow bottom going left */}
      <rect x="6" y="11" width="8" height="2" fill="#f7c948" />
      <rect x="4" y="9" width="2" height="2" fill="#f7c948" />
      <rect x="2" y="11" width="2" height="2" fill="#f7c948" />
      <rect x="4" y="13" width="2" height="2" fill="#f7c948" />
    </svg>
  );
}

export function PixelMedal({ rank = 1, size = 16 }) {
  const colors = { 1: '#f7c948', 2: '#a0a0c0', 3: '#c08040' };
  const color = colors[rank] || '#a0a0c0';
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" fill="none" style={{ imageRendering: 'pixelated' }}>
      <rect x="3" y="0" width="2" height="2" fill={color} />
      <rect x="2" y="1" width="4" height="1" fill={color} />
      <rect x="1" y="3" width="6" height="4" fill={color} />
      <rect x="2" y="2" width="4" height="1" fill={color} />
      <rect x="2" y="4" width="4" height="2" fill={rank === 1 ? '#ffe066' : color} />
    </svg>
  );
}

/** Pawn + crown logo (white/black split) with white outline */
export const PixelKingLogo = ({ className, style, size = 64 }) => {
  const OutlineMask = () => (
    <>
      <rect x="6" y="0" width="1" height="1" />
      <rect x="8" y="0" width="1" height="1" />
      <rect x="10" y="0" width="1" height="1" />
      <rect x="5" y="1" width="7" height="1" />
      <rect x="4" y="2" width="9" height="2" />
      <rect x="3" y="4" width="10" height="3" />
      <rect x="4" y="7" width="8" height="2" />
      <rect x="3" y="9" width="10" height="6" />
    </>
  );

  return (
    <svg
      viewBox="-1 -1 18 17"
      width={size}
      height={size}
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      {/* White Outline (8-way shift) */}
      <g fill="#ffffff">
        <g transform="translate(-1, 0)"><OutlineMask /></g>
        <g transform="translate(1, 0)"><OutlineMask /></g>
        <g transform="translate(0, -1)"><OutlineMask /></g>
        <g transform="translate(0, 1)"><OutlineMask /></g>
        <g transform="translate(-1, -1)"><OutlineMask /></g>
        <g transform="translate(1, -1)"><OutlineMask /></g>
        <g transform="translate(-1, 1)"><OutlineMask /></g>
        <g transform="translate(1, 1)"><OutlineMask /></g>
      </g>

      {/* Crown */}
      <rect x="6" y="0" width="1" height="1" fill="#f7c948" />
      <rect x="8" y="0" width="1" height="1" fill="#f7c948" />
      <rect x="10" y="0" width="1" height="1" fill="#f7c948" />
      <rect x="5" y="1" width="7" height="1" fill="#f7c948" />
      <rect x="4" y="2" width="9" height="1" fill="#f7c948" />

      {/* Pawn head */}
      <rect x="4" y="3" width="9" height="1" fill="#1a1c2c" />
      <rect x="3" y="4" width="1" height="3" fill="#1a1c2c" />
      <rect x="12" y="4" width="1" height="3" fill="#1a1c2c" />
      <rect x="4" y="4" width="1" height="3" fill="#1a1c2c" />
      <rect x="11" y="4" width="1" height="3" fill="#1a1c2c" />
      <rect x="5" y="4" width="3" height="3" fill="#f4f4f4" />
      <rect x="8" y="4" width="3" height="3" fill="#000000" />

      {/* Neck — 1px indent each side */}
      <rect x="4" y="7" width="1" height="2" fill="#1a1c2c" />
      <rect x="11" y="7" width="1" height="2" fill="#1a1c2c" />
      <rect x="5" y="7" width="2" height="2" fill="#f4f4f4" />
      <rect x="8" y="7" width="3" height="2" fill="#000000" />

      {/* Body */}
      <rect x="3" y="9" width="1" height="3" fill="#1a1c2c" />
      <rect x="12" y="9" width="1" height="3" fill="#1a1c2c" />
      <rect x="4" y="9" width="1" height="3" fill="#1a1c2c" />
      <rect x="11" y="9" width="1" height="3" fill="#1a1c2c" />
      <rect x="5" y="9" width="3" height="3" fill="#f4f4f4" />
      <rect x="8" y="9" width="3" height="3" fill="#000000" />

      {/* Base */}
      <rect x="3" y="12" width="1" height="2" fill="#1a1c2c" />
      <rect x="12" y="12" width="1" height="2" fill="#1a1c2c" />
      <rect x="4" y="12" width="9" height="1" fill="#1a1c2c" />
      <rect x="4" y="13" width="4" height="1" fill="#f4f4f4" />
      <rect x="8" y="13" width="5" height="1" fill="#000000" />
      <rect x="3" y="14" width="10" height="1" fill="#1a1c2c" />
    </svg>
  );
};

export function PixelLock({ size = 24, color = '#f7c948' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{ imageRendering: 'pixelated' }}>
      <rect x="4" y="1" width="4" height="1" fill={color} />
      <rect x="3" y="2" width="1" height="3" fill={color} />
      <rect x="8" y="2" width="1" height="3" fill={color} />
      <rect x="4" y="2" width="4" height="2" fill={color} />
      <rect x="2" y="5" width="8" height="6" fill={color} />
      <rect x="3" y="6" width="6" height="4" fill="#1a1c2c" />
      <rect x="5" y="7" width="2" height="2" fill={color} />
    </svg>
  );
}

export function PixelCheck({ size = 16, color = '#4cc9f0' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="4" width="1" height="1" fill={color} />
      <rect x="3" y="5" width="1" height="1" fill={color} />
      <rect x="4" y="4" width="1" height="1" fill={color} />
      <rect x="5" y="3" width="1" height="1" fill={color} />
      <rect x="6" y="2" width="1" height="1" fill={color} />
    </svg>
  );
}

export function PixelCross({ size = 16, color = '#e63946' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="2" width="1" height="1" fill={color} />
      <rect x="5" y="2" width="1" height="1" fill={color} />
      <rect x="3" y="3" width="1" height="1" fill={color} />
      <rect x="4" y="3" width="1" height="1" fill={color} />
      <rect x="3" y="4" width="2" height="1" fill={color} />
      <rect x="2" y="5" width="1" height="1" fill={color} />
      <rect x="5" y="5" width="1" height="1" fill={color} />
    </svg>
  );
}

export function PixelRocket({ size = 16, color = '#f7c948' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" style={{ imageRendering: 'pixelated' }}>
      <rect x="3" y="1" width="2" height="1" fill={color} />
      <rect x="2" y="2" width="4" height="3" fill="#f4f4f4" />
      <rect x="3" y="3" width="2" height="1" fill="#4cc9f0" />
      <rect x="1" y="4" width="1" height="2" fill="#e63946" />
      <rect x="6" y="4" width="1" height="2" fill="#e63946" />
      <rect x="3" y="5" width="2" height="1" fill="#e63946" />
      <rect x="3" y="6" width="2" height="1" fill="#f7c948" />
    </svg>
  );
}

export function PixelTrophy({ size = 16, color = '#f7c948' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated', background: 'transparent' }}>
      <rect x="1" y="1" width="6" height="1" fill={color} />
      <rect x="2" y="2" width="4" height="2" fill={color} />
      <rect x="3" y="4" width="2" height="1" fill={color} />
      <rect x="3" y="5" width="2" height="2" fill="#a0a0c0" />
      <rect x="2" y="7" width="4" height="1" fill="#a0a0c0" />
      <rect x="1" y="2" width="1" height="2" fill={color} />
      <rect x="6" y="2" width="1" height="2" fill={color} />
      <rect x="2" y="3" width="1" height="1" fill="#1a1c2c" />
      <rect x="5" y="3" width="1" height="1" fill="#1a1c2c" />
    </svg>
  );
}

export function PixelCrown({ size = 16, color = '#f7c948' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" style={{ imageRendering: 'pixelated' }}>
      <rect x="1" y="2" width="1" height="4" fill={color} />
      <rect x="3" y="3" width="2" height="3" fill={color} />
      <rect x="6" y="2" width="1" height="4" fill={color} />
      <rect x="2" y="4" width="1" height="2" fill={color} />
      <rect x="5" y="4" width="1" height="2" fill={color} />
      <rect x="1" y="6" width="6" height="1" fill={color} />
    </svg>
  );
}
