import { Chip } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import { Lan, StorageTwoTone } from '@mui/icons-material';

import './style.scss';

export default function Servers() {
    return (
        <PageHeader
            className="servers-header"
            title="Servers Store"
            subtitle="Buy and sell servers from the marketplace to build your own code breaking empire."
            breadcrumbs={['home', 'servers']}
            actions={
                <div className="chips">
                    <Chip label="ONLINE" size="small" variant="outlined" className="accent" style={{ marginRight: 6 }} icon={<span className="live-dot" />} />
                    <Chip label="ALL UPLINKS UP" variant="outlined" icon={<Lan fontSize="small" />} />
                </div>
            }
            icon={StorageTwoTone}
        />
    );
}
