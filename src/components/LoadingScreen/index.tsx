import { styled } from 'solid-styled-components';
import LinearProgress from '@suid/material/LinearProgress';
import LoadingImage from '../../assets/CodeBreaker-Logo.jpeg';

import './LoadingScreen.scss';

const BackgroundElement = styled('div')(() => `
    boxSizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    backgroundImage: linear-gradient(rgba(0,0,0,1), rgba(0,0,0,1));
    backgroundSize: cover;
    backgroundRepeat: no-repeat;
    backgroundAttachment: fixed;
    backgroundPosition: center;
    width: 100%;
    zIndex: 9999;
`);

const Background = (props: { loading: number }) => {

    return (
        <BackgroundElement style={{ display: props.loading < 100 ? 'block' : 'none' }}>
            <img src={LoadingImage} class="logoImage" />
            <LinearProgress
                variant="determinate"
                value={props.loading}
                sx={{
                    position: 'absolute',
                    bottom: '50px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    height: '10px',
                    backgroundColor: '#333333',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: '#0af5b0'
                    }
                }} />
        </BackgroundElement>
    );
};

export default Background;