import { CoachmarkStep } from '../components/Coachmarks';

export const TUTORIAL_STAGES = {
    station: {
        level: 1,
    },
    servers: {
        level: 2,
    }
};

export const STEPS: CoachmarkStep[] = [
    {
        target: null,
        title: 'Welcome to your Station',
        description: "This is your command center. Cipher breaks run here, credits accumulate, and hardware upgrades unlock new capacity. Let's walk through the key parts.",
        placement: 'center',
        stage: ['station'],
    },
    {
        target: '#coachmark-statistics',
        title: 'Station Statistics',
        description: 'Monitor CPU cores, memory, and storage in real time. Each cipher break consumes resources — upgrade your hardware to run more processes simultaneously.',
        placement: 'right',
        stage: ['station'],
    },
    {
        target: '#coachmark-cpu-activity',
        title: 'CPU Activity',
        description: 'This graph shows processor load across all running processes. Saturating your CPU will throttle cipher break speed.',
        placement: 'bottom',
        stage: ['station'],
    },
    {
        target: '#cipher-add-card',
        title: 'Queue a Cipher Break',
        description: 'Select a cipher type and hit Begin Break to start cracking. Larger ciphers pay more credits but consume more CPU and memory.',
        placement: 'top',
        stage: ['station'],
    },
    {
        target: '#main-nav-item-servers',
        title: 'Buy and Sell Servers',
        description: 'Servers are the backbone of your code breaking empire. Buy them from the marketplace to build your own data centers and networks.',
        placement: 'right',
        stage: ['servers'],
    },
];
