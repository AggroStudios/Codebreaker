import { useState, type ChangeEvent } from 'react';
import {
    Avatar,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    TextField,
} from '@mui/material';
import { red } from '@mui/material/colors';

import { useAuthStore } from '../stores/auth';

export default function Login() {
    const login = useAuthStore((s) => s.login);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        login(username, password);
    };

    return (
        <Card sx={{ minWidth: 275 }}>
            <CardHeader
                avatar={<Avatar sx={{ bgcolor: red[500] }}>R</Avatar>}
                title="Login!"
                subheader="Go ahead! It's free!"
            />
            <CardContent>
                <TextField
                    fullWidth
                    label="Username"
                    value={username}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setUsername(e.target.value)
                    }
                />
                <TextField
                    fullWidth
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                    }
                />
            </CardContent>
            <CardActions>
                <Button variant="contained" onClick={handleLogin}>
                    Login
                </Button>
            </CardActions>
        </Card>
    );
}
