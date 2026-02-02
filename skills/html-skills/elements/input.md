# input

## Сценарии использования

Однострочный ввод данных.

**Когда выбрать другой элемент:**

- Многострочный текст → `textarea`
- Выбор из готовых вариантов → `select`

## Связанные элементы

| Элемент    | Связь                          |
| ---------- | ------------------------------ |
| `label`    | Обязательно — подпись поля     |
| `form`     | Родительский контейнер         |
| `fieldset` | Группировка связанных полей    |
| `search`   | Родитель — для `type="search"` |

> См. label.md, form.md, search.md

## Необходимые атрибуты

### Всегда

| Атрибут | Назначение                             |
| ------- | -------------------------------------- |
| `id`    | Связь с label через `htmlFor`          |
| `name`  | Идентификатор в данных формы           |
| `type`  | Тип поля (text, email, password и др.) |

### По ситуации

| Атрибут            | Когда                                 |
| ------------------ | ------------------------------------- |
| `required`         | Обязательное поле                     |
| `disabled`         | Поле неактивно                        |
| `readonly`         | Только для чтения                     |
| `placeholder`      | Подсказка формата (не замена label!)  |
| `autocomplete`     | Подсказки браузера                    |
| `inputmode`        | Тип клавиатуры на мобильных           |
| `aria-describedby` | Связь с описанием ошибки / подсказкой |
| `aria-invalid`     | Сигнал об ошибке для screen reader    |

## Визуальные состояния

| Состояние  | Описание                                             |
| ---------- | ---------------------------------------------------- |
| `default`  | Базовый вид                                          |
| `hover`    | Наведение курсора                                    |
| `focus`    | Фокус с клавиатуры — обязательно видимый             |
| `disabled` | Неактивное — сниженный контраст, cursor: not-allowed |
| `readonly` | Только чтение — отличать от disabled                 |
| `error`    | Ошибка валидации — border, иконка, цвет              |

## Правила доступности

- Всегда связывать с `label` через `id` + `htmlFor`
- `placeholder` — не замена label, а подсказка формата
- Ошибки связывать через `aria-describedby`
- При ошибке добавлять `aria-invalid="true"`

## SEO

Не влияет напрямую. Но корректные формы улучшают поведенческие факторы.

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
        autoComplete="email"
        inputMode="email"
        aria-describedby={error ? 'email-error' : undefined}
        aria-invalid={error ? 'true' : undefined}
    />

    {error && (
        <span id="email-error" role="alert" className="error">
            {error}
        </span>
    )}
</div>
```
