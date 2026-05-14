import PageHeader from '../../components/common/PageHeader';
import { ShareTwoTone } from '@mui/icons-material';

import './style.scss';

export default function NeuralNet() {
    return (
        <PageHeader
            className="neural-net-header"
            title="Neural Net"
            subtitle="Unleash the power of Artificial Intelligence. Train your neural network to break ciphers faster and more efficiently."
            breadcrumbs={['home', 'neural_net']}
            icon={ShareTwoTone}
        />
    );
}
