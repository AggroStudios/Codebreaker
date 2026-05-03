import { Dialog as MuiDialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actions: React.ReactNode;
}

export function Dialog(props: DialogProps) {
    return (
        <MuiDialog open={props.open} onClose={props.onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogContent>{props.children}</DialogContent>
            <DialogActions>{props.actions}</DialogActions>
        </MuiDialog>
    );
}