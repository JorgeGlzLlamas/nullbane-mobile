// services/i18n.ts
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Importa tus archivos JSON
import es from '../locales/es.json';
import en from '../locales/en.json';

const resources = {
  en: en,
  es: es,
};

i18next
  .use(initReactI18next) // Pasa i18next a react-i18next
  .init({
    resources,
    lng: 'es',
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    ns: ['common', 'tabs', 'login', 'home', 'profile', 'info-profile', 'chats', 'change_password', 'post', "achievements"],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;