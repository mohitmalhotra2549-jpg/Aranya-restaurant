import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';

type Language = 'en' | 'hi';

const translations: Record<string, string> = {
  'Welcome to': 'स्वागत है',
  'Explore Menu': 'मेन्यू देखें',
  "Chef's Selections": 'शेफ की पसंद',
  'Our Menu': 'हमारा मेन्यू',
  'Search dishes, ingredients...': 'डिश या सामग्री खोजें...',
  'No dishes found': 'कोई डिश नहीं मिली',
  'Clear filters': 'फ़िल्टर हटाएं',
  'Ready to place order': 'ऑर्डर करने के लिए तैयार',
  'Cart': 'कार्ट',
  'Assist': 'सहायता',
  'Bill': 'बिल',
  'Place order': 'ऑर्डर करें',
  'View in AR': 'AR में देखें',
  'Signature': 'खास डिश',
  'Ingredients': 'सामग्री',
  'Allergens': 'एलर्जी जानकारी',
  'Special instructions': 'विशेष निर्देश',

  'Grilled Sandwich': 'ग्रिल्ड सैंडविच',
  'Chocolate Cake': 'चॉकलेट केक',
  'Pastry': 'पेस्ट्री',
  'Zinger Burger': 'ज़िंगर बर्गर',
  'Kulcha with Bhaji': 'कुलचा विद भाजी',
  'Momos': 'मोमोज़',

  'All': 'सभी',
  'Snacks': 'स्नैक्स',
  'Burgers': 'बर्गर',
  'Indian': 'इंडियन',
  'Desserts': 'मिठाई',
  'Starters': 'स्टार्टर',
  'Mains': 'मुख्य भोजन',
  'Breads': 'ब्रेड',
  'Rice': 'चावल',
  'Beverages': 'पेय',
};

function translatePage() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
  );

  const nodes: Text[] = [];
  let current: Node | null;

  while ((current = walker.nextNode())) {
    nodes.push(current as Text);
  }

  for (const node of nodes) {
    if (node.parentElement?.closest('[data-language-switcher]')) continue;

    const original = node.textContent || '';
    const trimmed = original.trim();

    if (!trimmed) continue;

    let translated = translations[trimmed];

    if (!translated) {
      translated = trimmed
        .replace(/^Table (\d+)$/, 'टेबल $1')
        .replace(/^(\d+) dishes$/, '$1 डिशेज़')
        .replace(/^(\d+) dish$/, '$1 डिश')
        .replace(/^(\d+) min$/, '$1 मिनट')
        .replace(/^Place order ·/, 'ऑर्डर करें ·');
    }

    if (translated !== trimmed) {
      node.textContent = original.replace(trimmed, translated);
    }
  }

  const inputs = document.querySelectorAll<HTMLInputElement>(
    'input[placeholder], textarea[placeholder]',
  );

  inputs.forEach((input) => {
    if (input.placeholder === 'Search dishes, ingredients...') {
      input.placeholder = 'डिश या सामग्री खोजें...';
    }

    if (input.placeholder === 'e.g. less spicy, no onions...') {
      input.placeholder = 'जैसे कम तीखा, प्याज़ नहीं...';
    }
  });
}

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem('aaranya_language') === 'hi'
        ? 'hi'
        : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    if (language !== 'hi') return;

    translatePage();

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(translatePage);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [language]);

  const changeLanguage = () => {
    const next: Language = language === 'en' ? 'hi' : 'en';

    try {
      localStorage.setItem('aaranya_language', next);
    } catch {
      // Ignore storage errors.
    }

    setLanguage(next);

    if (next === 'en') {
      window.location.reload();
    } else {
      window.requestAnimationFrame(translatePage);
    }
  };

  return (
    <button
      type="button"
      data-language-switcher
      onClick={changeLanguage}
      className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[75] flex h-10 items-center gap-2 rounded-xl border border-amber-400/30 bg-[#0a0908]/90 px-3 text-xs font-medium text-amber-100 shadow-xl shadow-black/40 backdrop-blur-xl"
      aria-label="Change language"
    >
      <Languages className="h-4 w-4" />
      {language === 'en' ? 'हिंदी' : 'English'}
    </button>
  );
}
