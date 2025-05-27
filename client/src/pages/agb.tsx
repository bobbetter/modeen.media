import { useLanguage } from "@/contexts/language-context";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AGB() {
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
                variant="ghost"
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
          {t("agb.title")}
        </h1>

        <div className="space-y-12">
          {/* AGB Section */}
          <section className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("agb.section")}
            </h2>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("agb.scope.title")}
                </h3>
                <p className="leading-relaxed">{t("agb.scope.text")}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("agb.subject.title")}
                </h3>
                <p className="leading-relaxed">{t("agb.subject.text")}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("agb.contract.title")}
                </h3>
                <p className="leading-relaxed">{t("agb.contract.text")}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("agb.prices.title")}
                </h3>
                <p className="leading-relaxed">{t("agb.prices.text")}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("agb.payment.title")}
                </h3>
                <p className="leading-relaxed">{t("agb.payment.text")}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("agb.delivery.title")}
                </h3>
                <p className="leading-relaxed">{t("agb.delivery.text")}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("agb.rights.title")}
                </h3>
                <p className="leading-relaxed">{t("agb.rights.text")}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("agb.withdrawal.title")}
                </h3>
                <p className="leading-relaxed">{t("agb.withdrawal.text")}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("agb.liability.title")}
                </h3>
                <p className="leading-relaxed">{t("agb.liability.text")}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("agb.final.title")}
                </h3>
                <p className="leading-relaxed">{t("agb.final.text")}</p>
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