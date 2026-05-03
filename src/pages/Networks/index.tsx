import PageHeader from '../../components/common/PageHeader';
import { RouterTwoTone } from '@mui/icons-material';

import './style.scss';

export default function Networks() {
    return (
        <PageHeader
            className="networks-header"
            title="Networks"
            subtitle="Manage your network infrastructure and connections between your data centers and server racks."
            breadcrumbs={['home', 'networks']}
            icon={RouterTwoTone}
        />
    );
}
