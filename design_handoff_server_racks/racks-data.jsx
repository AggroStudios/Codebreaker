/* global window */
// Rack & inventory data for the Server Racks page.

const RACK_CATALOG = [
  { sku: 'RK-12U',  name: '12U Half Rack',     slots: 12, price:  4500,  power: 4500,  cooling: 'Passive' },
  { sku: 'RK-24U',  name: '24U Mid Rack',      slots: 24, price:  9800,  power: 9000,  cooling: 'Single fan wall' },
  { sku: 'RK-42U',  name: '42U Full Rack',     slots: 42, price: 18500,  power: 16500, cooling: 'Hot/cold aisle' },
  { sku: 'RK-48U',  name: '48U Tall Rack',     slots: 48, price: 24000,  power: 22000, cooling: 'In-row chiller' },
];

// Each owned server takes 1U..4U. Tier colors mirror servers-data.
const TIER_COLORS = {
  1: '#9e9e9e', 2: '#26c6da', 3: '#0af5b0', 4: '#ba68c8', 5: '#ff9800',
};
const TIER_NAMES = { 1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Platinum', 5: 'Quantum' };

const CIPHER_POOL = ['CRC-32', 'MD5', 'SHA-1', 'SHA-256', 'AES-128', 'RSA-2048', 'BLAKE2', 'ChaCha20'];

// Initial racks placed on the floor.
const INITIAL_RACKS = [
  {
    id: 'rack-a', sku: 'RK-42U', name: 'Rack A · Production', slots: 42,
    switchId: 'sw-core',
    installed: [
      { instId: 'i-01', sku: 'XR-2080',  name: 'XR-2080 Compute',     u: 1,  size: 2, tier: 3, watts: 380, util: 84, uptime: '6d 14h', ciphers: [{ name: 'SHA-256', progress: 64, eta: '12s' }] },
      { instId: 'i-02', sku: 'XR-2080',  name: 'XR-2080 Compute',     u: 3,  size: 2, tier: 3, watts: 380, util: 79, uptime: '6d 14h', ciphers: [{ name: 'SHA-1', progress: 41, eta: '8s' }] },
      { instId: 'i-03', sku: 'GH-560',   name: 'GH-560 GPU',          u: 5,  size: 4, tier: 4, watts: 1100, util: 62, uptime: '12d 03h', ciphers: [{ name: 'RSA-2048', progress: 22, eta: '1m 14s' }, { name: 'AES-128', progress: 88, eta: '4s' }] },
      { instId: 'i-04', sku: 'KR-1U',    name: 'KR-1U Edge',          u: 9,  size: 1, tier: 2, watts: 110, util: 41, uptime: '2d 09h', ciphers: [{ name: 'MD5', progress: 73, eta: '3s' }] },
      { instId: 'i-05', sku: 'KR-1U',    name: 'KR-1U Edge',          u: 10, size: 1, tier: 2, watts: 110, util: 38, uptime: '2d 09h', ciphers: [{ name: 'CRC-32', progress: 91, eta: '1s' }] },
      { instId: 'i-06', sku: 'ST-NAS24', name: 'ST-NAS24 Storage',    u: 12, size: 4, tier: 3, watts: 540, util: 22, uptime: '21d 11h', ciphers: [] },
      { instId: 'i-07', sku: 'XR-2080',  name: 'XR-2080 Compute',     u: 17, size: 2, tier: 3, watts: 380, util: 91, uptime: '6d 14h', ciphers: [{ name: 'SHA-256', progress: 53, eta: '18s' }] },
      { instId: 'i-08', sku: 'GH-560',   name: 'GH-560 GPU',          u: 20, size: 4, tier: 4, watts: 1100, util: 88, uptime: '8d 22h', ciphers: [{ name: 'RSA-2048', progress: 34, eta: '58s' }, { name: 'BLAKE2', progress: 12, eta: '2m 04s' }] },
    ],
  },
  {
    id: 'rack-b', sku: 'RK-24U', name: 'Rack B · GPU Pool', slots: 24,
    switchId: 'sw-gpu',
    installed: [
      { instId: 'i-09', sku: 'GH-560',   name: 'GH-560 GPU',          u: 1,  size: 4, tier: 4, watts: 1100, util: 95, uptime: '5d 02h', ciphers: [{ name: 'RSA-2048', progress: 67, eta: '34s' }, { name: 'AES-128', progress: 81, eta: '6s' }] },
      { instId: 'i-10', sku: 'GH-560',   name: 'GH-560 GPU',          u: 6,  size: 4, tier: 4, watts: 1100, util: 92, uptime: '5d 02h', ciphers: [{ name: 'RSA-2048', progress: 49, eta: '47s' }] },
      { instId: 'i-11', sku: 'QF-Q1',    name: 'QF-Q1 Quantum',       u: 11, size: 4, tier: 5, watts: 1800, util: 11, uptime: '0d 04h', ciphers: [{ name: 'ChaCha20', progress: 8, eta: '8m 12s' }] },
    ],
  },
  {
    id: 'rack-c', sku: 'RK-12U', name: 'Rack C · Edge', slots: 12,
    switchId: null,
    installed: [
      { instId: 'i-12', sku: 'KR-1U',    name: 'KR-1U Edge',          u: 1,  size: 1, tier: 2, watts: 110, util: 27, uptime: '1d 18h', ciphers: [{ name: 'MD5', progress: 19, eta: '14s' }] },
      { instId: 'i-13', sku: 'KR-1U',    name: 'KR-1U Edge',          u: 2,  size: 1, tier: 2, watts: 110, util: 33, uptime: '1d 18h', ciphers: [{ name: 'CRC-32', progress: 76, eta: '2s' }] },
    ],
  },
];

// Servers in inventory (uninstalled, ready to drag).
const INVENTORY = [
  { instId: 'inv-01', sku: 'GH-560',   name: 'GH-560 GPU',       size: 4, tier: 4, watts: 1100, hash: 'PLATINUM' },
  { instId: 'inv-02', sku: 'XR-2080',  name: 'XR-2080 Compute',  size: 2, tier: 3, watts:  380, hash: 'GOLD' },
  { instId: 'inv-03', sku: 'XR-2080',  name: 'XR-2080 Compute',  size: 2, tier: 3, watts:  380, hash: 'GOLD' },
  { instId: 'inv-04', sku: 'KR-1U',    name: 'KR-1U Edge',       size: 1, tier: 2, watts:  110, hash: 'SILVER' },
  { instId: 'inv-05', sku: 'KR-1U',    name: 'KR-1U Edge',       size: 1, tier: 2, watts:  110, hash: 'SILVER' },
  { instId: 'inv-06', sku: 'ST-NAS24', name: 'ST-NAS24 Storage', size: 4, tier: 3, watts:  540, hash: 'GOLD' },
  { instId: 'inv-07', sku: 'QF-Q1',    name: 'QF-Q1 Quantum',    size: 4, tier: 5, watts: 1800, hash: 'QUANTUM' },
  { instId: 'inv-08', sku: 'BR-MINI',  name: 'BR-Mini Bronze',   size: 1, tier: 1, watts:   60, hash: 'BRONZE' },
];

// Switches managing rack→uplink connectivity.
const INITIAL_SWITCHES = [
  { id: 'sw-core', name: 'Core-SW-01',  model: 'Catalyst 9300X', ports: 48, used: 24, throughput: '40 Gbps', status: 'UP' },
  { id: 'sw-gpu',  name: 'GPU-SW-01',   model: 'Nexus 9336C',    ports: 36, used: 12, throughput: '100 Gbps', status: 'UP' },
  { id: 'sw-edge', name: 'Edge-SW-01',  model: 'MX204',          ports: 16, used:  4, throughput: '10 Gbps',  status: 'DEGRADED' },
];

const fmtMoney = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

window.RACK_CATALOG = RACK_CATALOG;
window.TIER_COLORS = TIER_COLORS;
window.TIER_NAMES = TIER_NAMES;
window.INITIAL_RACKS = INITIAL_RACKS;
window.INVENTORY = INVENTORY;
window.INITIAL_SWITCHES = INITIAL_SWITCHES;
window.CIPHER_POOL = CIPHER_POOL;
window.fmtRackMoney = fmtMoney;
