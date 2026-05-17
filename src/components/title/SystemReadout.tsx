import { useEffect, useState } from 'react';

const pad2 = (n: number) => String(n).padStart(2, '0');

const VERSION = import.meta.env.VITE_APP_VERSION ?? 'dev';

export default function SystemReadout() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const time = `${pad2(now.getUTCHours())}:${pad2(now.getUTCMinutes())}:${pad2(now.getUTCSeconds())}`;

    return (
        <div className="readout">
            <div className="row"><b>UTC</b><span className="v">{time}</span></div>
            <div className="row"><b>NODE</b><span className="v">aggro-04.dc-west</span></div>
            <div className="row"><b>BUILD</b><span className="v">{VERSION}</span></div>
        </div>
    );
}
