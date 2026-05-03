import PageHeader from '../../components/common/PageHeader';
import { Assignment } from '@mui/icons-material';

import './style.scss';

export default function Statistics() {
    return (
        <PageHeader
            className="statistics-header"
            title="Statistics"
            subtitle="Track your progress and analyze your performance in the code breaking industry."
            breadcrumbs={['home', 'statistics']}
            icon={Assignment}
        />
    );
}
