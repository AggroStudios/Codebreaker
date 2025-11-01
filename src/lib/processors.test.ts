import { describe, it, expect } from 'vitest';
import { CodiumProcessor, CodiumProcessor64 } from './processors';
import { ProcessorArchitecture } from '../includes/Process.interface';

describe('CodiumProcessor', () => {
  it('should have default properties', () => {
    const proc = new CodiumProcessor();
    expect(proc.flops).toBe(1000000000);
    expect(proc.cores).toBe(4);
    expect(proc.manufacturer).toBe('Codium');
    expect(proc.model).toBe('Brkr 1');
    expect(proc.speed).toBe('3.2 GHz');
    expect(proc.architecture).toBe(ProcessorArchitecture.risc32);
  });

  it('should return correct string from toString()', () => {
    const proc = new CodiumProcessor();
    expect(proc.toString()).toBe('Codium Brkr 1 (risc32) - 4 cores @ 3.2 GHz');
  });
});

describe('CodiumProcessor64', () => {
  it('should override properties from CodiumProcessor', () => {
    const proc = new CodiumProcessor64();
    expect(proc.flops).toBe(1300000000);
    expect(proc.model).toBe('Brkr64 1');
    expect(proc.architecture).toBe(ProcessorArchitecture.risc64);
    expect(proc.cores).toBe(4); // inherited
    expect(proc.manufacturer).toBe('Codium'); // inherited
    expect(proc.speed).toBe('3.2 GHz'); // inherited
  });

  it('should return correct string from toString()', () => {
    const proc = new CodiumProcessor64();
    expect(proc.toString()).toBe('Codium Brkr64 1 (risc64) - 4 cores @ 3.2 GHz');
  });
});
