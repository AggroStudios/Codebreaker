import PageHeader from '../../components/common/PageHeader';
import { ApartmentTwoTone } from '@mui/icons-material';

import './style.scss';

export default function DataCenters() {
    return (
        <PageHeader
            className="data-centers-header"
            title="Data Centers"
            subtitle="Unlock and manage data center contracts to expand your network and increase your cipher processing capacity."
            breadcrumbs={['home', 'data_centers']}
            icon={ApartmentTwoTone}
        />
    );
}
