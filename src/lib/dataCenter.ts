// ── Data center regions ──────────────────────────────────────────────────────
// lat/lng for pin placement; provider for theming; tier indicates the facility class
export const DATA_CENTERS = [
    { id: 'us-west',        code: 'USW-1',  name: 'US West',          city: 'San Francisco, CA',  lat:  37.7, lng: -122.4, provider: 'OmniNet',     tier: 'III', baseLeaseDay: 1850, ratePerKw: 0.084, latency: 18 },
    { id: 'us-central',     code: 'USC-2',  name: 'US Central',       city: 'Dallas, TX',         lat:  32.8, lng:  -96.8, provider: 'CoreLink',    tier: 'III', baseLeaseDay: 1620, ratePerKw: 0.072, latency: 24 },
    { id: 'us-east',        code: 'USE-1',  name: 'US East',          city: 'Ashburn, VA',        lat:  39.0, lng:  -77.5, provider: 'OmniNet',     tier: 'IV',  baseLeaseDay: 2240, ratePerKw: 0.076, latency: 12 },
    { id: 'ca-central',     code: 'CAC-1',  name: 'Canada Central',   city: 'Toronto, ON',        lat:  43.6, lng:  -82.4, provider: 'NorthBit',    tier: 'III', baseLeaseDay: 1490, ratePerKw: 0.068, latency: 22 },
    { id: 'sa-east',        code: 'SAE-1',  name: 'South America',    city: 'São Paulo, BR',      lat: -23.5, lng:  -46.6, provider: 'TropoNet',    tier: 'II',  baseLeaseDay: 1180, ratePerKw: 0.094, latency: 88 },
    { id: 'eu-west',        code: 'EUW-1',  name: 'EU West',          city: 'Dublin, IE',         lat:  57.3, lng:   -7.0, provider: 'EuroFiber',   tier: 'IV',  baseLeaseDay: 2080, ratePerKw: 0.112, latency: 32 },
    { id: 'eu-central',     code: 'EUC-1',  name: 'EU Central',       city: 'Frankfurt, DE',      lat:  53.1, lng:    8.7, provider: 'EuroFiber',   tier: 'IV',  baseLeaseDay: 2310, ratePerKw: 0.142, latency: 28 },
    { id: 'eu-north',       code: 'EUN-1',  name: 'EU North',         city: 'Stockholm, SE',      lat:  65.6, lng:   17.5, provider: 'NordCool',    tier: 'III', baseLeaseDay: 1740, ratePerKw: 0.058, latency: 38 },
    { id: 'me-central',     code: 'MEC-1',  name: 'Middle East',      city: 'Bahrain',            lat:  26.2, lng:   48.6, provider: 'DesertGrid',  tier: 'III', baseLeaseDay: 1390, ratePerKw: 0.052, latency: 64 },
    { id: 'af-south',       code: 'AFS-1',  name: 'Africa South',     city: 'Cape Town, ZA',      lat: -36.9, lng:   18.4, provider: 'AfriArc',     tier: 'II',  baseLeaseDay:  980, ratePerKw: 0.118, latency: 102 },
    { id: 'ap-south',       code: 'APS-1',  name: 'Asia South',       city: 'Mumbai, IN',         lat:  17.1, lng:   73.4, provider: 'MonsoonDC',   tier: 'III', baseLeaseDay: 1240, ratePerKw: 0.088, latency: 78 },
    { id: 'ap-southeast-1', code: 'APSE-1', name: 'Asia Southeast',   city: 'Singapore, SG',      lat:   -0.3, lng:  103.8, provider: 'EquatorIX',   tier: 'IV',  baseLeaseDay: 2640, ratePerKw: 0.146, latency: 56 },
    { id: 'ap-east',        code: 'APE-1',  name: 'Asia East',        city: 'Hong Kong',          lat:  21.3, lng:  115.7, provider: 'NeoPearl',    tier: 'III', baseLeaseDay: 2180, ratePerKw: 0.132, latency: 48 },
    { id: 'ap-northeast',   code: 'APN-1',  name: 'Asia Northeast',   city: 'Tokyo, JP',          lat:  35.7, lng:  139.7, provider: 'KoyoNet',     tier: 'IV',  baseLeaseDay: 2560, ratePerKw: 0.158, latency: 42 },
    { id: 'ap-southeast-2', code: 'APSE-2', name: 'Oceania',          city: 'Sydney, AU',         lat: -38.9, lng:  150.2, provider: 'CoralStack',  tier: 'III', baseLeaseDay: 1620, ratePerKw: 0.124, latency: 96 },
];

