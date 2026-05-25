#!/usr/bin/env node

/**
 * Pocket CLI - Простой менеджер закладок для терминала.
 * Позволяет сохранять, искать, редактировать и открывать ссылки.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

// Путь к JSON-файлу, в котором хранятся закладки
const DB_PATH = path.join(__dirname, 'bookmarks.json');

// Конфигурация ANSI-последовательностей для раскрашивания вывода в терминале
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    crimson: "\x1b[38m"
  },
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
    crimson: "\x1b[48m"
  }
};

/**
 * Утилита для раскрашивания текста
 * @param {string} color - Код цвета из объекта colors
 * @param {string} text - Текст для раскрашивания
 */
const colorize = (color, text) => `${color}${text}${colors.reset}`;

// Инициализация базы данных: создаем пустой массив в файле, если его еще нет
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
}

/**
 * Читает данные из JSON-файла базы данных
 * @returns {Array} Массив объектов закладок
 */
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(colorize(colors.fg.red, 'Error reading database:'), error.message);
    return [];
  }
};

/**
 * Сохраняет массив закладок в JSON-файл
 * @param {Array} data - Массив объектов закладок
 */
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(colorize(colors.fg.red, 'Error writing to database:'), error.message);
  }
};

/**
 * Преобразует ISO дату в человекочитаемый формат "времени назад" (напр. "2h ago")
 * @param {string} dateStr - Строка даты в формате ISO
 * @returns {string} Относительное время или дата
 */
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

/**
 * Выводит справочную информацию по доступным командам
 */
const help = () => {
  console.log(`
${colorize(colors.bright + colors.fg.cyan, 'Pocket CLI - Bookmark Manager')}

${colorize(colors.fg.yellow, 'Usage:')}
  add <url> [title] [--tags=t1,t2]  Add a new bookmark
  list                               List all bookmarks
  search <query>                     Search in titles, URLs and tags
  show <id>                          Show details of a bookmark
  edit <id> <field> <value>          Edit bookmark (field: url, title, tags)
  delete <id>                        Delete a bookmark
  open <id>                          Open bookmark in default browser
  help                               Show this help
  exit | quit                        Exit interactive mode

${colorize(colors.fg.yellow, 'Examples:')}
  add "https://google.com" "Google" --tags=search,tools
  search "google"
  edit 1 tags "news,tech"
  `);
};

/**
 * Обрабатывает аргументы командной строки, отделяя теги (--tags=...) от позиционных параметров
 * @param {string[]} args - Массив аргументов
 * @returns {object} Объект с очищенными аргументами и параметрами тегов
 */
const parseArgs = (args) => {
  const params = { tags: [] };
  const cleanedArgs = [];

  args.forEach(arg => {
    if (arg && arg.startsWith('--tags=')) {
      params.tags = arg.split('=')[1].split(',').map(t => t.trim());
    } else if (arg) {
      cleanedArgs.push(arg);
    }
  });

  return { cleanedArgs, params };
};

/**
 * Базовая проверка валидности URL
 * @param {string} url 
 * @returns {boolean}
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Логика добавления новой закладки
 * @param {string[]} args - Аргументы команды add
 */
const add = (args) => {
  const { cleanedArgs, params } = parseArgs(args);
  const url = cleanedArgs[0];
  const title = cleanedArgs[1];

  if (!url) {
    console.error(colorize(colors.fg.red, 'Error: URL is required'));
    return;
  }

  if (!isValidUrl(url)) {
    console.warn(colorize(colors.fg.yellow, 'Warning: The URL seems invalid. Adding anyway...'));
  }

  const db = readDB();
  // Генерируем новый ID на основе максимального существующего
  const id = db.length > 0 ? Math.max(...db.map(b => b.id)) + 1 : 1;
  const newBookmark = {
    id,
    url,
    title: title || url,
    tags: params.tags,
    createdAt: new Date().toISOString()
  };
  db.push(newBookmark);
  writeDB(db);
  console.log(`${colorize(colors.fg.green, '✔')} Added bookmark [${colorize(colors.fg.cyan, id)}]: ${colorize(colors.bright, newBookmark.title)}`);
};

