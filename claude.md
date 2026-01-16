# Claude - Правила добавления калькуляторов

## ⚠️ ПЕРВЫЙ ШАГ: ПРОВЕРИТЬ СУЩЕСТВУЮЩИЕ КАЛЬКУЛЯТОРЫ!

**ПЕРЕД созданием нового калькулятора ОБЯЗАТЕЛЬНО проверь, нет ли уже такого же!**

### Как проверить:

1. **Поиск в файловой системе:**
```bash
ls src/app/financial-calculators/
```

2. **Поиск в категории:**
```bash
grep -i "calculator-name" src/app/financial-calculators/page.tsx
```

3. **Поиск на главной странице:**
```bash
grep -i "calculator-name" src/app/page.tsx
```

**Примеры существующих калькуляторов:**
- amortization, auto-loan, auto-lease, personal-loan, payment
- mortgage, fha-loan, va-loan, heloc, home-equity-loan
- investment, compound-interest, savings, retirement, 401k
- tax, salary, marriage, estate-tax, take-home-pay
- loan, roth-ira, ira, rmd
- И другие...

**Если калькулятор уже существует - НЕ создавай дубликат!**

---

## ВАЖНО! Каждый калькулятор добавляется В ДВА МЕСТА:

### 1. На главную страницу (архив калькуляторов)
**Путь:** `/src/app/page.tsx`

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

1. **page.tsx** - основная страница калькулятора (ОБЯЗАТЕЛЬНО по шаблону!)
2. **layout.tsx** - layout с метаданными (SEO)
3. **calculations.ts** - логика расчетов
4. **__tests__/calculations.test.ts** - тесты для расчетов

## ВАЖНО! СТАНДАРТНЫЙ ШАБЛОН UI

### Эталонный пример: `/src/app/financial-calculators/roth-ira-calculator/page.tsx`

**ВСЕГДА используй эту структуру для page.tsx:**

### 1. Hero Section
```tsx
<section className="relative pt-24 pb-6 lg:pt-28 lg:pb-8">
  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <Link href="/financial-calculators" className="...">Back to Calculators</Link>

    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-color-600 to-color-600 flex items-center justify-center shadow-lg">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            Calculator Title
          </h1>
          <p className="text-lg text-gray-600 mt-2">Description</p>
        </div>
      </div>
    </motion.div>
  </div>
</section>
```

### 2. Calculator Section - ДВЕ КОЛОНКИ (40% / 60%)
```tsx
<section className="pb-8 lg:pb-12">
  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div className="grid lg:grid-cols-[40%_60%] gap-8">

      {/* LEFT COLUMN - INPUT FORMS */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Section Title</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Field Label
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                placeholder="Placeholder"
              />
            </div>
          </div>
        </div>

      </motion.div>

      {/* RIGHT COLUMN - RESULTS */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

        {/* Main Result Card */}
        <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-color-600 to-color-600">
          <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
            <Icon className="w-4 h-4" />
            Result Label
          </div>
          <div className="text-5xl font-bold mb-2">$123,456</div>
          <div className="text-sm opacity-75 mb-6">Additional info</div>
        </div>

        {/* Additional Results */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Results Title</h3>
          {/* Content */}
        </div>

      </motion.div>

    </div>
  </div>
</section>
```

### 3. Educational Section - Understanding (ВАЖНО ДЛЯ SEO!)

**ОБЯЗАТЕЛЬНО делай раздел "Understanding" подробным и детальным!**

Это КРИТИЧЕСКИ важно для SEO и органического поиска. Раздел должен содержать:

1. **Что это такое** - определение термина/концепции
2. **Типы/виды** - различные варианты (если применимо)
3. **Как рассчитывать** - формулы и методы расчета
4. **Примеры из реальной жизни** - конкретные сценарии использования
5. **Дополнительная информация** - стратегии, советы, важные нюансы
6. **Практические советы** - как применять на практике

Минимум 4-6 подразделов с детальными объяснениями!

```tsx
<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
  <h3 className="text-xl font-bold text-gray-900 mb-4">
    Understanding [Topic]: A Complete Guide
  </h3>

  <div className="space-y-4 text-sm text-gray-700">
    <div>
      <h4 className="font-semibold text-gray-900 mb-2">
        What is [Topic]?
      </h4>
      <p>
        Детальное объяснение концепции...
      </p>
    </div>

    <div>
      <h4 className="font-semibold text-gray-900 mb-2">
        Types of [Topic]
      </h4>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li><span className="font-semibold">Type 1:</span> Description...</li>
        <li><span className="font-semibold">Type 2:</span> Description...</li>
      </ul>
    </div>

    <div>
      <h4 className="font-semibold text-gray-900 mb-2">
        How to Calculate
      </h4>
      <p className="mb-2">Explanation...</p>
      <div className="bg-white rounded-lg p-4">
        <p className="font-mono text-xs">
          Formula 1: ...
        </p>
      </div>
    </div>

    <div>
      <h4 className="font-semibold text-gray-900 mb-2">
        Real-World Examples
      </h4>
      <div className="space-y-2">
        <div className="bg-white rounded-lg p-3">
          <p className="font-semibold text-xs mb-1">Example 1: ...</p>
          <p className="text-xs">Detailed scenario...</p>
        </div>
      </div>
    </div>

    <div>
      <h4 className="font-semibold text-gray-900 mb-2">
        Tips & Strategies
      </h4>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>Practical tip 1...</li>
        <li>Practical tip 2...</li>
      </ul>
    </div>
  </div>
</div>
```

**Пример хорошего Understanding раздела:** `/src/app/financial-calculators/discount-calculator/page.tsx`

### Стилизация элементов:

**Белые карточки:**
```tsx
className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
```

**Инпуты:**
```tsx
className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
```

**Лейблы:**
```tsx
className="block text-sm font-semibold text-gray-700 mb-2"
```

**Градиентная карточка результата:**
```tsx
className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-purple-600 to-indigo-600"
```

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
- [ ] Добавлен на главную страницу (/ - src/app/page.tsx)
- [ ] Добавлен в /financial-calculators/page.tsx (или другую категорию)
- [ ] Проверены все мета поля (title, description, keywords)
- [ ] Выбран подходящий градиент и иконка
- [ ] Протестированы расчеты

## Пример полного цикла добавления:

1. Реализовать калькулятор в `/financial-calculators/calculator-name/`
2. Добавить на главную страницу `/` (src/app/page.tsx) в массив calculators
3. Добавить в `/financial-calculators/page.tsx` как CalculatorCard
4. Создать layout.tsx с метаданными
5. Написать тесты
6. Проверить что калькулятор отображается в обоих местах

## ЗАПОМНИ:

**ВСЕГДА добавлять калькулятор И на главную (/) И в категорию!**
Без этого калькулятор не будет виден на главной странице и в категории.
