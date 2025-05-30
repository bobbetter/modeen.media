import { useLanguage } from "@/contexts/language-context";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Imprint() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <span className="text-xl font-light tracking-tight text-gray-800 hover:text-primary transition-colors cursor-pointer">
                mo<span className="font-bold">deen</span>
                <span className="text-primary font-light">.media</span>
              </span>
            </Link>

            {/* Language Toggle */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-600" />
              <Button
                size="sm"
                onClick={() => setLanguage(language === "de" ? "en" : "de")}
                className="text-sm"
              >
                {language === "de"
                  ? t("language.english")
                  : t("language.german")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-light text-gray-900 mb-12 text-center">
          {t("imprint.title")}
        </h1>

        <div className="space-y-12">
          {/* Imprint Section */}
          <section className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("imprint.section")}
            </h2>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("imprint.companyInfo")}
                </h3>
                <p className="leading-relaxed">
                  {t("imprint.companyName")}
                  <br />
                  {t("imprint.address")}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("imprint.contact")}
                </h3>
                <p className="leading-relaxed">
                  {t("imprint.email")}
                  <br />
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("imprint.taxId")}
                </h3>
                <p className="leading-relaxed">{t("imprint.taxIdNumber")}</p>
              </div>
            </div>
          </section>

          {/* Privacy Policy Section */}
          <section className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("privacy.section")}
            </h2>

            <div className="space-y-6 text-gray-700">
              <p className="leading-relaxed">{t("privacy.intro")}</p>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  1. {t("privacy.dataCollection")}
                </h3>
                <p className="leading-relaxed">
                  {t("privacy.dataCollectionText")}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  2. {t("privacy.dataUsage")}
                </h3>
                <p className="leading-relaxed">{t("privacy.dataUsageText")}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  3. {t("privacy.stripe")}
                </h3>
                <p className="leading-relaxed">{t("privacy.stripeText")}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  4. {t("privacy.3rdparty")}
                </h3>
                <p className="leading-relaxed">{t("privacy.3rdpartyText")}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  5. {t("privacy.duration")}
                </h3>
                <p className="leading-relaxed">{t("privacy.durationText")}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  6. {t("privacy.rights")}
                </h3>
                <p className="leading-relaxed">{t("privacy.rightsText")}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  7. {t("privacy.ssl")}
                </h3>
                <p className="leading-relaxed">{t("privacy.sslText")}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  8. {t("privacy.changes")}
                </h3>
                <p className="leading-relaxed">{t("privacy.changesText")}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Back to Home Button */}
        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="outline" size="lg">
              ←{" "}
              {language === "de" ? "Zurück zur Startseite" : "Back to Homepage"}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
