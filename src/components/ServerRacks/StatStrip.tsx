import { useMemo } from 'react';
import { Grid } from '@mui/material';
import {
    BoltOutlined,
    DnsOutlined,
    Inventory2Outlined,
    MemoryOutlined,
    RouterOutlined,
    SpeedOutlined,
} from '@mui/icons-material';

import { Stat } from '../common/Stat';
import { useRacksByDc, useRacksStore } from '../../stores/racks';
import { useServersStore } from '../../stores/servers';
import { serverInstId, serverSize } from '../../includes/serverRacks.interface';

interface StatStripProps {
    dcId: string;
}

export default function StatStrip({ dcId }: StatStripProps) {
    const racks = useRacksByDc(dcId);
    const allRacks = useRacksStore((s) => s.racks);
    const switches = useRacksStore((s) => s.switches);
    const purchased = useServersStore((s) => s.purchasedServers);

    const stats = useMemo(() => {
        const totalU = racks.reduce((sum, r) => sum + r.slots, 0);
        const usedU = racks.reduce(
            (sum, r) => sum + r.installed.reduce((s, it) => s + serverSize(it.server), 0),
            0,
        );
        const installedCount = racks.reduce((sum, r) => sum + r.installed.length, 0);
        // "In Inventory" is global (a server is uninstalled if it isn't in ANY rack).
        const installedIds = new Set<string>();
        allRacks.forEach((r) => r.installed.forEach((it) => installedIds.add(it.instId)));
        const inventoryCount = purchased.filter((s) => !installedIds.has(serverInstId(s))).length;
        const switchesUp = switches.filter((sw) => sw.status === 'UP').length;
        const portsUp = switches
            .filter((sw) => sw.status === 'UP')
            .reduce((sum, sw) => sum + sw.used, 0);
        const totalWatts = racks.reduce(
            (sum, r) => sum + r.installed.reduce((s, it) => s + (it.server.powerConsumption ?? 0), 0),
            0,
        );

        const loadValues = racks
            .flatMap((r) => r.installed.map((it) => it.server.load))
            .filter((l): l is number => typeof l === 'number');
        const avgLoad =
            loadValues.length > 0
                ? Math.round(loadValues.reduce((a, b) => a + b, 0) / loadValues.length)
                : null;

        return {
            totalU,
            usedU,
            installedCount,
            inventoryCount,
            switchesUp,
            portsUp,
            totalWatts,
            avgLoad,
        };
    }, [racks, allRacks, switches, purchased]);

    const avgLoadDisplay = stats.avgLoad == null ? '—' : `${stats.avgLoad}%`;
    const avgLoadAccent =
        stats.avgLoad == null
            ? undefined
            : stats.avgLoad < 80
                ? 'income'
                : 'orange';

    return (
        <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                <Stat
                    className="background"
                    titleIcon={<DnsOutlined />}
                    titleIconAccent="accent"
                    label="Racks Deployed"
                    value={String(racks.length)}
                    subheader={`${stats.totalU}U capacity`}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                <Stat
                    className="background"
                    titleIcon={<MemoryOutlined />}
                    titleIconAccent="accent"
                    label="Servers Installed"
                    value={String(stats.installedCount)}
                    accent="accent"
                    subheader={`${stats.usedU}/${stats.totalU}U used`}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                <Stat
                    className="background"
                    titleIcon={<Inventory2Outlined />}
                    titleIconAccent="accent"
                    label="In Inventory"
                    value={String(stats.inventoryCount)}
                    subheader="ready to install"
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                <Stat
                    className="background"
                    titleIcon={<RouterOutlined />}
                    titleIconAccent="accent"
                    label="Active Switches"
                    value={`${stats.switchesUp}/${switches.length}`}
                    subheader={`${stats.portsUp} ports up`}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                <Stat
                    className="background"
                    titleIcon={<SpeedOutlined />}
                    titleIconAccent="accent"
                    label="Avg Load"
                    value={avgLoadDisplay}
                    accent={avgLoadAccent}
                    subheader="across installed"
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                <Stat
                    className="background"
                    titleIcon={<BoltOutlined />}
                    titleIconAccent="accent"
                    label="Power Draw"
                    value={`${(stats.totalWatts / 1000).toFixed(2)} kW`}
                    subheader="PUE 1.18"
                />
            </Grid>
        </Grid>
    );
}
