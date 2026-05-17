import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

import MatrixRain from '../../components/title/MatrixRain';
import TerminalLog from '../../components/title/TerminalLog';
import SystemReadout from '../../components/title/SystemReadout';
import TitleMenu, { TitleMenuId } from '../../components/title/TitleMenu';
import { useUIStore } from '../../stores/ui';

import codebreakerLogo from '../../assets/logos/codebreaker-logo.png';
import aggroLogo from '../../assets/logos/AggroStudios.png';
import stationBg from '../../assets/backgrounds/station_bg.png';

import './style.scss';

const STAGE_W = 1920;
const STAGE_H = 1080;
const OPERATOR_ID = '0xA3-91F4-CB07';

export default function TitleScreen() {
    const stageRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const openSettings = useUIStore((s) => s.openSettings);
    const openAbout = useUIStore((s) => s.openAbout);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        const apply = () => {
            const s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
            stage.style.transform = `scale(${s})`;
        };
        apply();
        window.addEventListener('resize', apply);
        return () => window.removeEventListener('resize', apply);
    }, []);

    const handleSelect = (id: TitleMenuId) => {
        switch (id) {
            case 'new':
            case 'continue':
                navigate('/station');
                return;
            case 'settings':
                openSettings();
                return;
            case 'credits':
                openAbout();
                return;
            case 'exit':
                window.close();
                return;
            case 'load':
            default:
                // Not yet implemented — leave as no-op so the menu still feels responsive.
                return;
        }
    };

    const sceneBgStyle = {
        backgroundImage: `
            radial-gradient(ellipse at 50% 30%, rgba(10,245,176,0.10), transparent 60%),
            radial-gradient(ellipse at 80% 90%, rgba(38,198,218,0.06), transparent 55%),
            linear-gradient(rgba(0,0,0,0.78), rgba(0,0,0,0.88)),
            url(${stationBg})
        `,
    };

    return (
        <div className="title-screen">
            <div className="scene-bg" style={sceneBgStyle} />
            <MatrixRain />
            <div className="vignette" />
            <div className="glitch-layer" />
            <div className="scan-sweep" />

            <div className="fit">
                <div ref={stageRef} className="stage" data-screen-label="Title Screen">
                    <div className="top-bar">
                        <div className="chrome-panel">
                            <span className="bracket tl" />
                            <span className="bracket tr" />
                            <span className="bracket bl" />
                            <span className="bracket br" />
                            <span className="live-dot" />
                            <span className="chrome-label">System Online</span>
                            <span className="dot-sep">·</span>
                            <span className="chrome-sub">secure channel</span>
                        </div>
                        <div className="id-stamp">
                            OPERATOR ID <b>// {OPERATOR_ID}</b>
                        </div>
                    </div>

                    <div className="center">
                        <div className="preheader">
                            <span className="rule" />
                            <span>AGGRO Studios Presents</span>
                            <span className="rule r" />
                        </div>

                        <img className="main-logo" src={codebreakerLogo} alt="Codebreaker" />

                        <div className="subtitle-block">
                            <div className="tagline">
                                Break ciphers
                                <span className="divider-dot" />
                                Own the network
                                <span className="divider-dot" />
                                Stay in the dark
                            </div>
                        </div>

                        <TitleMenu onSelect={handleSelect} />
                    </div>

                    <div className="bottom-bar">
                        <div className="bottom-bar-left">
                            <SystemReadout />
                            <div className="bottom-divider" />
                            <TerminalLog />
                        </div>
                        <div className="aggro-badge">
                            <img src={aggroLogo} alt="AGGRO Studios" />
                            <div className="copy">© {new Date().getFullYear()} · All Rights Reserved</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
