# Finappo Web - Development Guide

## Best Practices & Code Standards

### 1. Navigation Links

**ВАЖНО:** Всегда используйте компонент `<Link>` из `next/link` для внутренних ссылок вместо обычных `<a>` тегов.

✅ **Правильно:**
```tsx
import Link from 'next/link';

<Link href="/about" className="...">About</Link>
<Link href="/#features">Features</Link>
```

❌ **Неправильно:**
```tsx
<a href="/about">About</a>
<a href="/#features">Features</a>
```

**Исключение:** Используйте `<a>` только для внешних ссылок:
```tsx
<a href="https://external-site.com" target="_blank" rel="noopener noreferrer">
  External Link
</a>
```

### 2. Автоматическая Проверка Кода

Проект настроен на автоматическую проверку кода перед каждым коммитом:

- **ESLint** - проверяет правила Next.js и TypeScript
- **Prettier** - автоматически форматирует код
- **Husky** - запускает проверки перед коммитом
- **lint-staged** - проверяет только измененные файлы

### 3. Доступные Команды

```bash
# Запуск dev сервера
npm run dev

# Проверка линтера
npm run lint

# Сборка проекта (включает проверку типов и линтера)
npm run build

# Проверка типов TypeScript
npm run check

# Деплой на Cloudflare
npm run deploy
```

### 4. Структура Проекта

```
finappo-web/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Главная страница
│   │   ├── financial-calculators/  # Страница калькуляторов
│   │   └── privacy/      # Privacy страница
│   ├── components/       # React компоненты
│   │   ├── Navigation.tsx
│   │   └── landing/      # Landing page компоненты
│   └── lib/             # Утилиты и хелперы
│       ├── firebase/    # Firebase конфигурация
│       └── stores/      # Zustand stores
├── public/              # Статические файлы
└── .husky/             # Git hooks
```

### 5. Git Workflow

При каждом коммите автоматически:
1. Запускается ESLint на измененных файлах
2. Prettier форматирует код
3. Если есть ошибки - коммит будет отменен

**Ручная проверка перед коммитом:**
```bash
npm run lint
```

### 6. Компоненты

#### Navigation
- Используется на всех страницах
- Автоматически подсвечивает активную страницу
- Адаптивное меню для мобильных

#### CalculatorCard
- Для отображения калькуляторов на странице /financial-calculators
- Поддерживает анимации и hover-эффекты

### 7. Стилизация

- **Tailwind CSS** - основной фреймворк
- **Framer Motion** - для анимаций
- Цвета: gradient from-blue-600 to-cyan-600
- Rounded corners: rounded-2xl, rounded-3xl

### 8. App Store Link

Официальная ссылка на приложение:
```
https://apps.apple.com/us/app/finappo/id6754455387
```

Используется в:
- AppStoreButton компонент
- Главная страница (секция Download)
- Страница Financial Calculators

### 9. Проверка Перед Production Build

Перед деплоем на Cloudflare автоматически выполняется:
- Type checking (TypeScript)
- ESLint проверка
- Production build

Если есть ошибки - деплой будет остановлен.

### 10. Troubleshooting

**Ошибка: "Do not use an `<a>` element to navigate..."**
- Замените `<a>` на `<Link>` из `next/link`

**Pre-commit hook не работает:**
```bash
npx husky install
```

**Prettier конфликтует с форматированием:**
- Проверьте настройки редактора
- Используйте `.prettierrc` конфигурацию проекта
