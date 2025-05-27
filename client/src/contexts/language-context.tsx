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
    'imprint.address': 'Adresse wird noch hinzugefügt',
    'imprint.contact': 'Kontakt',
    'imprint.email': 'E-Mail: info@modeen.media',
    'imprint.phone': 'Telefon: +49 XXX XXXXXXX',
    'imprint.taxId': 'Umsatzsteuer-ID',
    'imprint.taxIdNumber': 'USt-IdNr.: DE XXXXXXXXX',
    
    // Privacy Policy
    'privacy.section': 'Datenschutzerklärung',
    'privacy.intro': 'Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten.',
    'privacy.dataCollection': 'Datenerfassung',
    'privacy.dataCollectionText': 'Wir erheben und verarbeiten Ihre Daten nur, soweit dies für die Erbringung unserer Dienstleistungen erforderlich ist.',
    'privacy.dataUsage': 'Datenverwendung',
    'privacy.dataUsageText': 'Ihre Daten werden ausschließlich zur Abwicklung Ihrer Bestellungen und zur Verbesserung unseres Services verwendet.',
    'privacy.dataSecurity': 'Datensicherheit',
    'privacy.dataSecurityText': 'Wir verwenden modernste Sicherheitsmaßnahmen, um Ihre Daten vor unbefugtem Zugriff zu schützen.',
    'privacy.cookies': 'Cookies',
    'privacy.cookiesText': 'Unsere Website verwendet Cookies, um Ihnen die bestmögliche Nutzererfahrung zu bieten.',
    'privacy.rights': 'Ihre Rechte',
    'privacy.rightsText': 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten.',
    
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
    'imprint.address': 'Address to be added',
    'imprint.contact': 'Contact',
    'imprint.email': 'Email: info@modeen.media',
    'imprint.phone': 'Phone: +49 XXX XXXXXXX',
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