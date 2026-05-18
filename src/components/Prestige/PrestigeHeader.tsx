import { Chip } from '@mui/material';
import {
    DiamondTwoTone,
    MilitaryTechTwoTone,
    SettingsBackupRestoreTwoTone,
} from '@mui/icons-material';

import PageHeader from '../common/PageHeader';
import { fmtNum } from '../../lib/utils';
import { usePrestigeDerived } from './usePrestigeDerived';

export default function PrestigeHeader() {
    const { canPrestige, available, level, levelRequirement } = usePrestigeDerived();

    return (
        <PageHeader
            className="prestige-header"
            title="Prestige"
            subtitle="Hard-reset the run to bank permanent Prestige Points and reshape your operator's skill tree. Each cycle compounds. Spend wisely — points refund any time."
            breadcrumbs={['home', 'prestige']}
            icon={SettingsBackupRestoreTwoTone}
            actions={
                <div className="chips">
                    {canPrestige ? (
                        <Chip
                            label="ARMED"
                            size="small"
                            variant="outlined"
                            className="accent"
                            style={{ marginRight: 6 }}
                            icon={<span className="live-dot" />}
                            aria-live="polite"
                        />
                    ) : (
                        <Chip
                            label="LOCKED"
                            size="small"
                            variant="outlined"
                            className="orange"
                            style={{ marginRight: 6 }}
                            icon={<span className="live-dot warn" />}
                            aria-live="polite"
                        />
                    )}
                    <Chip
                        label={`LEVEL ${Math.floor(level)} / ${levelRequirement}`}
                        variant="outlined"
                        icon={<MilitaryTechTwoTone fontSize="small" />}
                    />
                    <Chip
                        label={`${fmtNum(available)} PP AVAIL`}
                        variant="outlined"
                        className="cyan"
                        icon={<DiamondTwoTone fontSize="small" />}
                    />
                </div>
            }
        />
    );
}
