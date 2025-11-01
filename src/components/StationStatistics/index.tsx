import { Card, CardContent, CardHeader, Typography } from "@suid/material";
import { Component } from "solid-js";
import { StationStoreType } from "../../includes/Process.interface";


const StationStatistics: Component<{ station: StationStoreType }> = (props) => {
    const { station } = props;

    return (
        <Card class="background">
            <CardHeader title="Station Statistics" />
            <CardContent>
                <Typography variant="body1">CPU: {station.cpu?.toString()}</Typography>
                <Typography variant="body1">Memory: {station.memory?.capacity} GB</Typography>
                <Typography variant="body1">Storage: {station.storage?.map(storage => storage.capacity).join(', ')} GB</Typography>
            </CardContent>
        </Card>
    )
}

export default StationStatistics;