import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { languageOptions, localTextTranslations, translations } from "./translations";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";
import bn from "./locales/bn.json";
import mr from "./locales/mr.json";
import gu from "./locales/gu.json";
import pa from "./locales/pa.json";
import kn from "./locales/kn.json";
import ml from "./locales/ml.json";
import or from "./locales/or.json";
import ur from "./locales/ur.json";

const localeFiles = { en, hi, ta, te, bn, mr, gu, pa, kn, ml, or, ur };
const storedLanguage = localStorage.getItem("language");
const initialLanguage = languageOptions.some(({ code }) => code === storedLanguage)
  ? storedLanguage
  : "en";

const resources = Object.fromEntries(
  languageOptions.map(({ code }) => [
    code,
    {
      translation: {
        ...(translations[code] || translations.en),
        ...(localTextTranslations[code] || {}),
        ...localeFiles[code],
      },
    },
  ]),
);

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  initImmediate: false,
});

export default i18n;