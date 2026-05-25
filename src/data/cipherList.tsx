import { BlockUnit, ICipherType } from '../includes/Cipher.interface';
import { ProcessorArchitecture } from '../includes/Process.interface';
import { SimonGame } from '../components/SimonGame';
import { TurnTwo } from '../components/TurnTwo';
import MasterMind from '../components/MasterMind';

export const CipherTypes: ICipherType[] = [
    {
        name: 'Random Manual Cipher',
        complexity: 1,
        parallelism: 1,
        memoryRequired: 1024,
        block: {
            size: 1024,
            unit: BlockUnit.kilobytes,
        },
        payout: 100,
        xp: 10,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
        manualMode: [SimonGame, TurnTwo, MasterMind]
    },
    {
        name: 'Simon Cipher',
        complexity: 1,
        parallelism: 1,
        memoryRequired: 1024,
        block: {
            size: 1024,
            unit: BlockUnit.kilobytes,
        },
        payout: 100,
        xp: 10,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
        manualMode: [SimonGame]
    },
    {
        name: 'TurnTwo Cipher',
        complexity: 1,
        parallelism: 1,
        memoryRequired: 1024,
        block: {
            size: 1024,
            unit: BlockUnit.kilobytes,
        },
        payout: 100,
        xp: 10,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
        manualMode: [TurnTwo]
    },
    {
        name: 'Mastermind Cipher',
        complexity: 1,
        parallelism: 1,
        memoryRequired: 1024,
        block: {
            size: 1024,
            unit: BlockUnit.kilobytes,
        },
        payout: 100,
        xp: 10,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
        manualMode: [MasterMind]
    },
    {
        name: 'CRC-32',
        complexity: 0.5,
        parallelism: 1,
        memoryRequired: 1024,
        block: {
            size: 512,
            unit: BlockUnit.kilobytes,
        },
        cipherTier: 'mk1',
        payout: 50,
        xp: 5,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
    },
    {
        name: 'MD5',
        complexity: 1,
        parallelism: 1,
        memoryRequired: 1024,
        block: {
            size: 1024,
            unit: BlockUnit.kilobytes,
        },
        cipherTier: 'mk1',
        payout: 100,
        xp: 10,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
    },
    {
        name: 'SHA-1',
        complexity: 1.8,
        parallelism: 2,
        memoryRequired: 2048,
        block: {
            size: 2048,
            unit: BlockUnit.kilobytes,
        },
        cipherTier: 'mk2',
        payout: 180,
        xp: 18,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
    },
    {
        name: 'SHA-256',
        complexity: 2.5,
        parallelism: 2,
        memoryRequired: 2048,
        block: {
            size: 2048,
            unit: BlockUnit.kilobytes,
        },
        cipherTier: 'mk2',
        payout: 250,
        xp: 25,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
    },
    {
        name: 'AES-128',
        complexity: 3.8,
        parallelism: 3,
        memoryRequired: 3072,
        block: {
            size: 3072,
            unit: BlockUnit.kilobytes,
        },
        cipherTier: 'mk3',
        payout: 380,
        xp: 38,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
    },
    {
        name: 'AES-256',
        complexity: 4.3,
        parallelism: 3,
        memoryRequired: 3072,
        block: {
            size: 3072,
            unit: BlockUnit.kilobytes,
        },
        cipherTier: 'mk3',
        payout: 430,
        xp: 43,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
    },
    {
        name: 'RSA-1024',
        complexity: 9.1,
        parallelism: 4,
        memoryRequired: 4096,
        block: {
            size: 4096,
            unit: BlockUnit.kilobytes,
        },
        cipherTier: 'mk4',
        payout: 910,
        xp: 91,
        requiredArchitecture: [ProcessorArchitecture.risc64],
    },
    {
        name: 'RSA-2048',
        complexity: 18.2,
        parallelism: 4,
        memoryRequired: 4096,
        block: {
            size: 4096,
            unit: BlockUnit.kilobytes,
        },
        cipherTier: 'mk4',
        payout: 1820,
        xp: 182,
        requiredArchitecture: [ProcessorArchitecture.risc64],
    },
];

/** Real ciphers — manual-mode mini-game entries excluded. */
export const NEURAL_NET_CIPHERS: ICipherType[] = CipherTypes.filter((c) =>
    /^(CRC|MD5|SHA|AES|RSA)/.test(c.name),
);
