import "./App.css";
import { create } from "solid-zustand/store";

import { CounterState } from "./includes/Counter.interface";

import { StationStoreType } from "./includes/Process.interface";
import { Component, createEffect, createSignal, onCleanup } from "solid-js";

import CipherBreak, { CipherBreakFunctions } from "./components/Widgets/cipherBreak";
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
    updateCipher: (oldCipher: Cipher, newCipher: Cipher) =>
        set((state) => {
            const oldIndex = state.runningCiphers.indexOf(oldCipher);
            if (oldIndex === -1) {
                return state;
            }
            return ({
                runningCiphers: [
                    ...state.runningCiphers.slice(0, oldIndex),
                    newCipher,
                    ...state.runningCiphers.slice(oldIndex + 1),
                ],
            })
        }),
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

const cssClasses = [
    "breaking-1",
    "breaking-2",
    "breaking-3",
    "breaking-4",
];

const StationComponent: Component<{ stationStore?: StationStoreType }> = (
    props,
) => {
    const state = useStore();
    const completeCipher = (cipher: Cipher, cancelled: boolean) => {
        console.log('Complete cipher callback called!');
        stationStore.os.sendNotification(`Cipher '${cipher.cipherType.name}' (${cipher.id}) ${cancelled ? 'cancelled' : 'completed'}.`, (cancelled ? NotificationLevel.ERROR : NotificationLevel.INFO));
    };

    const removeCipher = (cipher: Cipher) => {
        state.removeCipher(cipher);
    };

    const addCipher = (cipherType: ICipherType) => {
        try {
            const c = new Cipher(20, 10, cssClasses, cipherType, stationStore);
            state.addCipher(c);
        } catch {
            showError(`Not enough cores available to add process '${cipherType.name}'.`);
            stationStore.os.sendNotification(`Not enough cores available to add process '${cipherType.name}'.`, NotificationLevel.ERROR);
        }
    };

    const updateCipher = (cipher: Cipher) => {
        const newCipher = new Cipher(20, 10, cssClasses, cipher.cipherType, stationStore);
        state.updateCipher(cipher, newCipher);
    };

    const { stationStore } = props;
    state.setStation(stationStore);

    const functions: CipherBreakFunctions = {
        newCipher: addCipher,
        onComplete: completeCipher,
        removeCipher: removeCipher,
        updateCipher: updateCipher,
    };

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
                                <CipherBreak station={state.station} width={20} cipher={cipher} functions={functions} />
                            </Grid>
                        ))
                    )}
                    <Grid item xs={4}>
                        <CipherBreak
                            station={state.station}
                            width={20}
                            functions={functions}
                        />
                    </Grid>
                </Grid>
            </div>
        </>
    );
};

export default StationComponent;
