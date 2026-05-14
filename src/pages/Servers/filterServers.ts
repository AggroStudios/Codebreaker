import type { ServerFilters } from '../../components/ServerFilters';
import type { Server } from '../../includes/Servers.interface';

type ServerWithMarketExtras = Server & { salePercent?: number; };

/**
 * Each criterion applies only when the filter value is “active”
 * (non-empty string, defined tier/formFactor/maxPrice, or boolean true).
 */
export function serverMatchesFilters(
    server: Server,
    filters: ServerFilters,
    playerMoney: number,
): boolean {
    if (filters.search !== undefined) {
        const q = filters.search.trim();
        if (q) {
            const haystack = [
                server.model,
                server.manufacturer,
                server.cpu.model,
                server.cpu.manufacturer,
            ]
                .join(' ')
                .toLowerCase();
            if (!haystack.includes(q.toLowerCase())) {
                return false;
            }
        }
    }

    if (filters.tierId !== undefined && server.tier !== filters.tierId) {
        return false;
    }

    if (filters.formFactor !== undefined && server.formFactor !== filters.formFactor) {
        return false;
    }

    if (filters.maxPrice !== undefined && server.price > filters.maxPrice) {
        return false;
    }

    if (filters.onSaleOnly === true) {
        const sale = (server as ServerWithMarketExtras).salePercent;
        if (sale == null || sale <= 0) {
            return false;
        }
    }

    if (filters.affordableOnly === true && server.price > playerMoney) {
        return false;
    }

    return true;
}
