import type { StoreApi, UseBoundStore } from 'zustand';

/**
 * Wraps a zustand store so that non-React consumers (game engine classes,
 * constructors, etc.) can read/write state with normal property access.
 * Every property read delegates to store.getState(); every write delegates
 * to store.setState(). This mirrors the behaviour we had with solid-zustand's
 * reactive proxy while keeping the underlying store vanilla React zustand.
 */
export function storeProxy<T extends object>(
    store: UseBoundStore<StoreApi<T>>,
): T {
    return new Proxy({} as T, {
        get(_target, key) {
            const state = store.getState() as Record<PropertyKey, unknown>;
            return state[key];
        },
        set(_target, key, value) {
            store.setState({ [key as string]: value } as Partial<T>);
            return true;
        },
        has(_target, key) {
            return key in (store.getState() as object);
        },
        ownKeys() {
            return Reflect.ownKeys(store.getState() as object);
        },
        getOwnPropertyDescriptor(_target, key) {
            return Reflect.getOwnPropertyDescriptor(
                store.getState() as object,
                key,
            );
        },
    });
}
