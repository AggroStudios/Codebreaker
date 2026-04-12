import {
    Avatar,
    Card,
    CardContent,
    CardHeader,
    TableBody,
    Table,
    TableRow,
    TableCell,
} from "@suid/material";
import { Component } from "solid-js";
import { StationStoreType } from "../../includes/Process.interface";
import AnalyticsOutlinedIcon from "@suid/icons-material/AnalyticsOutlined";

const StationStatistics: Component<{ station: StationStoreType }> = (props) => {
    const { station } = props;

    return (
        <Card class="background">
            <CardHeader
                title="Station Statistics"
                titleTypographyProps={{
                    variant: "h5",
                }}
                avatar={
                    <Avatar>
                        <AnalyticsOutlinedIcon />
                    </Avatar>
                }
            />
            <CardContent>
                <Table sx={{ width: "100%" }} size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell>CPU:</TableCell>
                            <TableCell sx={{ width: "100%" }}>
                                {station.cpu?.toString()}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Memory:</TableCell>
                            <TableCell>{station.memory?.capacity} GB</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Storage:</TableCell>
                            <TableCell>
                                {station.storage
                                    ?.map((storage) => storage.capacity)
                                    .join(", ")}{" "}
                                GB
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Network:</TableCell>
                            <TableCell>
                                {station.network?.network.toString()}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default StationStatistics;
