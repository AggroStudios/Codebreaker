import {
    createContext,
    useContext,
    useRef,
    type MutableRefObject,
    type ReactNode,
} from 'react';

type AnchorsContextValue = {
    moneyAnchorRef: MutableRefObject<HTMLElement | null>;
    xpAnchorRef: MutableRefObject<HTMLElement | null>;
};

const AnchorsContext = createContext<AnchorsContextValue | null>(null);

export function AnchorsProvider({ children }: { children: ReactNode }) {
    const moneyAnchorRef = useRef<HTMLElement | null>(null);
    const xpAnchorRef = useRef<HTMLElement | null>(null);
    const value = { moneyAnchorRef, xpAnchorRef };
    return (
        <AnchorsContext.Provider value={value}>
            {children}
        </AnchorsContext.Provider>
    );
}

export function useAnchors() {
    const ctx = useContext(AnchorsContext);
    if (!ctx) {
        throw new Error('useAnchors must be used within AnchorsProvider');
    }
    return ctx;
}
