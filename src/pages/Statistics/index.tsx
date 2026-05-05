import PageHeader from '../../components/common/PageHeader';
import { Assignment } from '@mui/icons-material';

import './style.scss';
import { usePlayerStore } from '../../stores/player';
import { formatDuration, formatMoney } from '../../lib/utils';
import { useEffect } from 'react';

export default function Statistics() {
    const statistics = usePlayerStore((state) => state.player.statistics);
    const cipherEntries = Object.values(statistics.totalCiphers).sort((a, b) => b.success + b.failed - (a.success + a.failed));
    const totalCipherAttempts = cipherEntries.reduce(
        (acc, c) => acc + c.success + c.failed,
        0,
    );
    const totalPayout = cipherEntries.reduce((acc, c) => acc + c.cipher.payout * c.success, 0);

    useEffect(() => {
        console.log(formatDuration(statistics.totalPlayedTime / 1000, true));
    }, [statistics.totalPlayedTime]);

    return (
        <>
            <PageHeader
                className="statistics-header"
                title="Statistics"
                subtitle="Track your progress and analyze your performance in the code breaking industry."
                breadcrumbs={['home', 'statistics']}
                icon={Assignment}
            />
            <div className="statistics-content">
                Total Played Time: {formatDuration(statistics.totalPlayedTime / 1000)}
                <br />
                Money Earned: ${formatMoney(statistics.totalMoneyEarned)}
                <br />
                Money Spent: ${formatMoney(statistics.totalMoneySpent)}
                <br />
                Total Ciphers: {totalCipherAttempts} Total Payout: ${formatMoney(totalPayout)}
                <br />
                {cipherEntries.map((c) => (
                    <div key={c.cipher.name}>
                        {c.cipher.name}: {c.success} success, {c.failed} failed ({((c.success / (c.success + c.failed)) * 100).toFixed(2)}%) Total Payout: ${formatMoney(c.cipher.payout * c.success)}
                    </div>
                ))}
            </div>
        </>
    );
}
