import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

const ReporterChip = styled(Chip)({
    backgroundColor: 'red',
    color: 'white',
});

export default function BreakpointReporter() {
    return (
        <Box sx={{ backgroundColor: 'red', padding: '1rem', position: 'absolute', right: 0, bottom: 0 }}>
            <ReporterChip label="xs" sx={{ display: { xs: 'inline-flex', sm: 'none'} }} />
            <ReporterChip label="sm" sx={{ display: { xs: 'none', sm: 'inline-flex', md: 'none' } }} />
            <ReporterChip label="md" sx={{ display: { xs: 'none', sm: 'none', md: 'inline-flex', lg: 'none' } }} />
            <ReporterChip label="lg" sx={{ display: { xs: 'none', md: 'none', lg: 'inline-flex', xl: 'none' } }} />
            <ReporterChip label="xl" sx={{ display: { xs: 'none', lg: 'none', xl: 'inline-flex', xx: 'none' } }} />
            <ReporterChip label="xx" sx={{ display: { xs: 'none', xl: 'none', xx: 'inline-flex', xxx: 'none' } }} />
            <ReporterChip label="xxx" sx={{ display: { xl: 'none', xx: 'none', xxx: 'inline-flex', xxxx: 'none' } }} />
            <ReporterChip label="xxxx" sx={{ display: { xx: 'none', xxx: 'none', xxxx: 'inline-flex' } }} />
        </Box>
    );
}