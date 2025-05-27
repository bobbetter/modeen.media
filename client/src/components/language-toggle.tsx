import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-white/60" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
        className="text-sm text-white/80 hover:text-white hover:bg-white/10"
      >
        {language === 'de' ? t('language.english') : t('language.german')}
      </Button>
    </div>
  );
} 