// ── Initial contracts ────────────────────────────────────────────────────────
export type IDataCenterContractStatus = 'ACTIVE' | 'PROVISIONING';

/** Contract terms keyed by data center id (see DATA_CENTERS). */
export interface IInitialContract {
    racks: number;
    rackCap: number;
    powerKw: number;
    uplinkGbps: number;
    signedDays: number;
    status: IDataCenterContractStatus;
}

export type IInitialContractsByRegion = Record<string, IInitialContract>;

export const INITIAL_CONTRACTS: IInitialContractsByRegion = {
    'us-west':       { racks: 8,  rackCap: 12, powerKw: 24,  uplinkGbps: 40,   signedDays: 142, status: 'ACTIVE'   },
    'us-east':       { racks: 14, rackCap: 24, powerKw: 56,  uplinkGbps: 100,  signedDays: 318, status: 'ACTIVE'   },
    'eu-central':    { racks: 6,  rackCap: 16, powerKw: 22,  uplinkGbps: 25,   signedDays: 86,  status: 'ACTIVE'   },
    'ap-northeast':  { racks: 4,  rackCap: 12, powerKw: 18,  uplinkGbps: 10,   signedDays: 47,  status: 'ACTIVE'   },
    'eu-north':      { racks: 2,  rackCap: 8,  powerKw: 6,   uplinkGbps: 10,   signedDays: 12,  status: 'PROVISIONING' },
};

// ── Upgrade tiers ────────────────────────────────────────────────────────────
// Power upgrades step the contract's allowed kW ceiling.
export const POWER_TIERS = [
    { kw: 6,   cost:    0 },
    { kw: 12,  cost:  4800 },
    { kw: 24,  cost: 14200 },
    { kw: 48,  cost: 38600 },
    { kw: 96,  cost: 92400 },
    { kw: 192, cost: 218000 },
];

// Uplink upgrades step the contract's port capacity.
export const UPLINK_TIERS = [
    { gbps: 1,   cost:    0 },
    { gbps: 10,  cost:  3200 },
    { gbps: 25,  cost:  9800 },
    { gbps: 40,  cost: 24600 },
    { gbps: 100, cost: 62400 },
    { gbps: 400, cost: 188000 },
];

