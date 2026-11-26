import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Text as NativeText, TextInput as NativeInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toKannada } from '../utils/kannada';

const Language = createContext(null);
const key = 'spl-language';

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en');
    const changed = useRef(false);
    useEffect(() => {
        let mounted = true;
        AsyncStorage.getItem(key).then(value => {
            if (mounted && !changed.current && value === 'kn') setLanguage(value);
        }).catch(() => {});
        return () => { mounted = false; };
    }, []);
    function switchLanguage() {
        changed.current = true;
        const next = language === 'en' ? 'kn' : 'en';
        setLanguage(next);
        AsyncStorage.setItem(key, next).catch(() => {});
    }
    const translate = value => language === 'kn' ? toKannada(value) : value;
    return <Language.Provider value={{ language, translate, switchLanguage }}>{children}</Language.Provider>;
}

export const useLanguage = () => useContext(Language);

export function Text({ children, ...props }) {
    const { translate } = useLanguage();
    return <NativeText {...props}>{Array.isArray(children) ? React.Children.map(children, translate) : translate(children)}</NativeText>;
}

export function TextInput(props) {
    const { translate } = useLanguage();
    return <NativeInput {...props} placeholder={translate(props.placeholder)} />;
}