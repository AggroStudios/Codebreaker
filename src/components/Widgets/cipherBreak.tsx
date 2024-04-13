import clsx from 'clsx';
import { Component, createEffect } from 'solid-js';
import { Card, CardContent, CardHeader, styled } from '@suid/material';

import OperatingSystem from "../../lib/OperatingSystem";
import Cipher from "../../lib/Cipher";

import './styles.scss';

const CipherContainer = styled('div')({
    display: 'grid'
});

const CipherBreak: Component<{ operatingSystem?: OperatingSystem, width: number, height: number }> = (props) => {
    
    const { operatingSystem, width, height } = props;
    const cssClasses = [ 'breaking-1', 'breaking-2', 'breaking-3', 'breaking-4' ];
    const cipher: Cipher = new Cipher(width, height, cssClasses);

    // const {
    //     characterGrid,
    //     setCharacterGrid,
    // } = cipherStore();

    operatingSystem.addProcess(cipher);

    createEffect(() => {
        console.log('Mounted!');
    }, []);

    return (
        <Card>
            <CardHeader title='Cipher Break' />
            <CardContent>
                <CipherContainer style={{
                    'grid-template-columns': `repeat(${width}, ${100/width}%)`
                }}>
                    {cipher.characterGrid.map(char => <div class={clsx(char.cssClass)}>{char.character}</div>)}
                </CipherContainer>
            </CardContent>
        </Card>
    )
}

export default CipherBreak;
