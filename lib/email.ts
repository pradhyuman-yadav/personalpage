// lib/email.ts (No changes)
const ALLOWED_DOMAINS = ['thepk.in']; // Replace with your domains
// const ALLOWED_DOMAINS = ['localhost:3000']; // Replace with your domains

export function generateRandomString(length: number): string {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export function generateEmailAddress(domainIndex: number = 0): string {
    const username = generateRandomString(10);
    const domain = ALLOWED_DOMAINS[domainIndex];
    return `${username}@${domain}`;
}

export function isValidDomain(domain: string): boolean {
    return ALLOWED_DOMAINS.includes(domain);
}