/**
 * Отрисовывает список закладок в виде форматированной таблицы
 * @param {Array} bookmarks - Список закладок для отображения
 */
const printTable = (bookmarks) => {
  if (bookmarks.length === 0) {
    console.log(colorize(colors.fg.yellow, 'No bookmarks found.'));
    return;
  }

  const idColWidth = 4;
  const titleColWidth = 30;
  const urlColWidth = 40;
  const tagsColWidth = 20;

  // Формируем заголовок таблицы
  const header = ` ${'ID'.padEnd(idColWidth)} | ${'Title'.padEnd(titleColWidth)} | ${'URL'.padEnd(urlColWidth)} | ${'Tags'.padEnd(tagsColWidth)} | ${'Date'}`;
  console.log(colorize(colors.bg.blue + colors.fg.white, header));
  console.log('-'.repeat(header.length));

  // Выводим строки данных
  bookmarks.forEach(b => {
    const id = b.id.toString().padEnd(idColWidth);
    const title = (b.title.length > titleColWidth ? b.title.substring(0, titleColWidth - 3) + '...' : b.title).padEnd(titleColWidth);
    const url = (b.url.length > urlColWidth ? b.url.substring(0, urlColWidth - 3) + '...' : b.url).padEnd(urlColWidth);
    const tags = ((b.tags || []).join(',').length > tagsColWidth ? (b.tags || []).join(',').substring(0, tagsColWidth - 3) + '...' : (b.tags || []).join(',')).padEnd(tagsColWidth);
    const date = formatDate(b.createdAt);
    
    console.log(` ${colorize(colors.fg.cyan, id)} | ${colorize(colors.bright, title)} | ${colorize(colors.dim, url)} | ${colorize(colors.fg.yellow, tags)} | ${date}`);
  });
};

/**
 * Команда вывода всех закладок
 */
const list = () => {
  const db = readDB();
  printTable(db);
};

/**
 * Поиск закладок по вхождению строки в заголовке, URL или тегах
 * @param {string} query - Поисковый запрос
 */
const search = (query) => {
  if (!query) {
    console.error(colorize(colors.fg.red, 'Error: Search query is required'));
    return;
  }
  const db = readDB();
  const q = query.toLowerCase();
  const filtered = db.filter(b => 
    b.title.toLowerCase().includes(q) || 
    b.url.toLowerCase().includes(q) || 
    (b.tags && b.tags.some(t => t.toLowerCase().includes(q)))
  );
  
  console.log(`${colorize(colors.fg.cyan, 'Search results for:')} "${query}"`);
  printTable(filtered);
};

/**
 * Вывод полной информации об одной закладке по ID
 * @param {string} id - ID закладки
 */
const show = (id) => {
  const db = readDB();
  const b = db.find(b => b.id === parseInt(id));
  if (!b) {
    console.error(colorize(colors.fg.red, `Error: Bookmark with ID ${id} not found`));
    return;
  }
  
  console.log(`\n${colorize(colors.bright + colors.fg.cyan, '--- Bookmark Details ---')}`);
  console.log(`${colorize(colors.fg.yellow, 'ID:')}         ${b.id}`);
  console.log(`${colorize(colors.fg.yellow, 'Title:')}      ${colorize(colors.bright, b.title)}`);
  console.log(`${colorize(colors.fg.yellow, 'URL:')}        ${colorize(colors.underscore + colors.fg.blue, b.url)}`);
  console.log(`${colorize(colors.fg.yellow, 'Tags:')}       ${(b.tags || []).join(', ')}`);
  console.log(`${colorize(colors.fg.yellow, 'Created At:')} ${new Date(b.createdAt).toLocaleString()} (${formatDate(b.createdAt)})`);
};

/**
 * Редактирование полей существующей закладки
 * @param {string} id - ID закладки
 * @param {string} field - Название поля (url, title, tags)
 * @param {string} value - Новое значение
 */
