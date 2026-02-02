---
name: react-unit-testing
description: Написание unit тестов для React компонентов, хуков и контекстов с использованием Jest + React Testing Library. Использовать когда пользователь просит написать тесты для React компонентов, добавить тесты для хуков, протестировать контексты, или спрашивает как правильно тестировать React-приложения.
---

# Unit тестирование React-приложений

## Стек

Jest + React Testing Library (RTL) + `@testing-library/jest-dom` + `@testing-library/user-event`

---

## Главные принципы

### Тестируй поведение, а не реализацию

**Нельзя:**

- проверять внутреннее состояние
- проверять вызовы конкретных хуков
- привязываться к структуре DOM, классам, id

**Нужно:**

- имитировать действия пользователя (клик, ввод)
- проверять то, что видит пользователь: текст, состояние элементов, сообщения об ошибке
- проверять вызовы внешних колбэков

### Приоритет селекторов

1. `getByRole` — по роли и имени: `screen.getByRole('button', {name: /submit/i})`
2. `getByLabelText` — по label
3. `getByPlaceholderText` / `getByText` / `getByDisplayValue`
4. `getByAltText`, `getByTitle`
5. `getByTestId` — **только если других вариантов нет**

### Изоляция тестов

- Каждый тест независим
- HTTP-запросы мокируем
- Таймеры и моки сбрасываем в `afterEach`

---

## Паттерн AAA (Arrange-Act-Assert)

```tsx
test('описание', async () => {
    // Arrange
    render(<Component />);

    // Act
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', {name: /save/i}));

    // Assert
    expect(screen.getByText(/saved/i)).toBeInTheDocument();
});
```

---

## Примеры тестов

### Компонент с событиями

```tsx
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Counter} from './Counter';

test('увеличивает счётчик при клике', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    expect(screen.getByText(/count:\s*0/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: /increment/i}));

    expect(screen.getByText(/count:\s*1/i)).toBeInTheDocument();
});
```

### Проверка колбэков

```tsx
test('вызывает onClick при клике', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<IconButton onClick={handleClick} />);

    await user.click(screen.getByRole('button', {name: /add/i}));

    expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Асинхронное поведение

```tsx
test('показывает данные после загрузки', async () => {
    global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({name: 'Artem'})
    } as any);

    render(<UserName />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    const userName = await screen.findByText(/user:\s*artem/i);
    expect(userName).toBeInTheDocument();
});
```

---

## Тестирование хуков

```tsx
import {renderHook, act} from '@testing-library/react';
import {useCounter} from './useCounter';

test('увеличивает и уменьшает счётчик', () => {
    const {result} = renderHook(() => useCounter(0));

    expect(result.current.count).toBe(0);

    act(() => {
        result.current.inc();
    });
    expect(result.current.count).toBe(1);
});
```

---

## Тестирование контекстов

```tsx
import {renderHook, act} from '@testing-library/react';
import {AuthProvider, useAuth} from './AuthContext';

test('логин и логаут обновляют пользователя', () => {
    const wrapper = ({children}: {children: React.ReactNode}) => (
        <AuthProvider>{children}</AuthProvider>
    );

    const {result} = renderHook(() => useAuth(), {wrapper});

    expect(result.current.user).toBeNull();

    act(() => {
        result.current.login('Artem');
    });
    expect(result.current.user).toBe('Artem');
});
```

---

## Кастомный render с провайдерами

```tsx
// test-utils.tsx
import {render} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import {ThemeProvider} from '../theme';

const customRender = (ui: React.ReactElement, options?: any) =>
    render(ui, {
        wrapper: ({children}) => (
            <BrowserRouter>
                <ThemeProvider>{children}</ThemeProvider>
            </BrowserRouter>
        ),
        ...options
    });

export * from '@testing-library/react';
export {customRender as render};
```

---

## Антипаттерны

| ❌ Неправильно                            | ✅ Правильно                                    |
| ----------------------------------------- | ----------------------------------------------- |
| `screen.getByTestId('submit-button')`     | `screen.getByRole('button', {name: /submit/i})` |
| `container.querySelector('.btn')`         | `screen.getByRole('button', {name: /save/i})`   |
| Ручной `cleanup()` в afterEach            | RTL делает это автоматически                    |
| `act(() => { render(<C />) })`            | `render(<C />)` — уже обёрнут                   |
| `waitFor(() => { fireEvent.click(btn) })` | События вне waitFor, проверки внутри            |

### getBy vs queryBy vs findBy

- **Наличие элемента**: `getBy*` (синхронно) или `findBy*` (асинхронно)
- **Отсутствие элемента**: `queryBy*` + `.not.toBeInTheDocument()`

```tsx
// элемент должен появиться
const error = await screen.findByText(/error/i);

// элемент не должен существовать
expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
```

---

## Шаблон для новых тестов

```tsx
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Component} from './Component';

describe('<Component />', () => {
    test('рендерит начальное состояние', () => {
        render(<Component />);
        expect(screen.getByText(/что-то/i)).toBeInTheDocument();
    });

    test('реагирует на действие пользователя', async () => {
        const user = userEvent.setup();
        render(<Component />);

        await user.click(screen.getByRole('button', {name: /save/i}));

        expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });
});
```

---

## Чеклист

1. Тестируй **поведение**, а не реализацию
2. Используй `screen`, `userEvent` и матчеры jest-dom
3. Селекторы: `getByRole` → `getBy*Text/Label*` → `getByTestId`
4. Не используй лишние `cleanup`, `act`, `waitFor`
5. Для хуков — `renderHook` + `act`
6. Для контекстов — оборачивай провайдерами
7. Сбрасывай моки: `afterEach(() => jest.clearAllMocks())`
