# @artche/ai

AI Skills, Rules and Commands installer for Claude Code and Cursor.

## Установка и использование

### Через npx

```bash
# Установить всё для Claude Code
npx @artche/ai claude

# Установить всё для Cursor
npx @artche/ai cursor
```

## Частичная установка (--what)

```bash
# Только skills
npx @artche/ai claude --what=skills

# Конкретный скилл
npx @artche/ai claude --what=skills/my-skill

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
│   │   └── ...
│   ├── commands/
│   │   └── ...
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

## Помощь

```bash
npx @artche/ai --help
```
