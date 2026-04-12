import "./App.css";
import { create } from "solid-zustand/store";

import { CounterState } from "./includes/Counter.interface";

import { StationStoreType } from "./includes/Process.interface";
import { Component } from "solid-js";

import CipherBreak from "./components/Widgets/cipherBreak";
import StationStatistics from "./components/StationStatistics";

import Grid from "@suid/material/Grid";

import Cipher from "./lib/Cipher";
import { CpuActivityWidget } from "./components/Widgets/cpuActivity";
import { ICipherType } from "./includes/Cipher.interface";

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

const StationComponent: Component<{ stationStore?: StationStoreType }> = (
    props,
) => {
    const state = useStore();
    const completeCipher = (cipher: Cipher) => {
        state.removeCipher(cipher);
        // Add notification
    };

    const addCipher = (cipherType: ICipherType) => {
        const cssClasses = [
            "breaking-1",
            "breaking-2",
            "breaking-3",
            "breaking-4",
        ];
        const c = new Cipher(20, 10, cssClasses, cipherType, stationStore);
        state.addCipher(c);
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
