import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supportedLanguages, type SupportedLanguage } from '../../i18n';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage =
    supportedLanguages.find(lang => lang.code === i18n.language) ||
    supportedLanguages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          data-testid="language-switcher-trigger"
        >
          <span>{currentLanguage.flag}</span>
          <span className="flex-1 text-left">{currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="space-y-2"
        data-testid="language-switcher-menu"
      >
        {supportedLanguages.map(language => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={i18n.language === language.code ? 'bg-accent' : ''}
            data-testid={`language-option-${language.code}`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
