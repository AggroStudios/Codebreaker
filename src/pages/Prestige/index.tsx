import PageHeader from '../../components/common/PageHeader';
import { SettingsBackupRestoreTwoTone } from '@mui/icons-material';

import './style.scss';

export default function Prestige() {
    return (
        <PageHeader
            className="prestige-header"
            title="Prestige"
            subtitle="Upgrade your status and unlock new opportunities in the code breaking industry."
            breadcrumbs={['home', 'prestige']}
            icon={SettingsBackupRestoreTwoTone}
        />
    );
}
