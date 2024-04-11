import { IDomain } from '../../includes/Domain.interface';
import allDomains from './domains';

export class HackingScenarios {
    
    static getAllDomains(): string[] {
        return allDomains.map(domain => domain.domain);
    }

    static findVulnerabilityByIp(ip: string) {
        const vulnerabilities = allDomains.find((domain: IDomain) => Object.keys(domain.vulnerabilities).includes(ip));
        
        if (vulnerabilities) {
            if (Object.keys(vulnerabilities.vulnerabilities).includes(ip)) {
                return vulnerabilities.vulnerabilities[ip];
            }
        }
        return;
    }
};
    