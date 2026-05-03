import PageHeader from '../../components/common/PageHeader';
import { Avatar, Card, CardContent, Chip, Grid, Typography } from '@mui/material';
import { HubOutlined, PublicTwoTone, Memory, SecurityOutlined, GavelRounded, LocalFireDepartmentOutlined, VisibilityOffOutlined } from '@mui/icons-material';

import GlyphCardHeader from '../../components/common/GlyphCardHeader';

import './style.scss';

export default function DarkWeb() {
    return (
        <>
            <PageHeader
                className="dark-web-header"
                title="Dark Web"
                subtitle="Move broken ciphers to anonymous buyers. Build reputation with each group to unlock better rates and exclusive contracts."
                breadcrumbs={['home', 'dark_web']}
                actions={
                    <div className="chips">
                        <Chip label="ONION ROUTED" size="small" variant="outlined" className="accent" style={{ marginRight: 6 }} icon={<span className="live-dot" />} />
                        <Chip label="5 GROUPS ONLINE" variant="outlined" className="cyan" icon={<HubOutlined fontSize="small" />} />
                    </div>
                }
                icon={PublicTwoTone}
            />
            <Grid container spacing={2} className="dark-web-container">
                <Grid size={{xs: 12, md: 6, lg: 4}}>
                    <Card>
                        <GlyphCardHeader
                            className="cyan"
                            title="Null Syndicate"
                            subheader="@null_syn · NA-EAST"
                            glyphColor="#26c6da"
                            avatar={
                                <Avatar variant="rounded" className="cyan">
                                    <SecurityOutlined />
                                </Avatar>
                            }
                        />
                        <CardContent>
                            <Typography variant="body1">
                                Meh.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{xs: 12, md: 6, lg: 4}}>
                    <Card>
                        <GlyphCardHeader
                            className="warning"
                            title="Iron Protocol"
                            subheader="@ironproto · EU-EAST"
                            glyphColor="#ff9800"
                            avatar={
                                <Avatar variant="rounded" className="warning">
                                    <GavelRounded />
                                </Avatar>
                            }
                        />
                        <CardContent>
                            <Typography variant="body1">
                                Meh.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{xs: 12, md: 6, lg: 4}}>
                    <Card>
                        <GlyphCardHeader
                            className="accent"
                            title="Pale Circuit"
                            subheader="@pale_circuit · EU-WEST"
                            glyphColor="#0af5b0"
                            avatar={
                                <Avatar variant="rounded" className="accent">
                                    <Memory />
                                </Avatar>
                            }
                        />
                        <CardContent>
                            <Typography variant="body1">
                                Meh.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{xs: 12, md: 6, lg: 4}}>
                    <Card>
                        <GlyphCardHeader
                            className="error"
                            title="Redline Cartel"
                            subheader="@redline_cc · SA-SOUTH"
                            glyphColor="#ff2828"
                            avatar={
                                <Avatar variant="rounded" className="error">
                                    <LocalFireDepartmentOutlined />
                                </Avatar>
                            }
                        />
                        <CardContent>
                            <Typography variant="body1">
                                Meh.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{xs: 12, md: 6, lg: 4}}>
                    <Card>
                        <GlyphCardHeader
                            className="purple"
                            title="Ghost Collective"
                            subheader="@gh0st_collective · AC-PAC"
                            glyphColor="#9c7fe0"
                            avatar={
                                <Avatar variant="rounded" className="purple">
                                    <VisibilityOffOutlined />
                                </Avatar>
                            }
                        />
                        <CardContent>
                            <Typography variant="body1">
                                Meh.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
}
