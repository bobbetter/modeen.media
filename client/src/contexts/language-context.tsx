import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation files
const translations = {
  de: {
    // Footer
    'footer.imprint': 'Impressum & Datenschutz',
    'footer.copyright': '© {year} modeen.media. Alle Rechte vorbehalten.',
    'footer.madeWith': 'Mit ♥ für Kreative weltweit gemacht',
    'footer.tagline': 'Premium Audio-Lösungen für Kreative',
    
    // Imprint page
    'imprint.title': 'Impressum & Datenschutzerklärung',
    'imprint.section': 'Impressum',
    'imprint.companyInfo': 'Angaben gemäß § 5 TMG',
    'imprint.companyName': 'modeen.media',
    'imprint.companyOwner': 'Maurice Hamerla',
    'imprint.address': 'Randersweide 69, 21035 Hamburg',
    'imprint.contact': 'Kontakt',
    'imprint.email': 'E-Mail: moden.media@gmail.com',
    // 'imprint.phone': 'Telefon: +49 17 XXXXXXX',
    'imprint.taxId': 'Umsatzsteuer-ID',
    'imprint.taxIdNumber': 'USt-IdNr.: DE XXXXXXXXX',
    
    // Privacy Policy
    'privacy.section': 'Datenschutzerklärung',
    'privacy.intro': 'Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TMG). In dieser Datenschutzerklärung informieren wir Sie über die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer Website.',
    'privacy.dataCollection': 'Verantwortlicher',
    'privacy.dataCollectionText': 'modeen.media - Maurice Hamerla, Randersweide 69, 21035 Hamburg - moden.media@gmail.com',
    'privacy.dataUsage': 'Erhebung und Speicherung personenbezogener Daten',
    'privacy.dataUsageText': 'Unsere Website selbst erhebt keine personenbezogenen Daten, es sei denn, Sie übermitteln diese aktiv im Rahmen eines Kaufvorgangs. Wenn Sie über unsere Website einen Song kaufen, geben Sie im Rahmen der Bezahlabwicklung bei unserem Zahlungsdienstleister Stripe Ihre Zahlungsdaten sowie in der Regel Ihren Namen und Ihre E-Mail-Adresse an. Diese Daten werden zur Zahlungsabwicklung verarbeitet.',
    'privacy.stripe': 'Zahlungsdienstleister Stripe',
    'privacy.stripeText': 'Zur Zahlungsabwicklung nutzen wir den Anbieter Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland. Stripe verarbeitet Ihre personenbezogenen Daten eigenverantwortlich zur Durchführung der Zahlung. Die Übermittlung erfolgt direkt über das von Stripe eingebettete Bezahlfenster auf unserer Website. Mehr Informationen finden Sie in der Datenschutzerklärung von Stripe:👉 https://stripe.com/de/privacy. Rechtsgrundlage für die Verarbeitung ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren und effizienten Zahlungsvorgang).',

    'privacy.3rdparty': 'Keine Weitergabe an Dritte',
    'privacy.3rdpartyText': 'Eine Weitergabe Ihrer Daten an Dritte erfolgt nicht, mit Ausnahme der Übermittlung an Stripe zur Zahlungsabwicklung sowie ggf. an Steuerberater oder Finanzbehörden im Rahmen der gesetzlichen Verpflichtungen.',
    'privacy.duration': 'Dauer der Speicherung',
    'privacy.durationText': 'Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die Erfüllung des Zwecks notwendig ist, oder wir gesetzlich dazu verpflichtet sind (z.B. steuerliche Aufbewahrungspflichten von 10 Jahren).',  
    'privacy.rights': 'Ihre Rechte',
    'privacy.rightsText': 'Sie haben gemäß DSGVO das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten. Bitte wenden Sie sich hierzu an: modeen.media@gmail.com',
    
    // Language toggle
    'language.toggle': 'Sprache',
    'language.german': 'Deutsch',
    'language.english': 'English',
  },
  en: {
    // Footer
    'footer.imprint': 'Imprint & Privacy Policy',
    'footer.copyright': '© {year} modeen.media. All rights reserved.',
    'footer.madeWith': 'Made with ♥ for creators worldwide',
    'footer.tagline': 'Premium audio solutions for creators',
    
    // Imprint page
    'imprint.title': 'Imprint & Privacy Policy',
    'imprint.section': 'Imprint',
    'imprint.companyInfo': 'Information according to § 5 TMG',
    'imprint.companyName': 'modeen.media',
    'imprint.address': 'Randersweide 69, 21035 Hamburg',
    'imprint.contact': 'Contact',
    'imprint.email': 'Email: moden.media@gmail.com',
    // 'imprint.phone': 'Phone: +49 17 XXXXXXX',
    'imprint.taxId': 'VAT ID',
    'imprint.taxIdNumber': 'VAT ID: DE XXXXXXXXX',
    
    // Privacy Policy
    'privacy.section': 'Privacy Policy',
    'privacy.intro': 'We take the protection of your personal data very seriously. This privacy policy informs you about the type, scope and purpose of processing personal data.',
    'privacy.dataCollection': 'Data Collection',
    'privacy.dataCollectionText': 'We collect and process your data only to the extent necessary to provide our services.',
    'privacy.dataUsage': 'Data Usage',
    'privacy.dataUsageText': 'Your data is used exclusively for processing your orders and improving our service.',
    'privacy.dataSecurity': 'Data Security',
    'privacy.dataSecurityText': 'We use state-of-the-art security measures to protect your data from unauthorized access.',
    'privacy.cookies': 'Cookies',
    'privacy.cookiesText': 'Our website uses cookies to provide you with the best possible user experience.',
    'privacy.rights': 'Your Rights',
    'privacy.rightsText': 'You have the right to information, correction, deletion and restriction of processing of your personal data.',
    
    // Language toggle
    'language.toggle': 'Language',
    'language.german': 'Deutsch',
    'language.english': 'English',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage for saved preference, default to German
    const saved = localStorage.getItem('language') as Language;
    return saved || 'de';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations['de']];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    // Handle dynamic replacements like {year}
    return translation.replace('{year}', new Date().getFullYear().toString());
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 