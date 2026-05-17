const ROOM_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Short invite code (6 chars) for /play/online/:roomId */
export function generateRoomId(length = 6) {
  let id = '';
  for (let i = 0; i < length; i++) {
    id += ROOM_CHARS[Math.floor(Math.random() * ROOM_CHARS.length)];
  }
  return id;
}

export function getPlayerSessionId() {
  const key = 'duels_online_player_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}
