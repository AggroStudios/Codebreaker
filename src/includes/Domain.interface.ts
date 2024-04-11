type Vulnerability = {
    name: string;
    service?: string;
    version?: string;
    description: string;
};

export interface IDomain {
    domain: string;
    subdomains: Record<string, string>;
    vulnerabilities: Record<string, Array<Vulnerability>>;
}