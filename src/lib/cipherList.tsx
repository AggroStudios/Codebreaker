import { BlockUnit, ICipherType } from '../includes/Cipher.interface';
import { ProcessorArchitecture } from '../includes/Process.interface';
import { SimonGame } from '../components/SimonGame';
import { TurnTwo } from '../components/TurnTwo';

export const CipherTypes: ICipherType[] = [
    {
        name: 'Random Manual Cipher',
        complexity: 1,
        parallelism: 1,
        memoryRequired: 1024,
        block: {
            size: 1024,
            unit: BlockUnit.megabytes,
        },
        payout: 100,
        xp: 10,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
        manualMode: [SimonGame, TurnTwo]
    },
    {
        name: 'Simon Cipher',
        complexity: 1,
        parallelism: 1,
        memoryRequired: 1024,
        block: {
            size: 1024,
            unit: BlockUnit.megabytes,
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
            unit: BlockUnit.megabytes,
        },
        payout: 100,
        xp: 10,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
        manualMode: [TurnTwo]
    },
    {
        name: 'Cipher 1',
        complexity: 1,
        parallelism: 1,
        memoryRequired: 1024,
        block: {
            size: 1024,
            unit: BlockUnit.megabytes,
        },
        payout: 100,
        xp: 10,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
    },
    {
        name: 'Cipher 2',
        complexity: 1.8,
        parallelism: 2,
        memoryRequired: 2048,
        block: {
            size: 2048,
            unit: BlockUnit.megabytes,
        },
        payout: 200,
        xp: 12,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
    },
    {
        name: 'Cipher 3',
        complexity: 2.5,
        parallelism: 3,
        memoryRequired: 3072,
        block: {
            size: 3072,
            unit: BlockUnit.megabytes,
        },
        payout: 300,
        xp: 17,
        requiredArchitecture: [ProcessorArchitecture.risc32, ProcessorArchitecture.risc64],
    },
    {
        name: 'Cipher 4',
        complexity: 3.2,
        parallelism: 4,
        memoryRequired: 4096,
        block: {
            size: 4096,
            unit: BlockUnit.megabytes,
        },
        payout: 400,
        xp: 20,
        requiredArchitecture: [ProcessorArchitecture.risc64],
    },
];