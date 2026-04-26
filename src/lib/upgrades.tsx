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

export interface IUpgradeItem {
    key: string;
    name: string;
    description: string;
    cost: number;
    category: string;
    icon: OverridableComponent<SvgIconTypeMap<object, 'svg'>>;
    tags: string[];
}

export const UpgradeList: IUpgradeItem[] = [
    {
        key: 'auto-cipher',
        name: 'Auto Cipher',
        description: 'Automatically break ciphers when they are added to the station. Frees up manual processing cycles.',
        cost: 1000,
        category: 'software',
        icon: AutoFixHighIcon,
        tags: ['software', 'passive']
    },
    {
        key: 'codium-brkr64',
        name: 'Codium Brkr64',
        description: 'A more powerful cipher breaker. Reduces average break time by 40%.',
        cost: 2000,
        category: 'hardware',
        icon: MemoryIcon,
        tags: ['hardware', 'passive']
    },
    {
        key: 'darknet-proxy',
        name: 'Darknet Proxy',
        description: 'Routes traffic through obfuscated proxy nodes, reducing detection probability on hostile networks.',
        cost: 3500,
        category: 'network',
        icon: VpnLockIcon,
        tags: ['software', 'network']
    },
    {
        key: 'quantum-entropy-engine',
        name: 'Quantum Entropy Engine',
        description: 'Harnesses quantum randomness to generate unbreakable session keys in real-time.',
        cost: 8000,
        category: 'security',
        icon: BubbleChartIcon,
        tags: ['hardware', 'security']
    },
    {
        key: 'codium-mem32',
        name: 'Codium Mem32',
        description: 'Extends virtual memory pool by 32 units. Allows more simultaneous cipher operations.',
        cost: 1500,
        category: 'hardware',
        icon: StorageIcon,
        tags: ['hardware', 'passive']
    },
    {
        key: 'ghost-protocol',
        name: 'Ghost Protocol',
        description: 'Masks station signature from intrusion detection systems. Active cloak on connection attempts.',
        cost: 5000,
        category: 'security',
        icon: VisibilityOffIcon,
        tags: ['software', 'active', 'security']
    },
    {
        key: 'neural-injector-v2',
        name: 'Neural Injector v2',
        description: 'Injects adaptive ML payloads into target systems. Self-modifying cipher patterns exponentially increase break speed.',
        cost: 12000,
        category: 'software',
        icon: PsychologyIcon,
        tags: ['software', 'active']
    },
    {
        key: 'overclock-module',
        name: 'Overclock Module',
        description: 'Pushes Codium processors to 135% rated clock speed. Increases heat but dramatically improves throughput.',
        cost: 4500,
        category: 'hardware',
        icon: SpeedIcon,
        tags: ['hardware', 'active']
    },
    {
        key: 'cipher-database',
        name: 'Cipher Database',
        description: 'Stores solved cipher signatures for instant lookup. Known patterns are resolved in zero cycles.',
        cost: 2500,
        category: 'software',
        icon: DatasetIcon,
        tags: ['software', 'passive']
    },
    {
        key: 'network-tap',
        name: 'Network Tap',
        description: 'Passively monitors neighboring nodes for cipher leaks and broadcasts. Occasional free cipher acquisition.',
        cost: 3000,
        category: 'network',
        icon: HubIcon,
        tags: ['hardware', 'passive', 'network']
    }
];