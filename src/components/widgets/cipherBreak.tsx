import { Component } from "solid-js";

import { Card, CardContent, CardHeader } from "@suid/material";

import GameController from "../../lib/GameController";
import Cipher from "../../lib/Cipher";

const CipherBreak: Component<{ gameController?: GameController }> = (props) => {
    
    const { gameController } = props;
    const cipher: Cipher = new Cipher();

    gameController.addProcess(cipher);

    return (
        <Card>
            <CardHeader title='Cipher Break' />
            <CardContent>
                Breaking stuff!
            </CardContent>
        </Card>
    )
}

export default CipherBreak;
