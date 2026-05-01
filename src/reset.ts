const RESET_KEY = 'reset-pending';
const STORE_KEYS = ['player-store', 'station-store', 'storage-store', 'coachmarks-store'];

if (sessionStorage.getItem(RESET_KEY)) {
    sessionStorage.removeItem(RESET_KEY);
    STORE_KEYS.forEach((key) => localStorage.removeItem(key));
}