const edit = (id, field, value) => {
  if (!field || !value) {
    console.error(colorize(colors.fg.red, 'Usage: edit <id> <url|title|tags> <value>'));
    return;
  }
  const db = readDB();
  const index = db.findIndex(b => b.id === parseInt(id));
  if (index === -1) {
    console.error(colorize(colors.fg.red, `Error: Bookmark with ID ${id} not found`));
    return;
  }

  if (field === 'tags') {
    db[index].tags = value.split(',').map(t => t.trim());
  } else if (field === 'url' || field === 'title') {
    db[index][field] = value;
  } else {
    console.error(colorize(colors.fg.red, 'Error: Field must be "url", "title", or "tags"'));
    return;
  }

  writeDB(db);
  console.log(`${colorize(colors.fg.green, '✔')} Updated bookmark ${id}`);
};

/**
 * Удаление закладки по ID
 * @param {string} id - ID закладки
 */
const remove = (id) => {
  let db = readDB();
  const initialLength = db.length;
  db = db.filter(b => b.id !== parseInt(id));
  if (db.length === initialLength) {
    console.error(colorize(colors.fg.red, `Error: Bookmark with ID ${id} not found`));
    return;
  }
  writeDB(db);
  console.log(`${colorize(colors.fg.green, '✔')} Deleted bookmark ${id}`);
};

/**
 * Открывает URL закладки в системном браузере по умолчанию
 * @param {string} id - ID закладки
 */
const open = (id) => {
  const db = readDB();
  const bookmark = db.find(b => b.id === parseInt(id));
  if (!bookmark) {
    console.error(colorize(colors.fg.red, `Error: Bookmark with ID ${id} not found`));
    return;
  }
  // Выбор команды открытия в зависимости от ОС
  const command = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${command} "${bookmark.url}"`, (err) => {
    if (err) {
      console.error(colorize(colors.fg.red, 'Error opening URL:'), err.message);
    } else {
      console.log(`${colorize(colors.fg.green, '🚀')} Opening: ${bookmark.url}`);
    }
  });
};

/**
 * Маршрутизатор команд: сопоставляет текстовую команду с соответствующей функцией
 * @param {string} command - Название команды
 * @param {string[]} args - Аргументы команды
 */
const executeCommand = (command, args) => {
  switch (command) {
    case 'add':
      add(args);
      break;
    case 'list':
      list();
      break;
    case 'search':
      search(args[0]);
      break;
    case 'show':
      show(args[0]);
      break;
    case 'edit':
      edit(args[0], args[1], args[2]);
      break;
    case 'delete':
      remove(args[0]);
      break;
    case 'open':
      open(args[0]);
      break;
    case 'help':
      help();
      break;
    case 'exit':
    case 'quit':
      console.log('Goodbye!');
      process.exit(0);
      break;
    default:
      if (command) {
        console.error(colorize(colors.fg.red, `Unknown command: ${command}`));
        console.log('Type "help" for a list of commands.');
      }
      break;
  }
};

/**
 * Запуск интерактивного режима (REPL)
 * Использует модуль readline для чтения ввода пользователя в бесконечном цикле
 */
const startInteractiveMode = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colorize(colors.fg.green, 'pocket> ')
  });

  console.log(colorize(colors.bright + colors.fg.cyan, 'Pocket CLI Interactive Mode'));
  console.log('Type "help" for instructions or "exit" to leave.\n');

  rl.prompt();

  rl.on('line', (line) => {
    // Регулярное выражение для парсинга строки с учетом кавычек (напр. "Title with spaces")
    const parts = line.trim().match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
    if (!parts) {
        rl.prompt();
        return;
    }
    const command = parts[0];
    // Очищаем аргументы от кавычек
    const args = parts.slice(1).map(arg => arg.replace(/^"(.*)"$/, '$1'));
    
    executeCommand(command, args);
    rl.prompt();
  }).on('close', () => {
    console.log('\nGoodbye!');
    process.exit(0);
  });
};

/**
 * Точка входа приложения.
 * Если аргументы командной строки отсутствуют, запускается интерактивный режим.
 * В противном случае выполняется переданная команда.
 */
const args = process.argv.slice(2);
if (args.length === 0) {
  startInteractiveMode();
} else {
  const command = args[0];
  const cmdArgs = args.slice(1);
  executeCommand(command, cmdArgs);
}
