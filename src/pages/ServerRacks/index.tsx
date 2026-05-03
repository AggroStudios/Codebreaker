import PageHeader from '../../components/common/PageHeader';
import { CalendarViewDayTwoTone } from '@mui/icons-material';

import './style.scss';

export default function ServerRacks() {
    return (
        <PageHeader
            className="server-racks-header"
            title="Server Racks"
            subtitle="Manage your server racks and their connected servers."
            breadcrumbs={['home', 'server_racks']}
            icon={CalendarViewDayTwoTone}
        />
    );
}
