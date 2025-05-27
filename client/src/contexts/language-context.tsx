import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "de" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Translation files
const translations = {
  de: {
    // Footer
    "footer.imprint": "Impressum & Datenschutz",
    "footer.copyright": "© {year} modeen.media. Alle Rechte vorbehalten.",
    "footer.madeWith": "Mit ♥ für Kreative weltweit gemacht",
    "footer.tagline": "Premium Audio-Lösungen für Kreative",

    // Imprint page
    "imprint.title": "Impressum & Datenschutzerklärung",
    "imprint.section": "Impressum",
    "imprint.companyInfo": "Angaben gemäß § 5 TMG",
    "imprint.companyName": "modeen.media",
    "imprint.companyOwner": "Maurice Hamerla",
    "imprint.address": "Randersweide 69, 21035 Hamburg",
    "imprint.contact": "Kontakt",
    "imprint.email": "E-Mail: moden.media@gmail.com",
    // 'imprint.phone': 'Telefon: +49 17 XXXXXXX',
    "imprint.taxId": "Umsatzsteuer-ID",
    "imprint.taxIdNumber": "USt-IdNr.: DE XXXXXXXXX",

    // Privacy Policy
    "privacy.section": "Datenschutzerklärung",
    "privacy.intro":
      "Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TMG). In dieser Datenschutzerklärung informieren wir Sie über die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer Website.",
    "privacy.dataCollection": "Verantwortlicher",
    "privacy.dataCollectionText":
      "modeen.media - Maurice Hamerla, Randersweide 69, 21035 Hamburg - moden.media@gmail.com",
    "privacy.dataUsage": "Erhebung und Speicherung personenbezogener Daten",
    "privacy.dataUsageText":
      "Unsere Website selbst erhebt keine personenbezogenen Daten, es sei denn, Sie übermitteln diese aktiv im Rahmen eines Kaufvorgangs. Wenn Sie über unsere Website einen Song kaufen, geben Sie im Rahmen der Bezahlabwicklung bei unserem Zahlungsdienstleister Stripe Ihre Zahlungsdaten sowie in der Regel Ihren Namen und Ihre E-Mail-Adresse an. Diese Daten werden zur Zahlungsabwicklung verarbeitet.",
    "privacy.stripe": "Zahlungsdienstleister Stripe",
    "privacy.stripeText":
      "Zur Zahlungsabwicklung nutzen wir den Anbieter Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland. Stripe verarbeitet Ihre personenbezogenen Daten eigenverantwortlich zur Durchführung der Zahlung. Die Übermittlung erfolgt direkt über das von Stripe eingebettete Bezahlfenster auf unserer Website. Mehr Informationen finden Sie in der Datenschutzerklärung von Stripe: https://stripe.com/de/privacy. Rechtsgrundlage für die Verarbeitung ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren und effizienten Zahlungsvorgang).",

    "privacy.3rdparty": "Keine Weitergabe an Dritte",
    "privacy.3rdpartyText":
      "Eine Weitergabe Ihrer Daten an Dritte erfolgt nicht, mit Ausnahme der Übermittlung an Stripe zur Zahlungsabwicklung sowie ggf. an Steuerberater oder Finanzbehörden im Rahmen der gesetzlichen Verpflichtungen.",
    "privacy.duration": "Dauer der Speicherung",
    "privacy.durationText":
      "Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die Erfüllung des Zwecks notwendig ist, oder wir gesetzlich dazu verpflichtet sind (z.B. steuerliche Aufbewahrungspflichten von 10 Jahren).",
    "privacy.rights": "Ihre Rechte",
    "privacy.rightsText":
      "Sie haben gemäß DSGVO das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten. Bitte wenden Sie sich hierzu an: modeen.media@gmail.com",
    "privacy.ssl": "SSL-Verschlüsselung",
    "privacy.sslText":
      "Unsere Website nutzt aus Sicherheitsgründen eine SSL-Verschlüsselung, um vertrauliche Inhalte (z. B. Zahlungsinformationen) zu schützen.",
    "privacy.changes": "Änderungen dieser Datenschutzerklärung",
    "privacy.changesText":
      "Wir behalten uns vor, diese Datenschutzerklärung gelegentlich anzupassen, um sie an aktuelle rechtliche Anforderungen oder Änderungen unserer Leistungen anzupassen. Die jeweils aktuelle Version finden Sie stets auf dieser Website.",

    // Language toggle
    "language.toggle": "Sprache",
    "language.german": "Deutsch",
    "language.english": "English",
  },
  en: {
    // Footer
    "footer.imprint": "Imprint & Privacy Policy",
    "footer.copyright": "© {year} modeen.media. All rights reserved.",
    "footer.madeWith": "Made with ♥ for creators worldwide",
    "footer.tagline": "Premium audio solutions for creators",

    // Imprint page
    "imprint.title": "Imprint & Privacy Policy",
    "imprint.section": "Imprint",
    "imprint.companyInfo": "Information according to § 5 TMG",
    "imprint.companyName": "modeen.media",
    "imprint.address": "Randersweide 69, 21035 Hamburg",
    "imprint.contact": "Contact",
    "imprint.email": "Email: moden.media@gmail.com",
    // 'imprint.phone': 'Phone: +49 17 XXXXXXX',
    "imprint.taxId": "VAT ID",
    "imprint.taxIdNumber": "VAT ID: DE XXXXXXXXX",

    // Privacy Policy
    "privacy.section": "Privacy Policy",
    "privacy.intro":
      "We take the protection of your personal data very seriously. We therefore process your data exclusively based on the legal provisions (GDPR, TMG). This privacy policy informs you about the most important aspects of data processing on our website.",
    "privacy.dataCollection": "Responsible",
    "privacy.dataCollectionText":
      "modeen.media - Maurice Hamerla, Randersweide 69, 21035 Hamburg - moden.media@gmail.com",
    "privacy.dataUsage": "Collection and Storage of Personal Data",
    "privacy.dataUsageText":
      "Our website does not collect any personal data unless you actively provide it during a purchase. When you buy a song through our website, you enter your payment details (including name and email address) through the payment service provider Stripe. This data is processed by Stripe for the purpose of payment and securely transmitted to us.",
    "privacy.stripe": "Payment Service Provider: Stripe",
    "privacy.stripeText":
      "We use Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Ireland as our payment service provider. Stripe processes your personal data under its own responsibility in order to complete the transaction. Data entry and payment processing are handled via Stripe's embedded checkout system on our site. For more information, see Stripe’s privacy policy: https://stripe.com/privacy. The legal basis for processing is Art. 6 para. 1 lit. b GDPR (performance of a contract) and Art. 6 para. 1 lit. f GDPR (legitimate interest in secure and efficient payment processing).",

    "privacy.3rdparty": "No Data Disclosure to Third Parties",
    "privacy.3rdpartyText":
      "Your data will not be shared with third parties, except where necessary for the payment process (via Stripe) or where required by law (e.g., tax authorities or accountants).",
    "privacy.duration": "Data Retention",
    "privacy.durationText":
      "We retain your personal data only as long as necessary to fulfill the intended purposes or as required by legal retention obligations (e.g., tax records for 10 years).",
    "privacy.rights": "Your Rights",
    "privacy.rightsText":
      "You have the right to access, correct, delete, restirct your data. To exercise your rights, contact: modeen.media@gmail.com",
    "privacy.ssl": "SSL Encryption",
    "privacy.sslText":
      "Our website uses SSL encryption to protect all data transfers, particularly payment details and personal information.",
    "privacy.changes": "Changes to this Privacy Policy",
    "privacy.changesText":
      "We reserve the right to amend this privacy policy to reflect changes in legal requirements or updates to our services. The current version is always available on this website.",

    // Language toggle
    "language.toggle": "Language",
    "language.german": "Deutsch",
    "language.english": "English",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage for saved preference, default to German
    const saved = localStorage.getItem("language") as Language;
    return saved || "de";
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: string): string => {
    const translation =
      translations[language][key as keyof (typeof translations)["de"]];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    // Handle dynamic replacements like {year}
    return translation.replace("{year}", new Date().getFullYear().toString());
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
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
