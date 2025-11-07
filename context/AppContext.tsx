import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import { Token } from '../types';
import { INITIAL_LOCATIONS, INITIAL_MEAL_TYPES, INITIAL_MEAL_PRICES, COMMON_FREE_REASONS } from '../constants';

interface AppState {
    tokens: Token[];
    locations: string[];
    mealTypes: string[];
    mealPrices: Record<string, number>;
    commonFreeReasons: string[];
}

type Action =
    | { type: 'ADD_TOKEN'; payload: Token }
    | { type: 'UPDATE_TOKEN'; payload: Token }
    | { type: 'DELETE_TOKEN'; payload: string } // id
    | { type: 'ADD_LOCATION'; payload: string }
    | { type: 'DELETE_LOCATION'; payload: string }
    | { type: 'ADD_MEAL_TYPE'; payload: { name: string; price: number } }
    | { type: 'DELETE_MEAL_TYPE'; payload: string }
    | { type: 'UPDATE_MEAL_PRICE'; payload: { name: string; price: number } }
    | { type: 'ADD_FREE_REASON'; payload: string }
    | { type: 'DELETE_FREE_REASON'; payload: string }
    | { type: 'SET_STATE_FROM_STORAGE'; payload: AppState };

const initialState: AppState = {
    tokens: [],
    locations: INITIAL_LOCATIONS,
    mealTypes: INITIAL_MEAL_TYPES,
    mealPrices: INITIAL_MEAL_PRICES,
    commonFreeReasons: COMMON_FREE_REASONS,
};

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'ADD_TOKEN':
            return { ...state, tokens: [...state.tokens, action.payload] };
        case 'UPDATE_TOKEN':
            return {
                ...state,
                tokens: state.tokens.map(token =>
                    token.id === action.payload.id ? action.payload : token
                ),
            };
        case 'DELETE_TOKEN':
            return {
                ...state,
                tokens: state.tokens.filter(token => token.id !== action.payload),
            };
        case 'ADD_LOCATION':
             if (state.locations.includes(action.payload)) return state;
            return { ...state, locations: [...state.locations, action.payload] };
        case 'DELETE_LOCATION':
            return {
                ...state,
                locations: state.locations.filter(loc => loc !== action.payload),
            };
        case 'ADD_MEAL_TYPE':
            if (state.mealTypes.find(mt => mt.toLowerCase() === action.payload.name.toLowerCase())) return state;
            return {
                ...state,
                mealTypes: [...state.mealTypes, action.payload.name].sort(),
                mealPrices: { ...state.mealPrices, [action.payload.name]: action.payload.price },
            };
        case 'DELETE_MEAL_TYPE': {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [action.payload]: _, ...remainingPrices } = state.mealPrices;
            return {
                ...state,
                mealTypes: state.mealTypes.filter(mt => mt !== action.payload),
                mealPrices: remainingPrices,
            };
        }
        case 'UPDATE_MEAL_PRICE':
            return {
                ...state,
                mealPrices: { ...state.mealPrices, [action.payload.name]: action.payload.price },
            };
        case 'ADD_FREE_REASON':
            if (state.commonFreeReasons.find(r => r.toLowerCase() === action.payload.toLowerCase())) return state;
            return { ...state, commonFreeReasons: [...state.commonFreeReasons, action.payload].sort() };
        case 'DELETE_FREE_REASON':
            return {
                ...state,
                commonFreeReasons: state.commonFreeReasons.filter(r => r !== action.payload),
            };
        case 'SET_STATE_FROM_STORAGE':
            return action.payload;
        default:
            return state;
    }
};

const AppContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<Action>;
}>({
    state: initialState,
    dispatch: () => null,
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        try {
            const storedState = localStorage.getItem('foodTokenAppState');
            if (storedState) {
                const parsedState = JSON.parse(storedState);
                
                // Ensure defaults for all state properties
                const validatedState = {
                    tokens: parsedState.tokens || [],
                    locations: parsedState.locations?.length ? parsedState.locations : INITIAL_LOCATIONS,
                    mealTypes: parsedState.mealTypes?.length ? parsedState.mealTypes : INITIAL_MEAL_TYPES,
                    mealPrices: parsedState.mealPrices && Object.keys(parsedState.mealPrices).length ? parsedState.mealPrices : INITIAL_MEAL_PRICES,
                    commonFreeReasons: parsedState.commonFreeReasons?.length ? parsedState.commonFreeReasons : COMMON_FREE_REASONS,
                };

                dispatch({ type: 'SET_STATE_FROM_STORAGE', payload: validatedState });
            }
        } catch (error) {
            console.error('Could not load state from localStorage', error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('foodTokenAppState', JSON.stringify(state));
        } catch (error) {
            console.error('Could not save state to localStorage', error);
        }
    }, [state]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);