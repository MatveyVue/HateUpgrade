// =============================================================
//  ДАННЫЕ ДЛЯ АПГРЕЙДА ПОДАРКОВ (ДОБАВЬ СВОИ ФОНЫ И ПОДАРКИ)
// =============================================================
//  ОБЪЕКТ ФОНА (background):
//    id         - уникальный ключ (используется при сохранении в БД)
//    name       - название (показывается в интерфейсе)
//    url        - ссылка на картинку фона (грузятся с GitHub как кепки).
//                 Оставь пустым, если фон задаётся CSS-градиентом ниже.
//    background - CSS-фон (используется, если `url` пустой). Пиши сюда
//                 любой валидный CSS для свойства `background`.
//
//  Фон рисуется КАРТИНКОЙ из `url` (во весь экран). Если `url` пустой —
//  берётся CSS-градиент из `background`.
//
//  ПРИМЕРЫ:
//    url: 'https://raw.githubusercontent.com/MyUser/MyRepo/main/nebula.png'
//    background: 'linear-gradient(135deg, #667eea, #764ba2)'
//    background: 'radial-gradient(circle at top left, #f093fb, #f5576c)'
//    background: '#1e3c72'
// =============================================================

export const upgradeBackgrounds = [
  {
    id: 'black',
    name: 'Black',
    url: 'https://raw.githubusercontent.com/MatveyVue/HateCapsUpgrade/main/BlackHate.PNG',
  },
  {
    id: 'onyx',
    name: 'Onyx Black',
    url: 'https://raw.githubusercontent.com/MatveyVue/HateCapsUpgrade/main/OnyxHate.PNG',
  },
  {
    id: 'mint',
    name: 'Mint Greenn',
    url: 'https://raw.githubusercontent.com/MatveyVue/HateCapsUpgrade/main/MintHate.PNG',
  },
  {
    id: 'french',
    name: 'French Blue',
    url: 'https://raw.githubusercontent.com/MatveyVue/HateCapsUpgrade/main/FrenchHate.PNG',
  },
]

export const upgradeModels = [
  {
    id: 'casino',
    name: 'Casino Cap',
    url: 'https://raw.githubusercontent.com/MatveyVue/HateCapsUpgrade/main/CasinoCap.PNG',
  },
  {
    id: 'code',
    name: 'Code Cup',
    url: 'https://raw.githubusercontent.com/MatveyVue/HateCapsUpgrade/main/CodeCap.PNG',
  },
  {
    id: 'duck',
    name: "Duck Cap",
    url: 'https://raw.githubusercontent.com/MatveyVue/HateCapsUpgrade/main/DuckCap.PNG',
  },
  {
    id: 'rabbit',
    name: 'Rabbit Cap',
    url: 'https://raw.githubusercontent.com/MatveyVue/HateCapsUpgrade/main/RabbitCap.PNG',
  },
  {
    id: 'club69',
    name: 'Club69 Cap',
    url: 'https://raw.githubusercontent.com/MatveyVue/HateCapsUpgrade/main/Club69Cap.PNG',
  },
  {
    id: 'crystal',
    name: 'Crystal Cap',
    url: 'https://raw.githubusercontent.com/MatveyVue/HateCapsUpgrade/main/CrystalCap.PNG',
  },
  {
    id: 'gem',
    name: 'Gem Cap',
    url: 'https://raw.githubusercontent.com/MatveyVue/HateCapsUpgrade/main/GemCap.PNG',
  },
  {
    id: 'gram',
    name: 'Gram Cap',
    url: 'https://raw.githubusercontent.com/MatveyVue/HateCapsUpgrade/main/GramCap.PNG',
  },
  {
    id: 'great',
    name: 'Great Cap',
    url: 'https://raw.githubusercontent.com/MatveyVue/HateCapsUpgrade/main/GreatCap.PNG',
  },
]

// Вспомогательные функции (не редактируй ниже)
export function preloadUpgradeAssets() {
  const urls = new Set()
  for (const m of upgradeModels) {
    if (m.url) urls.add(m.url)
  }
  for (const b of upgradeBackgrounds) {
    if (b.url) urls.add(b.url)
  }
  for (const url of urls) {
    const img = new Image()
    img.src = url
  }
}

export function pickRandomBackground() {
  const list = upgradeBackgrounds
  return list[Math.floor(Math.random() * list.length)]
}

export function pickRandomModel() {
  const list = upgradeModels
  return list[Math.floor(Math.random() * list.length)]
}
