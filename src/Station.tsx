import "./App.css";
import { create } from "solid-zustand/store";

import { CounterState } from "./includes/Counter.interface";

import { StationStoreType } from "./includes/Process.interface";
import { Component, createEffect, createSignal, onCleanup } from "solid-js";

import CipherBreak from "./components/Widgets/cipherBreak";
import StationStatistics from "./components/StationStatistics";

import Grid from "@suid/material/Grid";

import Cipher from "./lib/Cipher";
import { CpuActivityWidget } from "./components/Widgets/cpuActivity";
import { ICipherType } from "./includes/Cipher.interface";
import { NotificationLevel } from "./includes/OperatingSystem.interface";

import { toast } from "solid-toast";
import { Avatar, Card, CardContent, CardHeader, IconButton, LinearProgress } from "@suid/material";
import { Close, ErrorOutline } from "@suid/icons-material";
import { red } from "@suid/material/colors";

const useStore = create<CounterState>((set) => ({
    runningCiphers: [],
    addCipher: (cipher: Cipher) =>
        set((state) => ({ runningCiphers: [...state.runningCiphers, cipher] })),
    removeCipher: (cipher: Cipher) =>
        set((state) => ({
            runningCiphers: state.runningCiphers.filter((c) => c !== cipher),
        })),
    setStation: (station: StationStoreType) => set(() => ({ station })),
    station: null,
}));

const showError = (message: string) => {
    const duration  = 6000
    toast.custom((t) => {
    
      // Start with 100% life
      const [life, setLife] = createSignal(100);
      const startTime = Date.now()
      createEffect(() => {
        if (t.paused) return;
        const interval = setInterval(() => {
          const diff = Date.now() - startTime - t.pauseDuration
          setLife(100 - (diff/duration * 100));
        });
    
        onCleanup(() => clearInterval(interval));
      });
    
      return (
        <>
            <Card>
                <CardHeader
                    title="Error!"
                    subheader={message}
                    action={
                        <IconButton onClick={() => toast.dismiss(t.id)}>
                            <Close />
                        </IconButton>
                    }
                    avatar={
                        <Avatar sx={{ bgcolor: red[500] }}>
                            <ErrorOutline color="inherit" />
                        </Avatar>
                    }
                    titleTypographyProps={{ variant: "h5" }} />
                <CardContent sx={{ paddingTop: 0 }}>
                    <LinearProgress variant="determinate" color="error" value={life()} sx={{ width: "100%", marginTop: '10px' }} />
                </CardContent>
            </Card>
        </>
      )
    }, {
      duration: duration
    })    
}

const StationComponent: Component<{ stationStore?: StationStoreType }> = (
    props,
) => {
    const state = useStore();
    const completeCipher = (cipher: Cipher) => {
        state.removeCipher(cipher);
        stationStore.os.sendNotification(`Cipher '${cipher.cipherType.name}' (${cipher.id}) completed.`, NotificationLevel.INFO);
    };

    const addCipher = (cipherType: ICipherType) => {
        const cssClasses = [
            "breaking-1",
            "breaking-2",
            "breaking-3",
            "breaking-4",
        ];
        try {
            const c = new Cipher(20, 10, cssClasses, cipherType, stationStore);
            state.addCipher(c);
        } catch {
            showError(`Not enough cores available to add process '${cipherType.name}'.`);
            stationStore.os.sendNotification(`Not enough cores available to add process '${cipherType.name}'.`, NotificationLevel.ERROR);
        }
    };

    const { stationStore } = props;
    state.setStation(stationStore);

    return (
        <>
            <div class="card">
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <StationStatistics station={stationStore} />
                    </Grid>
                    <Grid item xs={8}>
                        <CpuActivityWidget
                            stationStore={stationStore}
                            title="CPU Activity"
                        />
                    </Grid>
                </Grid>
            </div>
            <div class="card">
                <Grid container spacing={2}>
                    {(state.runningCiphers.length > 0 &&
                        state.runningCiphers.map((cipher) => (
                            <Grid item xs={4}>
                                <CipherBreak
                                    station={state.station}
                                    width={20}
                                    cipher={cipher}
                                    newCipher={addCipher}
                                    onComplete={completeCipher}
                                />
                            </Grid>
                        ))) || (
                        <Grid item xs={4}>
                            <CipherBreak
                                station={state.station}
                                width={20}
                                newCipher={addCipher}
                            />
                        </Grid>
                    )}
                </Grid>
            </div>
        </>
    );
};

export default StationComponent;
