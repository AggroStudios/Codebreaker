import clsx from 'clsx';
import { Component } from 'solid-js';
import { Card, CardContent, CardHeader, styled } from '@suid/material';

import { AddTwoTone } from '@suid/icons-material';
import IconButton from '@suid/material/IconButton';

import Cipher from "../../lib/Cipher";

import './styles.scss';
import { CounterState } from '../../includes/Counter.interface';

const CipherContainer = styled('div')({
    display: 'grid'
});

const CipherBreak: Component<{ state: CounterState, width: number, queueProcess: (c: Cipher) => void }> = (props) => {
    
    const { state, width, queueProcess } = props;

    const addCipher = () => {
        const cssClasses = [ 'breaking-1', 'breaking-2', 'breaking-3', 'breaking-4' ];
        const c = new Cipher(20, 10, cssClasses);
        state.setCipher(c);
        queueProcess(c);
    }

    return (
        <Card class="background">
            <CardHeader
                title='Cipher Break'
                action={
                    <IconButton onClick={addCipher}>
                        <AddTwoTone />
                    </IconButton>
                }
            />
            <CardContent>
                <CipherContainer style={{
                    'grid-template-columns': `repeat(${width}, ${100/width}%)`
                }}>
                    {state.cipher?.characterGrid.map(char => <div class={clsx(char.cssClass)}>{char.character}</div>)}
                </CipherContainer>
            </CardContent>
        </Card>
    )
}

export default CipherBreak;
