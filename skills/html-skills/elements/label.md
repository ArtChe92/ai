# label

## Сценарии использования

Подпись к полю формы.

**Когда выбрать другой элемент:**

- Подсказка формата ввода → `placeholder` или отдельный `span`
- Описание ошибки → `span` с `aria-describedby`

## Связанные элементы

| Элемент    | Связь                    |
| ---------- | ------------------------ |
| `input`    | Обязательно — связанное поле |
| `textarea` | Обязательно — связанное поле |
| `select`   | Обязательно — связанное поле |

> См. input.md, textarea.md

## Необходимые атрибуты

### По ситуации

| Атрибут   | Когда                                      |
| --------- | ------------------------------------------ |
| `htmlFor` | Связь с полем по `id` (если не оборачивает) |

**Два способа связи:**

```tsx
{/* Через htmlFor */}
<label htmlFor="email">Email</label>
<input id="email" type="email" />

{/* Через оборачивание */}
<label>
    Email
    <input type="email" />
</label>
```

⚠️ Предпочтительнее `htmlFor` + `id` — работает надёжнее с assistive technologies.

## Визуальные состояния

| Состояние  | Описание                                |
| ---------- | --------------------------------------- |
| `default`  | Базовый вид                             |
| `disabled` | Поле неактивно — сниженный контраст     |
| `error`    | Поле с ошибкой — цвет ошибки            |
| `required` | Обязательное поле — индикатор (звёздочка) |

## Правила доступности

- Каждое поле формы должно иметь `label`
- `placeholder` — не замена `label`
- Клик по `label` фокусирует связанное поле
- Обязательные поля → визуальный индикатор + `aria-hidden` на декоративном символе

## SEO

Не влияет напрямую.

## Пример

```tsx
<div className="field">
    <label htmlFor="email">
        Email <span aria-hidden="true">*</span>
    </label>
    
    <input
        id="email"
        name="email"
        type="email"
        required
        aria-describedby="email-hint"
    />
    
    <span id="email-hint" className="hint">
        Например: user@example.com
    </span>
</div>
```
