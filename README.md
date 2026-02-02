# @artche/ai

AI Skills, Rules and Commands installer for Claude Code and Cursor.

## Установка и использование

### Через npx (рекомендуется)

```bash
# Установить всё для Claude Code
npx @artche/ai claude

# Установить всё для Cursor
npx @artche/ai cursor
```

### Глобальная установка

```bash
npm install -g @artche/ai

# Использование
ai claude
ai cursor
```

## Частичная установка (--what)

```bash
# Только skills
npx @artche/ai claude --what=skills

# Конкретный скилл
npx @artche/ai claude --what=skills/html

# Несколько папок
npx @artche/ai claude --what=skills,commands

# Конкретный файл
npx @artche/ai claude --what=rules/my-rule.md
```

## Что устанавливается

```
your-project/
├── .claude/                    # или .cursor/
│   ├── skills/
│   │   ├── html/
│   │   │   ├── SKILL.md
│   │   │   └── elements/
│   │   └── ...
│   ├── commands/
│   │   └── a11y-review.md
│   ├── rules/
│   │   └── ...
│   └── agents/
│       └── ...
└── src/
```

## Merge mode

Скрипт **не удаляет** существующие файлы пользователя:

- Если у вас уже есть `.claude/skills/my-skill/` — он останется
- Наши скиллы добавятся рядом
- При повторном запуске наши файлы перезапишутся, ваши — нет

## Обновление

Просто запустите команду снова:

```bash
npx @artche/ai@latest claude
```

## Доступные пути для --what

| Путь          | Описание    |
| ------------- | ----------- |
| `skills`      | Все скиллы  |
| `skills/html` | HTML скилл  |
| `commands`    | Все команды |
| `rules`       | Все правила |
| `agents`      | Все агенты  |

Комбинируйте через запятую: `--what=skills/html,commands`

## Помощь

```bash
npx @artche/ai --help
```

## Contributing

1. Fork репозитория: https://github.com/ArtChe92/ai
2. Добавь скиллы/команды/правила в папку `ai/`
3. Создай Pull Request

## License

MIT
