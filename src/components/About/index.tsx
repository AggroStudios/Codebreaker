import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
    Box,
    Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import AggroStudiosLogo from '../../assets/logos/AggroStudios.png';

export interface AboutProps {
    open: boolean;
    onClose: () => void;
}

export default function About({ open, onClose }: AboutProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            aria-labelledby="about-dialog-title"
        >
            <DialogTitle
                id="about-dialog-title"
                component="div"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                About Code Breaker
                <IconButton
                    aria-label="Close about"
                    onClick={onClose}
                    size="small"
                    sx={{ outline: 0 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 3,
                    }}
                >
                    <img
                        src={AggroStudiosLogo}
                        alt="Aggro Studios Logo"
                        style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain' }}
                    />
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Typography
                    component="div"
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ display: 'block', textAlign: 'center' }}
                >
                    <h2>Thank you for playing Code Breaker!</h2>
                </Typography>

                <Typography
                    component="div"
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ display: 'block' }}
                >
                    Code Breaker - Version {import.meta.env.VITE_APP_VERSION}<br />
                </Typography>

                <Typography
                    component="div"
                    variant="overline"
                    color="text.secondary"
                    gutterBottom
                    sx={{ display: 'block' }}
                >
                    <h2 style={{ marginBottom: 0 }}>Credits</h2>
                </Typography>

                <Typography
                    component="div"
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ display: 'block' }}
                >
                    <b>Code Breaker</b> is the culmination of a lot of hard work, dedication, and big dreams. This project would not have been possible without the support of the following people:
                </Typography>

                <Typography
                    component="div"
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ display: 'block' }}
                >
                    <h3 style={{ marginBottom: 0 }}><b>Original Concept</b> by:</h3>
                    <ul style={{ marginTop: 0 }}>
                        <li>Simon Germain</li>
                        <li>Carmen Galante</li>
                    </ul>
                </Typography>

                <Typography
                    component="div"
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ display: 'block' }}
                >
                    <h3 style={{ marginBottom: 0 }}><b>Music</b> by:</h3>
                    <ul style={{ marginTop: 0 }}>
                        <li>Mathieu Lalonde - Funebrae</li>
                    </ul>
                </Typography>

            </DialogContent>

            <DialogActions sx={{ position: 'relative' }}>
                <Typography
                    component="div"
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        pointerEvents: 'none',
                    }}
                >
                    Copyright © {new Date().getFullYear()} AGGRO Studios.
                </Typography>
                <Button onClick={onClose} sx={{ outline: 0 }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
