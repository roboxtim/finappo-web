# Claude - Правила добавления калькуляторов

## ВАЖНО! Каждый калькулятор добавляется В ДВА МЕСТА:

### 1. В основной архив калькуляторов
**Путь:** `/src/app/calculators/page.tsx`

Добавить в массив `calculators` в соответствующей категории:
```typescript
{
  id: 'calculator-slug',
  title: 'Calculator Title',
  description: 'Description of the calculator',
  href: '/financial-calculators/calculator-slug',
  icon: <IconComponent className="w-5 h-5" />,
  keywords: ['keyword1', 'keyword2', 'keyword3'],
}
```

### 2. В категорийную страницу
**Путь:** `/src/app/financial-calculators/page.tsx` (или другая категория)

Добавить компонент `<CalculatorCard />` в секцию с калькуляторами:
```tsx
<CalculatorCard
  icon={<IconComponent className="w-8 h-8 text-white" />}
  title="Calculator Title"
  description="Full description of what the calculator does"
  gradient="bg-gradient-to-br from-color-600 to-color-600"
  href="/financial-calculators/calculator-slug"
  delay={0}
/>
```

## Структура каждого калькулятора

### Обязательные файлы:

1. **page.tsx** - основная страница калькулятора
2. **layout.tsx** - layout с метаданными (SEO)
3. **calculations.ts** - логика расчетов
4. **__tests__/calculations.test.ts** - тесты для расчетов

### Layout.tsx - Обязательная структура:

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculator Name - Description | Finappo',
  description: 'Detailed description with keywords for SEO (150-160 characters)',
  keywords: 'keyword1, keyword2, keyword3, keyword4, ...',
  openGraph: {
    title: 'Calculator Name - Short Description',
    description: 'Description for social sharing',
    url: 'https://finappo.com/financial-calculators/calculator-slug',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-calculator-slug.png',
        width: 1200,
        height: 630,
        alt: 'Calculator Name',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculator Name - Description',
    description: 'Short description for Twitter',
    images: ['https://finappo.com/og-calculator-slug.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/calculator-slug',
  },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

### Важные поля метаданных:

1. **title** - Полное название калькулятора с брендом
2. **description** - Детальное описание (150-160 символов)
3. **keywords** - Список ключевых слов через запятую (10-20 слов)
4. **openGraph** - Данные для социальных сетей
5. **twitter** - Данные для Twitter
6. **alternates.canonical** - Канонический URL

## Градиенты для иконок (используемые цвета):

- Blue/Indigo: `bg-gradient-to-br from-blue-600 to-indigo-600`
- Green/Emerald: `bg-gradient-to-br from-green-600 to-emerald-600`
- Purple/Pink: `bg-gradient-to-br from-purple-600 to-pink-600`
- Teal/Cyan: `bg-gradient-to-br from-teal-600 to-cyan-600`
- Orange/Red: `bg-gradient-to-br from-orange-600 to-red-600`

## Иконки (из lucide-react):

Часто используемые:
- `Shield` - для пенсий, страхования, Social Security, Roth IRA
- `Calculator` - общие финансовые калькуляторы
- `TrendingUp` - инвестиции, рост
- `PiggyBank` - сбережения, 401k
- `Home` - ипотека, недвижимость
- `Car` - автокредиты
- `Landmark` - пенсии, аннуитеты
- `Percent` - проценты, ставки

## Checklist при добавлении калькулятора:

- [ ] Создан файл page.tsx
- [ ] Создан файл layout.tsx с полными метаданными
- [ ] Создан файл calculations.ts
- [ ] Созданы тесты __tests__/calculations.test.ts
- [ ] Добавлен в /calculators/page.tsx
- [ ] Добавлен в /financial-calculators/page.tsx (или другую категорию)
- [ ] Проверены все мета поля (title, description, keywords)
- [ ] Выбран подходящий градиент и иконка
- [ ] Протестированы расчеты

## Пример полного цикла добавления:

1. Реализовать калькулятор в `/financial-calculators/calculator-name/`
2. Добавить в `/calculators/page.tsx` в массив calculators
3. Добавить в `/financial-calculators/page.tsx` как CalculatorCard
4. Создать layout.tsx с метаданными
5. Написать тесты
6. Проверить что калькулятор отображается в обоих местах

## ЗАПОМНИ:

**ВСЕГДА добавлять калькулятор И в /calculators И в категорию!**
Без этого калькулятор не будет виден в поиске и архиве.
