export type LanguageCode = "en" | "es" | "fr" | "hi" | "pt";

export const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "hi", label: "Hindi" },
  { code: "pt", label: "Português" },
];

type Copy = {
  createAccount: string;
  signIn: string;
  email: string;
  password: string;
  haveAccount: string;
  newHere: string;
};

export const TRANSLATIONS: Record<LanguageCode, Copy> = {
  en: {
    createAccount: "Create Account",
    signIn: "Sign In",
    email: "Email",
    password: "Password",
    haveAccount: "Have an account? Sign in",
    newHere: "New here? Create an account",
  },
  es: {
    createAccount: "Crear Cuenta",
    signIn: "Iniciar Sesión",
    email: "Correo electrónico",
    password: "Contraseña",
    haveAccount: "¿Ya tienes cuenta? Inicia sesión",
    newHere: "¿Nuevo aquí? Crea una cuenta",
  },
  fr: {
    createAccount: "Créer un compte",
    signIn: "Se connecter",
    email: "E-mail",
    password: "Mot de passe",
    haveAccount: "Vous avez un compte ? Connectez-vous",
    newHere: "Nouveau ici ? Créez un compte",
  },
  hi: {
    createAccount: "खाता बनाएं",
    signIn: "साइन इन करें",
    email: "ईमेल",
    password: "पासवर्ड",
    haveAccount: "खाता है? साइन इन करें",
    newHere: "यहाँ नए हैं? खाता बनाएं",
  },
  pt: {
    createAccount: "Criar Conta",
    signIn: "Entrar",
    email: "E-mail",
    password: "Senha",
    haveAccount: "Já tem uma conta? Entrar",
    newHere: "Novo aqui? Criar uma conta",
  },
};

export const CHARSETS: Record<LanguageCode, string> = {
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  es: "ÑñÁáÉéÍíÓóÚú¿¡ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  fr: "ÀàÂâÇçÉéÈèÊêËëÎîÏïÔôÛûÙùÜüŸÿŒœÆæABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  hi: "अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहािीुूेैोौंःक्षत्रज्ञ",
  pt: "ÃãÕõÁáÀàÂâÉéÊêÍíÓóÔôÚúÇçABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
};
