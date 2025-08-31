import { Component, createSignal } from 'solid-js';
import { Button, TextField, Card, CardContent, CardActions, CardHeader, Avatar } from '@suid/material';
import { red } from '@suid/material/colors';

import { AuthenticationState } from '../includes/Authentication.interface';

const Counter: Component<{ auth: AuthenticationState }> = props => {
    const state = props.auth;

    const [username, setUsername] = createSignal<string>('');
    const [password, setPassword] = createSignal<string>('');

    const handleLogin = () => {
        state.login(username(), password());
    };

    const handleFieldChange = (setter: (value: unknown) => void) => (_: Event, value: string) => {
        setter(value);
    }

    return (
        <Card sx={{ minWidth: 275 }}>
            <CardHeader avatar={<Avatar sx={{ bgcolor: red[500] }}>R</Avatar>} title="Login!" subheader="Go ahead! It's free!" />
            <CardContent>
                <TextField fullWidth label='Username' onChange={handleFieldChange(setUsername)} />
                <TextField fullWidth type='password' label='Password' onChange={handleFieldChange(setPassword)} />
            </CardContent>
            <CardActions>
                <Button variant="contained" onClick={handleLogin}>
                    Login
                </Button>
            </CardActions>
        </Card>
    );
};

export default Counter;