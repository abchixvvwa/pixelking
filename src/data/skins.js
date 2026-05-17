export const SKINS = [
  {
    id: 'classic8bit',
    name: 'Классика',
    free: true,
    darkCell: '#2d2b55',
    lightCell: '#3b3966',
    whitePiece: '#f4f4f4',
    blackPiece: '#e63946',
    accent: '#f7c948'
  },
  {
    id: 'gameboy',
    name: 'Game Boy',
    free: true,
    darkCell: '#0f380f',
    lightCell: '#306230',
    whitePiece: '#9bbc0f',
    blackPiece: '#0f380f',
    accent: '#9bbc0f'
  },
  {
    id: 'arcade',
    name: 'Аркада',
    free: false,
    darkCell: '#000000',
    lightCell: '#111111',
    whitePiece: '#00ff41',
    blackPiece: '#ff0000',
    accent: '#f7c948'
  },
  {
    id: 'nes',
    name: 'NES',
    free: false,
    darkCell: '#1a1a1a',
    lightCell: '#333333',
    whitePiece: '#fcfcfc',
    blackPiece: '#f83800',
    accent: '#f83800'
  },
  {
    id: 'neon',
    name: 'Неоновый',
    free: false,
    darkCell: '#12002e',
    lightCell: '#1f0047',
    whitePiece: '#00f5ff',
    blackPiece: '#ff2bd6',
    accent: '#39ff14'
  },
  {
    id: 'plasma',
    name: 'Плазма',
    free: false,
    darkCell: '#1a0a2e',
    lightCell: '#2d1b4e',
    whitePiece: '#b388ff',
    blackPiece: '#7c4dff',
    accent: '#ff6ec7'
  }
];

export function getSkin(id) {
  return SKINS.find(s => s.id === id) || SKINS[0];
}

export function getActiveSkin() {
  try {
    const id = localStorage.getItem('activeSkin') || 'classic8bit';
    return getSkin(id);
  } catch {
    return SKINS[0];
  }
}

export function setActiveSkin(id) {
  localStorage.setItem('activeSkin', id);
}
