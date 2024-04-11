import { styled } from "@suid/material";

export const Header = styled('div')(({ theme }) => ({
    fontSize: '1em',
    background: 'rgba(66, 66, 66, 1)',
    borderRadius: `${theme.spacing(1)} ${theme.spacing(1)} 0 0`,
}));

export const Content = styled('code')(({ theme }) => ({
    position: 'absolute',
    top: '0px',
    left: '0px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    width: '100%',
    height: '100%',
    textAlign: 'left',
    padding: theme.spacing(2),
    overflowX: 'hidden',
    overflowY: 'scroll',
    wordBreak: 'break-all',
    boxSizing: 'border-box',
}));