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
            <ReporterChip label="xs" sx={{ display: { xs: 'inline-flex', sm: 'none', md: 'none', lg: 'none', xl: 'none', xx: 'none', xxx: 'none', xxxx: 'none' } }} />
            <ReporterChip label="sm" sx={{ display: { xs: 'none', sm: 'inline-flex', md: 'none', lg: 'none', xl: 'none', xx: 'none', xxx: 'none', xxxx: 'none' } }} />
            <ReporterChip label="md" sx={{ display: { xs: 'none', sm: 'none', md: 'inline-flex', lg: 'none', xl: 'none', xx: 'none', xxx: 'none', xxxx: 'none' } }} />
            <ReporterChip label="lg" sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'inline-flex', xl: 'none', xx: 'none', xxx: 'none', xxxx: 'none' } }} />
            <ReporterChip label="xl" sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'inline-flex', xx: 'none', xxx: 'none', xxxx: 'none' } }} />
            <ReporterChip label="xx" sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'none', xx: 'inline-flex', xxx: 'none', xxxx: 'none' } }} />
            <ReporterChip label="xxx" sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'none', xx: 'none', xxx: 'inline-flex', xxxx: 'none' } }} />
            <ReporterChip label="xxxx" sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'none', xx: 'none', xxx: 'none', xxxx: 'inline-flex' } }} />
        </Box>
    );
}