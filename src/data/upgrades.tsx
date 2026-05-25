import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import MemoryIcon from '@mui/icons-material/Memory';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import StorageIcon from '@mui/icons-material/Storage';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SpeedIcon from '@mui/icons-material/Speed';
import DatasetIcon from '@mui/icons-material/Dataset';
import HubIcon from '@mui/icons-material/Hub';
import LanOutlinedIcon from '@mui/icons-material/LanOutlined';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { NetworkFiber, NetworkCable, Networking, NetworkDSL } from './network';
import { StationStoreType } from '../includes/Process.interface';
import { CodiumProcessor, CodiumProcessor64, CodiumProcessorX8, CodiumProcessorQuantum1, CodiumProcessorQuantumX, CodiumProcessorSingularity } from './processors';
import { CodiumMemory, CodiumMemory128, CodiumMemory256, CodiumMemory32, CodiumMemory64 } from './memory';
import { AllInclusive } from '@mui/icons-material';

export interface IUpgradeTier {
    tierId: string;
    cost: number;
    title: string;
    description: string;
    callout: string;
    onPurchase?: (stationProxy: StationStoreType) => void;
    requires?: IUpgradeRequirement[];
}

export interface IUpgradeRequirement {
    key: string;
    tierId: string;
}

export interface IUpgradeItem {
    key: string;
    name: string;
    description: string;
    category: string;
    icon: OverridableComponent<SvgIconTypeMap<object, 'svg'>>;
    tags: string[];
    requires?: IUpgradeRequirement[];
    tiers: IUpgradeTier[];
}

