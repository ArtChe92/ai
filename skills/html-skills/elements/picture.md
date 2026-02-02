# picture

## Сценарии использования

Адаптивное изображение — разные версии для разных условий.

**Когда выбрать другой элемент:**

- Одно изображение без адаптации → `img`
- Декоративное изображение → CSS `background-image`

**Примеры использования:**

- Разные форматы (WebP с fallback на JPEG)
- Разные изображения для мобильных/десктопа (art direction)
- Тёмная/светлая тема

## Связанные элементы

| Элемент      | Связь                             |
| ------------ | --------------------------------- |
| `source`     | Дочерний — варианты изображения   |
| `img`        | Обязательно — fallback и alt      |
| `figure`     | Родитель — изображение с подписью |
| `figcaption` | Сосед — подпись к изображению     |

> См. img.md

## Необходимые атрибуты

### Для `picture`

Специфичных атрибутов нет — контейнер для `source` и `img`.

### Для `source` внутри

| Атрибут  | Назначение                        |
| -------- | --------------------------------- |
| `srcset` | Путь к изображению                |
| `type`   | MIME-тип (image/webp, image/avif) |
| `media`  | Media query для art direction     |

### Для `img` внутри (обязательно)

| Атрибут            | Назначение                 |
| ------------------ | -------------------------- |
| `src`              | Fallback изображение       |
| `alt`              | Альтернативный текст       |
| `width` / `height` | Предотвращает сдвиг layout |

⚠️ `img` внутри `picture` обязателен — без него ничего не отобразится.

## Визуальные состояния

Аналогично `img`:

| Состояние | Описание                |
| --------- | ----------------------- |
| `loading` | Плейсхолдер до загрузки |
| `error`   | Fallback при ошибке     |

## Правила доступности

- `alt` указывается на `img`, не на `picture` или `source`
- Все правила `img` применяются к `img` внутри `picture`
- Разные изображения для art direction должны передавать тот же смысл

## SEO

- Поисковики индексируют `img` внутри `picture`
- WebP/AVIF с fallback улучшают скорость → лучше ранжирование
- `alt` и имена файлов учитываются

## Пример

```tsx
{
    /* Современные форматы с fallback */
}
<picture>
    <source srcset="/images/hero.avif" type="image/avif" />
    <source srcset="/images/hero.webp" type="image/webp" />
    <img
        src="/images/hero.jpg"
        alt="Главный баннер — новая коллекция 2026"
        width={1200}
        height={600}
        fetchpriority="high"
    />
</picture>;

{
    /* Art direction — разные изображения для разных экранов */
}
<picture>
    <source srcset="/images/hero-mobile.webp" media="(max-width: 768px)" />
    <source srcset="/images/hero-desktop.webp" media="(min-width: 769px)" />
    <img src="/images/hero-desktop.jpg" alt="Команда за работой" width={1200} height={600} />
</picture>;

{
    /* Тёмная тема */
}
<picture>
    <source srcset="/images/logo-dark.svg" media="(prefers-color-scheme: dark)" />
    <img src="/images/logo-light.svg" alt="Логотип компании" width={120} height={40} />
</picture>;
```
