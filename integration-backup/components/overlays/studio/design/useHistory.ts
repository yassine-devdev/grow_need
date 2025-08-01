import { useState, useCallback, useRef } from 'react';
import { DesignState } from './types';

// A function to compare if two states are different in a meaningful way for history
const statesAreDifferent = (a: DesignState, b: DesignState): boolean => {
    // We only care about pages and selection for history, not zoom/pan
    return JSON.stringify({p: a.pages, s: a.selectedElementIds}) !== JSON.stringify({p: b.pages, s: b.selectedElementIds});
};

export const useHistory = <T extends DesignState>(initialState: T): [T, (newState: T | ((prevState: T) => T), undoable?: boolean) => void, { undo: () => void, redo: () => void, canUndo: boolean, canRedo: boolean }] => {
    const [state, _setState] = useState(initialState);
    const historyRef = useRef<T[]>([initialState]);
    const pointerRef = useRef(0);

    const setState = useCallback((newStateOrFn: T | ((prevState: T) => T), undoable: boolean = true) => {
        _setState(prevState => {
            const newState = typeof newStateOrFn === 'function'
                ? (newStateOrFn as (prevState: T) => T)(prevState)
                : newStateOrFn;
            
            if (undoable && statesAreDifferent(prevState, newState)) {
                const newHistory = historyRef.current.slice(0, pointerRef.current + 1);
                newHistory.push(newState);
                historyRef.current = newHistory;
                pointerRef.current = newHistory.length - 1;
            }
            return newState;
        });
    }, []);

    const undo = useCallback(() => {
        if (pointerRef.current > 0) {
            pointerRef.current -= 1;
            _setState(historyRef.current[pointerRef.current]);
        }
    }, []);

    const redo = useCallback(() => {
        if (pointerRef.current < historyRef.current.length - 1) {
            pointerRef.current += 1;
            _setState(historyRef.current[pointerRef.current]);
        }
    }, []);
    
    return [
        state,
        setState,
        {
            undo,
            redo,
            canUndo: pointerRef.current > 0,
            canRedo: pointerRef.current < historyRef.current.length - 1,
        }
    ];
};