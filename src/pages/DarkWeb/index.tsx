import PageHeader from '../../components/common/PageHeader';
import { Chip } from '@mui/material';
import { HubOutlined, PublicTwoTone } from '@mui/icons-material';

import './style.scss';

export default function DarkWeb() {
    return (
        <PageHeader
            className="dark-web-header"
            title="Dark Web"
            subtitle="Move broken ciphers to anonymous buyers. Build reputation with each group to unlock better rates and exclusive contracts."
            breadcrumbs={['home', 'dark_web']}
            actions={
                <div className="chips">
                    <Chip label="ONION ROUTED" size="small" variant="outlined" className="accent" style={{ marginRight: 6 }} icon={<span className="live-dot" />} />
                    <Chip label="5 GROUPS ONLINE" variant="outlined" className="cyan" icon={<HubOutlined fontSize="small" />} />
                </div>
            }
            icon={PublicTwoTone}
        />
    );
}
