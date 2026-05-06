import PageHeader from '../../components/common/PageHeader';
import { AccountBalanceOutlined, Assignment, CheckCircleOutlined, CodeTwoTone, InfoOutlined, PaidOutlined, PaymentsOutlined, SavingsOutlined, ScheduleOutlined, SsidChartOutlined, TrendingDownOutlined, TrendingUpOutlined, VerifiedOutlined } from '@mui/icons-material';

import './style.scss';
import { usePlayerStore } from '../../stores/player';
import { DURATION_UNITS_LONG, formatDuration, formatMoney } from '../../lib/utils';
import { Box, Chip, Grid, Table, TableBody, TableCell, TableFooter, TableHead, TableRow } from '@mui/material';
import { Stat } from '../../components/common/Stat';
import { useEffect, useState } from 'react';
import { Sparkline } from '../../components/common/Sparkline';
import StationCard, { StationCardAccentType } from '../../components/common/StationCard';
import { padStart } from 'lodash';
import clsx from 'clsx';
import { ShimmerProgress } from '../../components/common/ShimmerProgress';
import { LinearProgress } from '../../components/common/LinearProgress';

const INCOME_RATE_REFRESH_MS = 2000;

const LinearProgressColorArray = ['accent', 'cyan', 'orange', 'blue', 'red', 'purple'];