export const UpgradeList: IUpgradeItem[] = [
    {
        key: 'auto-cipher',
        name: 'Auto Cipher',
        description: 'Automatically break ciphers when they are downloaded.',
        category: 'software',
        icon: AutoFixHighIcon,
        tags: ['software', 'passive'],
        tiers: [
            {
                tierId: 'mk1',
                title: 'Mk I',
                cost: 1000,
                description: 'Trivial ciphers (CRC-32 / MD5) auto-break.',
                callout: 'CRC-32 / MD5',
            },
            {
                tierId: 'mk2',
                title: 'Mk II',
                cost: 3500,
                description: 'Adds SHA-1 / SHA-256 to auto-break.',
                callout: 'SHA-1 / SHA-256',
            },
            {
                tierId: 'mk3',
                title: 'Mk III',
                cost: 11000,
                description: 'Adds AES-128 / AES-256 to auto-break.',
                callout: 'AES-128 / AES-256',
            },
            {
                tierId: 'mk4',
                title: 'Mk IV',
                cost: 34000,
                description: 'Adds RSA-1024 / RSA-2048. Full pipeline automation.',
                callout: 'RSA-1024 / RSA-2048',
            },
        ],
    },
    {
        key: 'codium-processor',
        name: 'Codium Processor',
        description: 'Core processing unit specially designed for cipher breaking.',
        category: 'hardware',
        icon: MemoryIcon,
        tags: ['hardware', 'passive'],
        tiers: [
            {
                tierId: 'mk1',
                title: 'Mk I',
                cost: 1500,
                description: 'Codium Brkr32 - baseline 2.6GHz, 4 cores.',
                callout: 'Clock 2.6GHz',
                onPurchase: (stationProxy: StationStoreType) => {
                    const processor = new CodiumProcessor();
                    stationProxy.setProcessor(processor);
                },
            },
            {
                tierId: 'mk2',
                title: 'Mk II',
                cost: 4500,
                description: 'Codium Brkr64 - 3.4GHz, 6 cores. +40% throughput.',
                callout: 'Clock 3.4GHz',
                onPurchase: (stationProxy: StationStoreType) => {
                    const processor = new CodiumProcessor64();
                    stationProxy.setProcessor(processor);
                },
            },
            {
                tierId: 'mk3',
                title: 'Mk III',
                cost: 12000,
                description: 'Codium X8 - 4.2GHz, 8 cores. +90% throughput.',
                callout: 'Clock 4.2GHz',
                onPurchase: (stationProxy: StationStoreType) => {
                    const processor = new CodiumProcessorX8();
                    stationProxy.setProcessor(processor);
                },
            },
            {
                tierId: 'mk4',
                title: 'Mk IV',
                cost: 38000,
                description: 'Codium Quantum 1 - Speculative core vectorization. 16 cores. +180%',
                callout: 'Clock 5.0GHz',
                onPurchase: (stationProxy: StationStoreType) => {
                    const processor = new CodiumProcessorQuantum1();
                    stationProxy.setProcessor(processor);
                },
            },
            {
                tierId: 'mk5',
                title: 'Mk V',
                cost: 120000,
                description: 'Codium Quantum X - Coherent qubit array. 40 cores.+400%',
                callout: 'Coherent Qubits',
                onPurchase: (stationProxy: StationStoreType) => {
                    const processor = new CodiumProcessorQuantumX();
                    stationProxy.setProcessor(processor);
                },
            },
            {
                tierId: 'mk6',
                title: 'Mk VI',
                cost: 380000,
                description: 'Codium Singularity - Closed-loop topology. 96 cores.+900%',
                callout: 'Singularity Core',
                onPurchase: (stationProxy: StationStoreType) => {
                    const processor = new CodiumProcessorSingularity();
                    stationProxy.setProcessor(processor);
                },
            },
        ],
    },
    {
        key: 'codium-memory',
        name: 'Codium Memory',
        description: 'Virtual memory pool. Allows simultaneous cipher operations.',
        category: 'hardware',
        icon: StorageIcon,
        tags: ['hardware', 'passive'],
        tiers: [
            {
                tierId: 'mk1',
                title: 'Mk I',
                cost: 1000,
                description: 'Mem16 - 16GB. 2 simultaneous breaks',
                callout: '16 GB · 2 slots',
                onPurchase: (stationProxy: StationStoreType) => {
                    const memory = new CodiumMemory();
                    stationProxy.setMemory(memory);
                },
            },
            {
                tierId: 'mk2',
                title: 'Mk II',
                cost: 3200,
                description: 'Mem32 - 32GB. 3 simultaneous breaks.',
                callout: '32GB · 3 slots',
                onPurchase: (stationProxy: StationStoreType) => {
                    const memory = new CodiumMemory32();
                    stationProxy.setMemory(memory);
                },
            },
            {
                tierId: 'mk3',
                title: 'Mk III',
                cost: 9500,
                description: 'Mem64 - 64GB ECC. 4 simultaneous breaks.',
                callout: '64GB · 4 slots',
                onPurchase: (stationProxy: StationStoreType) => {
                    const memory = new CodiumMemory64();
                    stationProxy.setMemory(memory);
                },
            },
            {
                tierId: 'mk4',
                title: 'Mk IV',
                cost: 28000,
                description: 'Mem128 - 128GB DDR5. 6 simultaneous breaks.',
                callout: '128GB · 6 slots',
                onPurchase: (stationProxy: StationStoreType) => {
                    const memory = new CodiumMemory128();
                    stationProxy.setMemory(memory);
                },
            },
            {
                tierId: 'mk5',
                title: 'Mk V',
                cost: 90000,
                description: 'Mem256 - Non-volatile. 8 simultaneous breaks.',
                callout: '256GB · 8 slots',
                onPurchase: (stationProxy: StationStoreType) => {
                    const memory = new CodiumMemory256();
                    stationProxy.setMemory(memory);
                },
            },
        ]
    },
    {
        key: 'overclock-module',
        name: 'Overclock Module',
        description: 'Pushes Codium processors past its rated clock speed.',
        category: 'hardware',
        icon: SpeedIcon,
        tags: ['hardware', 'active'],
        tiers: [
            {
                tierId: 'mk1',
                title: 'Mk I',
                cost: 5000,
                description: '+15% clock. Heat budget 70°C.',
                callout: '+15%',
                requires: [
                    {
                        key: 'codium-processor',
                        tierId: 'mk2'
                    }
                ],
            },
            {
                tierId: 'mk2',
                title: 'Mk II',
                cost: 14000,
                description: '+35% clock. Heat budget 80°C.',
                callout: '+35%',
            },
            {
                tierId: 'mk3',
                title: 'Mk III',
                cost: 42000,
                description: '+60% clock. Phase-change cooling required.',
                callout: '+60%',
            },
            {
                tierId: 'mk4',
                title: 'Mk IV',
                cost: 130000,
                description: '+95% clock. Cryogenic substrate.',
                callout: '+95%',
            },
        ],
    },
    {
        key: 'processor-cooling',
        name: 'Processor Cooling',
        description: 'Improves heat dissipation and extends processor lifespan.',
        category: 'hardware',
        icon: ThermostatOutlinedIcon,
        tags: ['hardware', 'passive'],
        tiers: [
            {
                tierId: 'mk1',
                title: 'Mk I',
                cost: 3000,
                description: 'Full copper heat sink. 50°C reduction.',
                callout: '-50°C',
            },
            {
                tierId: 'mk2',
                title: 'Mk II',
                cost: 9000,
                description: 'Closed-loop liquid cooling. 70°C reduction.',
                callout: '-70°C',
            },
            {
                tierId: 'mk3',
                title: 'Mk III',
                cost: 27000,
                description: 'Phase-change cooling array. 90°C reduction.',
                callout: '-90°C',
            },
            {
                tierId: 'mk4',
                title: 'Mk IV',
                cost: 97000,
                description: 'Cryogenic substrate cooling. 125°C reduction.',
                callout: '-125°C',
            },
        ],
    },
    {
        key: 'cipher-database',
        name: 'Cipher Database',
        description: 'Stores solved cipher signatures for instant lookup. Known patterns are resolved in zero cycles.',
        category: 'software',
        icon: DatasetIcon,
        tags: ['software', 'passive'],
        tiers: [
            {
                tierId: 'mk1',
                title: 'Mk I',
                cost: 2500,
                description: '1k signature cache. 5% instant resolve.',
                callout: '1,000 sigs',
                requires: [
                    {
                        key: 'auto-cipher',
                        tierId: 'mk1'
                    }
                ],
            },
            {
                tierId: 'mk2',
                title: 'Mk II',
                cost: 8000,
                description: '10k signature cache. 12% instant resolve.',
                callout: '10,000 sigs',
            },
            {
                tierId: 'mk3',
                title: 'Mk III',
                cost: 22000,
                description: '100k signature cache. 22% instant resolve.',
                callout: '100,000 sigs',
            },  
            {
                tierId: 'mk4',
                title: 'Mk IV',
                cost: 70000,
                description: 'Distributed cache. 35% instant resolve.',
                callout: 'Distributed',
            },
            {
                tierId: 'mk5',
                title: 'Mk V',
                cost: 200000,
                description: 'Predictive prefetch. 50% instant resolve.',
                callout: 'Predictive',
            },
        ]
    },
    {
        key: 'network-tap',
        name: 'Network Tap',
        description: 'Passively monitors neighboring nodes for cipher leaks and broadcasts. Occasional free cipher acquisition.',
        category: 'network',
        icon: HubIcon,
        tags: ['hardware', 'passive', 'network'],
        tiers: [
            {
                tierId: 'mk1',
                title: 'Mk I',
                cost: 3000,
                description: '0.5/min free cipher acquisition.',
                callout: '0.5/min',
            },  
            {
                tierId: 'mk2',
                title: 'Mk II',
                cost: 9000,
                description: '1.5/min - multi-hop sniffing.',
                callout: '1.5/min',
            },
            {
                tierId: 'mk3',
                title: 'Mk III',
                cost: 26000,
                description: '4.0/min - full-duplex parasitic relay.',
                callout: '4.0/min',
            },
        ],
    },
    {
        key: 'internet-connection',
        name: 'Internet Connectivity',
        description: 'Your station\'s connection to the internet.',
        category: 'network',
        icon: LanOutlinedIcon,
        tags: ['hardware', 'passive', 'network'],
        tiers: [
            {
                tierId: 'mk1',
                title: 'Mk I',
                cost: 1000,
                description: 'DSL - 10 Mbps.',
                callout: '10 Mbps',
                onPurchase: (stationProxy: StationStoreType) => {
                    const network = new Networking(new NetworkDSL());
                    stationProxy.setNetwork(network);
                },
            },
            {
                tierId: 'mk2',
                title: 'Mk II',
                cost: 50000,
                description: 'DOCSIS 3.1 - 100 Mbps.',
                callout: '100 Mbps',
                onPurchase: (stationProxy: StationStoreType) => {
                    const network = new Networking(new NetworkCable());
                    stationProxy.setNetwork(network);
                },
            },
            {
                tierId: 'mk3',
                title: 'Mk III',
                cost: 150000,
                description: 'Fiber Optic - 1 Gbps.',
                callout: '1 Gbps',
                onPurchase: (stationProxy: StationStoreType) => {
                    const network = new Networking(new NetworkFiber());
                    stationProxy.setNetwork(network);
                },
            },
        ]
    },
    {
        key: 'darknet-proxy',
        name: 'Darknet Proxy',
        description: 'Routes traffic through obfuscated proxy nodes, reducing detection probability on hostile networks.',
        category: 'network',
        icon: VpnLockIcon,
        tags: ['software', 'network'],
        tiers: [
            {
                tierId: 'mk1',
                title: 'Mk I',
                cost: 3500,
                description: 'Single-hop proxy. -20% detection.',
                callout: '1 hop',
            },
            {
                tierId: 'mk2',
                title: 'Mk II',
                cost: 10000,
                description: 'Onion routing, 3 hops. -55% detection.',
                callout: '3 hops',
            },
            {
                tierId: 'mk3',
                title: 'Mk III',
                cost: 32000,
                description: 'Tumbler chain, 7 hops. -80% detection..',
                callout: '7 hops',
            },
            {
                tierId: 'mk4',
                title: 'Mk IV',
                cost: 90000,
                description: 'Phantom mesh. -97% detection.',
                callout: 'Phantom',
            },
        ],
    },
    {
        key: 'quantum-entropy-engine',
        name: 'Quantum Entropy Engine',
        description: 'Harnesses quantum randomness to generate unbreakable session keys in real-time.',
        category: 'security',
        icon: BubbleChartIcon,
        tags: ['hardware', 'security'],
        tiers: [
            {
                tierId: 'mk1',
                title: 'Mk I',
                cost: 8000,
                description: '128-bit QRNG. Replaces PRNG seed.',
                callout: '128-bit',
            },
            {
                tierId: 'mk2',
                title: 'Mk II',
                cost: 25000,
                description: '256-bit QRNG. Real-time key rotation.',
                callout: '256-bit',
            },
            {
                tierId: 'mk3',
                title: 'Mk III',
                cost: 80000,
                description: 'Entangled-pair distribution.',
                callout: 'Entangled',
            },
        ],
    },
    {
        key: 'ghost-protocol',
        name: 'Ghost Protocol',
        description: 'Masks station signature from intrusion detection systems. Active cloak on connection attempts.',
        category: 'security',
        icon: VisibilityOffIcon,
        tags: ['software', 'active', 'security'],
        tiers: [
            {
                tierId: 'mk1',
                title: 'Mk I',
                cost: 5000,
                description: 'Static signature mask.',
                callout: 'Static Cloak',
            },
            {
                tierId: 'mk2',
                title: 'Mk II',
                cost: 15000,
                description: 'Rotating signature, 60s cycle.',
                callout: 'Rotating 60s',
            },
            {
                tierId: 'mk3',
                title: 'Mk III',
                cost: 48000,
                description: 'Adaptive cloak. Mimics innocuous traffic.',
                callout: 'Adaptive',
            },
            {
                tierId: 'mk4',
                title: 'Mk IV',
                cost: 145000,
                description: 'Zero-trace. Fully invisible to passive IDS.',
                callout: 'Zero-trace',
            },
        ],
    },
    {
        key: 'neural-injector-v2',
        name: 'Neural Injector v2',
        description: 'Injects adaptive ML payloads into target systems. Self-modifying cipher patterns exponentially increase break speed.',
        category: 'software',
        icon: PsychologyIcon,
        tags: ['software', 'active'],
        tiers: [
            {
                tierId: 'mk1',
                title: 'Mk I',
                cost: 12000,
                description: 'Linear regression payload. +50% break speed.',
                callout: '+50%',
                requires: [
                    {
                        key: 'codium-processor',
                        tierId: 'mk2'
                    },
                    {
                        key: 'codium-memory',
                        tierId: 'mk2'
                    },
                ]
            },
            {
                tierId: 'mk2',
                title: 'Mk II',
                cost: 42000,
                description: 'Deep CNN payload. +140% break speed.',
                callout: '+140%',
            },
            {
                tierId: 'mk3',
                title: 'Mk III',
                cost: 140000,
                description: 'Transformer payload. +320% break speed.',
                callout: '+320%',
            },
            {
                tierId: 'mk4',
                title: 'Mk IV',
                cost: 450000,
                description: 'AGI swarm. +800% break speed.',
                callout: '+800%',
            },
        ],
    },
    {
        key: 'oracle',
        name: 'Codium Oracle',
        description: 'Pre-cognitive cipher resolution. Endgame upgrade.',
        category: 'software',
        tags: ['software', 'passive', 'security'],
        icon: AllInclusive,
        tiers: [
            {
                tierId: 'mk1',
                title: 'Mk I',
                cost: 500000,
                description: 'Predicts 2 seconds ahead. 40% cycle reduction.',
                callout: '+2s',
                requires: [
                    {
                        key: 'neural-injector-v2',
                        tierId: 'mk1'
                    },
                    {
                        key: 'quantum-entropy-engine',
                        tierId: 'mk3'
                    },
                    {
                        key: 'cipher-database',
                        tierId: 'mk3'
                    },
                    {
                        key: 'codium-processor',
                        tierId: 'mk5'
                    },
                ]
            },
            {
                tierId: 'mk2',
                title: 'Mk II',
                cost: 1500000,
                description: 'Predicts 8 seconds ahead. 70% cycle reduction.',
                callout: '+8s',
                requires: [
                    {
                        key: 'neural-injector-v2',
                        tierId: 'mk2'
                    },
                    {
                        key: 'quantum-entropy-engine',
                        tierId: 'mk2'
                    },
                    {
                        key: 'cipher-database',
                        tierId: 'mk4'
                    },
                    {
                        key: 'codium-processor',
                        tierId: 'mk6'
                    },
                ]
            },
            {
                tierId: 'mk3',
                title: 'Mk III',
                cost: 4000000,
                description: 'Closed timelike curve. Solves ciphers retroactively.',
                callout: '∞',
                requires: [
                    {
                        key: 'neural-injector-v2',
                        tierId: 'mk4'
                    },
                    {
                        key: 'quantum-entropy-engine',
                        tierId: 'mk1'
                    },
                    {
                        key: 'cipher-database',
                        tierId: 'mk5'
                    },
                    {
                        key: 'codium-processor',
                        tierId: 'mk6'
                    },
                ]
            },
        ],
    },
    {
        key: 'sentinel-protocol',
        name: 'Sentinel Protocol',
        description: 'Adaptive intrusion-detection suite that masks the station\'s signature and pre-classifies hostile traffic. Lowers the chance of a probe slipping through and shortens the response window when one does.',
        category: 'security',
        icon: ShieldOutlinedIcon,
        tags: ['security', 'software', 'passive'],
        tiers: [
            {
                tierId: 'mk1',
                title: 'Mk I',
                cost: 5000,
                description: 'Heuristic signature filter. -1 challenge round, -1% intrusion chance.',
                callout: 'Watchful',
            },
            {
                tierId: 'mk2',
                title: 'Mk II',
                cost: 10000,
                description: 'Real-time traffic classifier. -2 challenge rounds, -2% intrusion chance.',
                callout: 'Vigilant',
            },
            {
                tierId: 'mk3',
                title: 'Mk III',
                cost: 20000,
                description: 'Rotating signature decoys. -3 challenge rounds, -3% intrusion chance.',
                callout: 'Cloaked',
            },
            {
                tierId: 'mk4',
                title: 'Mk IV',
                cost: 40000,
                description: 'Predictive countermeasures. -4 challenge rounds, -4% intrusion chance.',
                callout: 'Phantom',
            },
            {
                tierId: 'mk5',
                title: 'Mk V',
                cost: 75000,
                description: 'Station signature scrubbed beyond detection. Hostile probes can no longer find you.',
                callout: 'Silent',
            },
        ],
    },
];