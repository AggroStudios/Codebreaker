import { SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

import './style.scss';
import clsx from 'clsx';

interface PageHeaderProps {
    className?: string;
    title: string;
    subtitle: string;
    breadcrumbs: string[];
    actions?: React.ReactNode;
    icon: OverridableComponent<SvgIconTypeMap<object, 'svg'>>;
}

export default function PageHeader(props: PageHeaderProps) {
    return (
        <div className={clsx('page-header', props.className)}>
            <div>
                <div className="breadcrumbs">
                    <props.icon />
                    /{props.breadcrumbs.join('/')}
                </div>
                <h1 className="title">
                    {props.title}
                </h1>
                <div className="subtitle">
                    <div dangerouslySetInnerHTML={{ __html: props.subtitle }} />
                </div>
            </div>
            <div className="actions">
                {props.actions}
            </div>
        </div>
    );
}