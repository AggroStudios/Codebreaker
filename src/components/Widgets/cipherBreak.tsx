import clsx from 'clsx';
import { Component, createEffect } from 'solid-js';
import { Card, CardContent, CardHeader, styled } from '@suid/material';

import { AddTwoTone } from '@suid/icons-material';
import IconButton from '@suid/material/IconButton';

import Cipher from "../../lib/Cipher";

import './styles.scss';

const CipherContainer = styled('div')({
    display: 'grid'
});

const CipherBreak: Component<{ cipher?: Cipher, width: number, addCipher: () => void }> = (props) => {
    
    const { cipher, width, addCipher } = props;

    createEffect(() => {
        console.log('Got cipher!');
    }, cipher);

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
                    {cipher?.characterGrid.map(char => <div class={clsx(char.cssClass)}>{char.character}</div>)}
                </CipherContainer>
            </CardContent>
        </Card>
    )
}

export default CipherBreak;
