import { Avatar, Card, CardContent, CardHeader, Typography } from "@suid/material";
import { Component } from "solid-js";
import { StationStoreType } from "../../includes/Process.interface";
import AnalyticsOutlinedIcon from '@suid/icons-material/AnalyticsOutlined';


const StationStatistics: Component<{ station: StationStoreType }> = (props) => {
    const { station } = props;

    return (
        <Card class="background">
            <CardHeader
            title="Station Statistics"
            titleTypographyProps={{
                variant: 'h5',
            }}
            avatar={<Avatar>
                <AnalyticsOutlinedIcon />
            </Avatar>}
            />
            <CardContent>
                <Typography variant="body1">CPU: {station.cpu?.toString()}</Typography>
                <Typography variant="body1">Memory: {station.memory?.capacity} GB</Typography>
                <Typography variant="body1">Storage: {station.storage?.map(storage => storage.capacity).join(', ')} GB</Typography>
                <Typography variant="body1">Network: {station.network?.network.toString()}</Typography>
            </CardContent>
        </Card>
    )
}

export default StationStatistics;