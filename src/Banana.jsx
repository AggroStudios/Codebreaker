import { Button } from '@suid/material';

const Counter = props => {
    const test = props.banana || 'banana';
    return (
        <Button variant="contained">
            Hello, {test}!
        </Button>
    );
};

export default Counter;