// ── World-map continent polygons (lng/lat outlines) ─────────────────────────
// Hand-traced outlines — denser vertex sets so smoothed contours read clearly
// as recognizable continents.
export const CONTINENT_POLYGONS = [
    // ── North America (mainland) ───────────────────────────────────────────
    // Starts NW Alaska, traces north arctic, down Atlantic, around Florida,
    // up the Gulf, around Mexico/Baja, up the Pacific to Alaska.
    [
        [-166,66],[-156,71],[-141,70],[-128,70],[-110,72],[-95,73],[-82,73],[-72,73],
        [-66,68],[-62,60],[-66,52],[-58,49],[-52,47],[-58,44],[-66,44],[-70,41],
        [-72,40],[-74,39],[-75,37],[-76,34],[-79,32],[-80,29],[-80,25],[-83,28],
        [-85,30],[-88,30],[-90,29],[-94,29],[-97,26],[-98,21],[-95,18],[-92,16],
        [-88,16],[-84,16],[-86,13],[-88,13],[-94,16],[-97,16],[-102,17],[-106,21],
        [-110,23],[-110,27],[-114,30],[-114,32],[-117,32],[-120,34],[-122,37],
        [-124,40],[-124,46],[-122,48],[-128,52],[-132,55],[-138,58],[-148,60],
        [-152,58],[-158,57],[-162,60],[-166,66]
    ],
    // ── Hudson Bay (cut-out) ───────────────────────────────────────────────
    [
        [-95,60],[-90,63],[-82,62],[-78,58],[-82,55],[-88,55],[-94,58],[-95,60]
    ],
    // ── Greenland ──────────────────────────────────────────────────────────
    [
        [-43,83],[-22,82],[-12,76],[-22,70],[-22,65],[-30,60],[-40,60],[-46,62],
        [-50,67],[-55,72],[-52,77],[-43,83]
    ],
    // ── Central America bridge ─────────────────────────────────────────────
    [
        [-94,17],[-92,16],[-89,16],[-85,16],[-83,14],[-82,11],[-79,9],[-77,9],
        [-77,7],[-79,8],[-82,8],[-85,11],[-89,13],[-94,15],[-94,17]
    ],
    // ── South America ──────────────────────────────────────────────────────
    [
        [-78,11],[-72,12],[-66,11],[-60,8],[-52,5],[-48,1],[-44,-2],[-38,-7],
        [-35,-9],[-35,-15],[-39,-18],[-41,-22],[-47,-25],[-52,-30],[-58,-35],
        [-64,-42],[-67,-46],[-71,-50],[-74,-53],[-72,-54],[-66,-55],[-71,-50],
        [-73,-47],[-74,-43],[-73,-37],[-72,-30],[-71,-23],[-71,-17],[-77,-12],
        [-80,-6],[-81,-2],[-79,2],[-77,5],[-78,11]
    ],
    // ── Iberian peninsula ──────────────────────────────────────────────────
    [
        [-9,43],[-8,44],[-2,44],[3,42],[3,40],[0,38],[-5,36],[-9,37],[-9,43]
    ],
    // ── Western & Central Europe (mainland) ────────────────────────────────
    [
        [-2,49],[2,51],[5,53],[8,56],[8,58],[10,59],[12,55],[15,54],[19,55],
        [22,55],[26,57],[28,55],[30,52],[28,48],[24,45],[20,44],[18,42],
        [13,46],[12,44],[18,40],[16,39],[12,38],[7,44],[5,46],[3,46],
        [0,48],[-2,49]
    ],
    // ── Italy boot ─────────────────────────────────────────────────────────
    [
        [7,44],[10,45],[14,42],[18,40],[16,39],[15,38],[13,38],[12,40],[11,42],[9,43],[7,44]
    ],
    // ── Great Britain ──────────────────────────────────────────────────────
    [
        [-5,58],[-2,58],[1,55],[2,52],[1,51],[-3,50],[-5,52],[-5,55],[-5,58]
    ],
    // ── Ireland ────────────────────────────────────────────────────────────
    [
        [-10,55],[-7,55],[-6,52],[-10,52],[-10,55]
    ],
    // ── Scandinavia ────────────────────────────────────────────────────────
    [
        [5,58],[8,62],[12,65],[16,68],[20,70],[26,71],[30,69],[28,66],[24,63],
        [18,60],[12,59],[8,58],[5,58]
    ],
    // ── Africa ─────────────────────────────────────────────────────────────
    [
        [-17,21],[-17,28],[-12,32],[-6,36],[-3,36],[5,36],[10,33],[15,32],
        [20,32],[25,32],[30,32],[33,30],[35,28],[37,22],[39,18],[42,16],
        [44,12],[48,12],[51,12],[51,9],[47,4],[43,-1],[40,-5],[40,-10],
        [38,-14],[35,-19],[34,-24],[32,-28],[30,-31],[26,-34],[20,-35],
        [18,-34],[15,-30],[14,-22],[12,-15],[12,-8],[8,-2],[3,5],[-2,5],
        [-7,5],[-10,8],[-13,12],[-16,15],[-17,18],[-17,21]
    ],
    // ── Madagascar ─────────────────────────────────────────────────────────
    [
        [44,-12],[50,-15],[50,-22],[47,-25],[44,-22],[43,-17],[44,-12]
    ],
    // ── Asia / Eurasia core (Russia + central + east) ──────────────────────
    [
        [28,55],[35,60],[40,64],[50,68],[60,70],[72,72],[85,73],[100,73],
        [115,72],[130,72],[145,72],[160,69],[170,68],[178,68],[180,66],
        [178,62],[170,60],[164,59],[155,58],[150,55],[145,54],[140,55],
        [138,52],[133,48],[130,44],[127,42],[126,38],[124,36],[122,30],
        [115,30],[110,22],[108,18],[107,12],[103,10],[102,6],[100,5],
        [98,8],[96,11],[94,15],[92,20],[88,22],[86,21],[80,25],[75,27],
        [70,30],[65,35],[58,38],[52,40],[48,42],[44,42],[42,40],[42,38],
        [40,36],[36,36],[32,38],[28,40],[28,45],[28,50],[28,55]
    ],
    // ── Indian subcontinent (south of Eurasia core) ────────────────────────
    [
        [68,24],[72,28],[78,30],[82,28],[88,26],[92,24],[88,20],[83,18],
        [80,15],[78,10],[76,8],[73,12],[71,15],[70,18],[69,21],[68,24]
    ],
    // ── Arabian peninsula ──────────────────────────────────────────────────
    [
        [33,30],[40,30],[48,30],[55,28],[58,25],[59,22],[55,17],[50,12],
        [45,12],[43,16],[42,18],[40,20],[38,22],[36,26],[34,28],[33,30]
    ],
    // ── SE Asia (mainland) ─────────────────────────────────────────────────
    [
        [95,21],[100,21],[105,21],[108,18],[110,15],[107,11],[105,9],
        [101,8],[100,12],[97,14],[95,18],[95,21]
    ],
    // ── Sumatra ────────────────────────────────────────────────────────────
    [
        [95,5],[101,4],[105,-1],[103,-5],[99,-3],[96,2],[95,5]
    ],
    // ── Borneo ─────────────────────────────────────────────────────────────
    [
        [109,4],[115,5],[119,2],[118,-2],[115,-4],[110,-3],[108,0],[109,4]
    ],
    // ── New Guinea ─────────────────────────────────────────────────────────
    [
        [131,-1],[140,-3],[148,-7],[151,-10],[143,-9],[136,-6],[131,-1]
    ],
    // ── Java (small) ───────────────────────────────────────────────────────
    [
        [105,-6],[114,-7],[114,-8],[105,-7],[105,-6]
    ],
    // ── Philippines (lumped) ───────────────────────────────────────────────
    [
        [120,18],[124,16],[126,12],[125,8],[121,8],[119,12],[120,18]
    ],
    // ── Japan ──────────────────────────────────────────────────────────────
    [
        [130,33],[133,34],[136,35],[138,37],[141,40],[144,43],[145,45],
        [142,45],[139,42],[135,36],[132,34],[130,33]
    ],
    // ── Korea ──────────────────────────────────────────────────────────────
    [
        [125,40],[129,40],[129,35],[127,34],[125,36],[125,40]
    ],
    // ── Australia ──────────────────────────────────────────────────────────
    [
        [114,-22],[116,-32],[118,-35],[123,-34],[129,-32],[135,-35],
        [138,-36],[141,-38],[146,-39],[150,-37],[153,-32],[153,-28],
        [149,-22],[146,-19],[142,-12],[138,-12],[135,-15],[130,-12],
        [125,-14],[120,-19],[114,-22]
    ],
    // ── Tasmania ───────────────────────────────────────────────────────────
    [
        [144,-41],[148,-41],[148,-43],[145,-43],[144,-41]
    ],
    // ── New Zealand North ──────────────────────────────────────────────────
    [
        [173,-36],[176,-37],[178,-39],[176,-41],[174,-41],[173,-39],[173,-36]
    ],
    // ── New Zealand South ──────────────────────────────────────────────────
    [
        [167,-44],[171,-43],[174,-44],[174,-46],[170,-47],[167,-46],[167,-44]
    ],
    // ── Iceland ────────────────────────────────────────────────────────────
    [
        [-24,66],[-19,67],[-14,66],[-14,64],[-19,63],[-23,64],[-24,66]
    ],
    // ── Cuba (small Caribbean) ─────────────────────────────────────────────
    [
        [-84,22],[-78,22],[-74,21],[-77,20],[-82,21],[-84,22]
    ],
];
