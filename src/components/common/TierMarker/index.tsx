import { ServerTier } from '../../../includes/Servers.interface';
import clsx from 'clsx';
import './style.scss';

interface TierMarkerProps {
    tier: ServerTier;
}

export default function TierMarker(props: TierMarkerProps) {
    const { tier } = props;

    return <span className={clsx('tier-marker', `tier-${tier.toLowerCase()}`)} />;
}