export default function Statistics() {
    const bankBalance = usePlayerStore((state) => state.player.money);
    const statistics = usePlayerStore((state) => state.player.statistics);
    const incomeHistory = usePlayerStore((state) => state.player.statistics.incomeHistory);
    const pushIncomeRate = usePlayerStore((state) => state.pushIncomeRate);

    const [incomeRate, setIncomeRate] = useState(() => {
        const seconds = statistics.totalPlayedTime / 1000;
        return seconds > 0 ? statistics.totalMoneyEarned / seconds : 0;
    });

    const incomeRatePeak = incomeHistory.length > 0 ? Math.max(...incomeHistory) : 0;
    const incomeRateAvg = incomeHistory.length > 0
        ? incomeHistory.reduce((sum, v) => sum + v, 0) / incomeHistory.length
        : 0;

    // Re-render only when totalPlayedTime crosses each 2s bucket, even though
    // the store updates ~60 times per second. Zustand's strict-equality compare
    // skips renders while the bucket value is unchanged.
    const incomeRateBucket = usePlayerStore(
        (s) => Math.floor(s.player.statistics.totalPlayedTime / INCOME_RATE_REFRESH_MS),
    );

    useEffect(() => {
        const stats = usePlayerStore.getState().player.statistics;
        const seconds = stats.totalPlayedTime / 1000;
        const nextRate = seconds > 0 ? stats.totalMoneyEarned / seconds : 0;
        setIncomeRate(nextRate);
        pushIncomeRate(nextRate);
    }, [incomeRateBucket, pushIncomeRate]);
    
    const cipherEntries = Object.values(statistics.totalCiphers).sort((a, b) => b.success + b.failed - (a.success + a.failed));
    const totalCipherAttempts = cipherEntries.reduce(
        (acc, c) => acc + c.success + c.failed,
        0,
    );

    const totalCipherSuccesses = cipherEntries.reduce((acc, c) => acc + c.success, 0);
    const totalCipherFailures = cipherEntries.reduce((acc, c) => acc + c.failed, 0);
    const totalCipherSuccessRate = totalCipherSuccesses / totalCipherAttempts * 100;
    const totalCipherEarned = cipherEntries.reduce((acc, c) => acc + c.success * c.cipher.payout, 0);

    const totalPlayedTime = formatDuration(statistics.totalPlayedTime / 1000, true);
    const totalPlayedTimeSubtitle = (totalPlayedTime as string[]).splice(-2);
    const totalPlayedTimeTitle = totalPlayedTime as string[];
    const totalPlayedTimeLong = formatDuration(statistics.totalPlayedTime / 1000, true, false) as string[];

    return (
        <>
            <PageHeader
                className="statistics-header"
                title="Statistics"
                subtitle="Lifetime performance across the operation - ciphers cracked, capital accumulated, infrastructure deployed."
                breadcrumbs={['home', 'statistics']}
                icon={Assignment}
                actions={
                    <div className="chips">
                        <Chip label="LIVE TELEMETRY" size="small" variant="outlined" className="accent" style={{ marginRight: 6 }} icon={<span className="live-dot" />} />
                        <Chip label={`BANK $${formatMoney(bankBalance)}`} variant="outlined" icon={<PaymentsOutlined fontSize="small" />} />
                        <Chip label={`${incomeRate > 0 ? '+' : '-'}$${formatMoney(incomeRate)}`} variant="outlined" className="accent" icon={<TrendingUpOutlined fontSize="small" />} />
                    </div>
                }
                />
            <Grid container spacing={2} className="statistics-container">
                <Grid size={{ xs: 12, md: 6, lg: 4, xl: 2 }}>
                    <Stat
                        className="background"
                        titleIcon={<VerifiedOutlined />}
                        titleIconAccent='accent'
                        label="Ciphers Broken"
                        value={totalCipherSuccesses.toString()}
                        subheader={`${totalCipherAttempts} total`}
                        accent='accent'
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 4, xl: 2 }}>
                    <Stat
                        className="background"
                        titleIcon={<InfoOutlined />}
                        titleIconAccent='orange'
                        label="Ciphers Failed"
                        value={totalCipherFailures.toString()}
                        subheader={`${(100 - totalCipherSuccessRate).toFixed(2)}% fail rate`}
                        accent='orange'
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 4, xl: 2 }}>
                    <Stat
                        className="background"
                        titleIcon={<CheckCircleOutlined />}
                        titleIconAccent='accent'
                        label="Success Rate"
                        value={totalCipherSuccessRate.toFixed(2) + '%'}
                        subheader="lifetime average"
                        accent='income'
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 4, xl: 2 }}>
                    <Stat
                        className="background"
                        titleIcon={<SavingsOutlined />}
                        titleIconAccent='accent'
                        label="Bank Balance"
                        value={`$${formatMoney(bankBalance)}`}
                        subheader={`LT $${formatMoney(statistics.totalMoneyEarned)} earned`}
                        accent='accent'
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 4, xl: 2 }}>
                    <Stat
                        className="background"
                        titleIcon={<TrendingUpOutlined />}
                        titleIconAccent='accent'
                        label="Income Rate"
                        value={`$${formatMoney(incomeRate)}/s`}
                        subheader={`$${(incomeRate * 60).toFixed(2)}/min`}
                        accent='income'
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 4, xl: 2 }}>
                    <Stat
                        className="background"
                        titleIcon={<ScheduleOutlined />}
                        titleIconAccent='accent'
                        label="Total Played Time"
                        value={totalPlayedTimeTitle.join(' ')}
                        subheader={totalPlayedTimeSubtitle.join(' ')}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                    <StationCard 
                        id="incomeRate"
                        avatar={SsidChartOutlined}
                        accent={StationCardAccentType.ACCENT}
                        title="Income / Production"
                        subheader="REAL-TIME · $ PER SECOND"
                        headerAction={<Chip className="accent" label="LIVE" size="small" icon={<span className="live-dot" />} />}
                        content={
                            <>
                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: 12, marginBottom: 14,
                                }}>
                                    <Stat label="CURRENT" value={`$${formatMoney(incomeRate)}`} accent="accent" />
                                    <Stat label="PEAK" value={`$${formatMoney(incomeRatePeak)}`} />
                                    <Stat label="AVG" value={`$${formatMoney(incomeRateAvg)}`} />
                                    <Stat label="Project 24h" value={`$${formatMoney(incomeRate * 60 * 24)}`} accent="income" />
                                </div>
            
                                <Sparkline
                                    height={320}
                                    values={incomeHistory.map((y, x) => ({ x, y }))}
                                    zeroMinYAxis={true}
                                    yAxisPrefix="$"
                                    decimalPrecision={2}
                                    xAxisLabel="LAST 5 MIN →"
                                />
                            </>
                        }
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StationCard 
                        avatar={AccountBalanceOutlined}
                        accent={StationCardAccentType.ACCENT}
                        title="Capital & Uptime"
                        subheader="OPERATIONAL TENURE"
                        content={
                            <>
                                <Box className="capital-uptime-callout-container">
                                    <span className="callout accent">UPTIME</span>
                                    <Box className="capital-uptime-callout-content">
                                    {totalPlayedTimeLong.map((unit, index) => (
                                        <Box className="capital-uptime-callout-title" key={index}>
                                            <span className="accent">{padStart(unit ?? '0', 2, '0')}</span>
                                            <span className="subheader">{DURATION_UNITS_LONG[index].toUpperCase()}</span>
                                        </Box>
                                    ))}
                                    </Box>
                                </Box>
                                <Table sx={{ width: '100%' }} size="small">
                                    <TableBody>
                                        <TableRow className="statistics-row">
                                            <TableCell className="title-cell" sx={{ whiteSpace: 'nowrap' }}><PaymentsOutlined /> Bank balance</TableCell>
                                            <TableCell className="value-cell accent">${formatMoney(bankBalance)}</TableCell>
                                        </TableRow>
                                        <TableRow className="statistics-row">
                                            <TableCell className="title-cell" sx={{ whiteSpace: 'nowrap' }}><TrendingUpOutlined /> Lifetime earned</TableCell>
                                            <TableCell className="value-cell">${formatMoney(statistics.totalMoneyEarned)}</TableCell>
                                        </TableRow>
                                        <TableRow className="statistics-row">
                                            <TableCell className="title-cell" sx={{ whiteSpace: 'nowrap' }}><TrendingDownOutlined /> Lifetime spent</TableCell>
                                            <TableCell className="value-cell">${formatMoney(statistics.totalMoneySpent)}</TableCell>
                                        </TableRow>
                                        <TableRow className="statistics-row">
                                            <TableCell className="title-cell" sx={{ whiteSpace: 'nowrap' }}><PaidOutlined /> Net profit</TableCell>
                                            <TableCell className={clsx('value-cell', statistics.totalMoneyEarned - statistics.totalMoneySpent > 0 ? 'accent' : 'loss')}>${formatMoney(statistics.totalMoneyEarned - statistics.totalMoneySpent)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                                <Box className="capital-uptime-ratio-shimmer-container">
                                    <ShimmerProgress
                                        title={
                                            <Box className="capital-uptime-ratio-shimmer-title">
                                                <span>Reinvestment Ratio</span>
                                                <span className="cyan">{(statistics.totalMoneySpent / statistics.totalMoneyEarned * 100).toFixed(0)}%</span>
                                            </Box>
                                        }
                                        value={statistics.totalMoneySpent / statistics.totalMoneyEarned * 100}
                                        color="cyan"
                                    />
                                </Box>
                            </>
                        }
                    />
                </Grid>
                <Grid size={12}>
                    <StationCard
                        id="ciphersBroken"
                        avatar={CodeTwoTone}
                        accent={StationCardAccentType.CYAN}
                        title="Ciphers Broken"
                        subheader="LIFETIME · BY TYPE"
                        headerAction={<Chip className="accent" label={`${totalCipherSuccessRate.toFixed(2) + '%'} success`} size="small" />}
                        content={
                            <Table sx={{ width: '100%' }}>
                                <TableHead className="statistics-cipher-broken-table-head">
                                    <TableRow>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Type</TableCell>
                                        <TableCell sx={{ width: '100%' }}>Success Distribution</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Success</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Failed</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Earned</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody className="statistics-cipher-broken-table-body">
                                    {cipherEntries.map((entry, index) => (
                                        <TableRow key={entry.cipher.name}>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{entry.cipher.name}</TableCell>
                                            <TableCell sx={{ width: '100%' }}>
                                                <LinearProgress
                                                    total={totalCipherAttempts}
                                                    current={entry.success + (entry.failed)}
                                                    success={entry.success}
                                                    failure={entry.failed}
                                                    color={LinearProgressColorArray[index % LinearProgressColorArray.length] as 'accent' | 'blue' | 'cyan' | 'orange' | 'red' | 'purple'}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }} className="accent">{entry.success}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }} className="red">{entry.failed}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }} className="income">${formatMoney(entry.success * entry.cipher.payout)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter className="statistics-cipher-broken-table-footer">
                                    <TableRow>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Total</TableCell>
                                        <TableCell sx={{ width: '100%' }}>{totalCipherAttempts} attempts</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{totalCipherSuccesses}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{totalCipherFailures}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>${formatMoney(totalCipherEarned)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        }
                    />
                </Grid>
            </Grid>
        </>
    );
}
