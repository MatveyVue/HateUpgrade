<template>
  <div class="upgrade-shell">
    <div class="upgrade-header">
      <p class="upgrade-kicker">Collectibles</p>
      <h1 class="upgrade-title">Upgrade</h1>
    </div>

    <p class="upgrade-desc">
      Open a random gift. A background flies in behind, then the gift appears.
    </p>

    <div class="upgrade-stage" :class="{ 'is-open': resultOpen }" ref="stageRef">
      <div v-if="!resultOpen" class="stage-idle">
        <p class="idle-hint">Press open to reveal your gift</p>
      </div>

      <div v-else :key="animationKey" class="stage-result">
        <div class="reel-window">
          <div
            class="reel-track bg"
            :style="{
              transform: `translateX(${reelOffset}px)`,
              transition: spinning ? reelTransition : 'none',
            }"
          >
            <div
              v-for="(cell, i) in reelCells"
              :key="'b' + i"
              class="reel-cell"
              :style="{ background: cell.background, width: cellW + 'px' }"
            >
              <img
                v-if="cell.url"
                class="reel-bg-img"
                :src="cell.url"
                :alt="cell.name"
              />
            </div>
          </div>
          <div
            class="reel-track cap"
            :style="{
              transform: `translateX(${capOffset}px)`,
              transition: capSpinning ? capTransition : 'none',
            }"
          >
            <div
              v-for="(cap, i) in capCells"
              :key="'c' + i"
              class="reel-cell"
              :style="{ width: cellW + 'px' }"
            >
              <img class="reel-cap" :src="cap.url" :alt="cap.name" />
            </div>
          </div>
          <div class="reel-marker"></div>
        </div>
      </div>
    </div>

    <div v-if="showModel" class="result-card">
      <p class="result-name">{{ result.model.name }}</p>
      <p class="result-backdrop">on {{ result.background.name }} background</p>
    </div>

    <button
      class="open-btn"
      type="button"
      :disabled="opening || saving"
      @click="openGift"
    >
      {{ opening ? 'Opening...' : saving ? 'Saving...' : '1M SCMD' }}
    </button>

    <p v-if="error" class="error-text">{{ error }}</p>
  </div>

  <div class="bar">
    <div class="btn-container">
      <RouterLink to="/upgrade">
        <button class="market" @click="triggerMediumHaptic">
          <img
            style="position: absolute; margin-left: -17px; margin-top: 5px;"
            src="https://github.com/MatveyVue/icopn/blob/main/MarketActive.png?raw=true"
            width="33px"
          />
          <p style="margin-top: 40px; color: rgb(25, 122, 207);">Upgrade</p>
        </button>
      </RouterLink>
      <RouterLink to="/">
        <button class="leaders" @click="triggerMediumHaptic">
          <img
            style="position: absolute; margin-left: -18px;"
            src="https://github.com/MatveyVue/icopn/blob/main/LeaderBoard.png?raw=true"
            width="40px"
          />
          <p style="margin-top: 40px; color: white;">Top</p>
        </button>
      </RouterLink>
      <RouterLink to="/staking">
        <button class="game" @click="triggerMediumHaptic">
          <img
            style="position: absolute; margin-left: -37px; margin-top: 2px;"
            src="https://github.com/MatveyVue/Profiles-Telegram/blob/main/staking.PNG?raw=true"
            width="75px"
          />
          <p style="margin-top: 40px;">Staking</p>
        </button>
      </RouterLink>
      <RouterLink to="/profile">
        <button class="profile" @click="triggerMediumHaptic">
          <img
            style="position: absolute; margin-left: -18px;"
            src="https://github.com/MatveyVue/icopn/blob/main/Profile.png?raw=true"
            width="35px"
          />
          <p style="margin-top: 40px;">Profile</p>
        </button>
      </RouterLink>
    </div>
  </div>
  <p style="color: rgb(20, 20, 20);">.</p>
  <p style="color: rgb(20, 20, 20);">.</p>
  <p style="color: rgb(20, 20, 20);">.</p>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { triggerMediumHaptic } from '../script/haptics.js'
import { upgradeModels as modelCatalog, upgradeBackgrounds as backgroundCatalog } from '../script/upgradesData.js'
import { getProfile, purchaseUpgrade } from '../lib/api.js'

defineOptions({ name: 'market' })

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const result = ref({ background: null, model: null })
const resultOpen = ref(false)
const animationKey = ref(0)
const opening = ref(false)
const saving = ref(false)
const error = ref('')

const stageRef = ref(null)
const reelCells = ref([])
const reelOffset = ref(0)
const reelTransition = ref('')
const spinning = ref(false)
const capCells = ref([])
const capOffset = ref(0)
const capTransition = ref('')
const capSpinning = ref(false)
const showModel = ref(false)
const cellW = ref(340)

const SPIN_ROUNDS = 5
const SPIN_MS = 2500
const CAP_SPIN_MS = 8000

const UPGRADE_COST = 1000000000000000n // 1,000,000 SCMD69 (9 decimals)

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

async function openGift() {
  if (opening.value || saving.value) return
  opening.value = true
  error.value = ''

  try {
    const profile = await getProfile()
    const available = BigInt(profile?.balances?.available_balance || '0')
    if (available < UPGRADE_COST) {
      error.value = 'Not enough SCMD69. Upgrade costs 1,000,000 SCMD69.'
      opening.value = false
      return
    }
    await purchaseUpgrade()
  } catch (e) {
    error.value = e?.message || 'Upgrade payment failed'
    opening.value = false
    return
  }

  const background = pickRandom(backgroundCatalog)
  const model = pickRandom(modelCatalog)

  resultOpen.value = false
  showModel.value = false
  spinning.value = false
  capSpinning.value = false
  reelOffset.value = 0
  capOffset.value = 0
  reelTransition.value = 'none'
  capTransition.value = 'none'
  animationKey.value += 1

  await nextTick()
  await new Promise((r) => setTimeout(r, 60))

  result.value = { background, model }
  resultOpen.value = true
  buildReel(background, model)

  await nextTick()
  await new Promise((r) => setTimeout(r, 60))

  const stageWidth = stageRef.value && stageRef.value.clientWidth > 0
    ? stageRef.value.clientWidth
    : (window.innerWidth || 340)
  cellW.value = stageWidth

  await nextTick()
  await new Promise((r) => setTimeout(r, 60))

  const bgPack = backgroundCatalog.length
  const capPack = modelCatalog.length

  const bgBaseIndex = reelCells.value.findIndex((c) => c.id === background.id)
  const bgTargetIndex = bgBaseIndex + SPIN_ROUNDS * bgPack
  const bgTargetCenter = (bgTargetIndex + 0.5) * cellW.value
  const bgFinalOffset = -(bgTargetCenter - stageWidth / 2)

  const capBaseIndex = capCells.value.findIndex((c) => c.id === model.id)
  const capTargetIndex = capBaseIndex + SPIN_ROUNDS * capPack
  const capTargetCenter = (capTargetIndex + 0.5) * cellW.value
  const capFinalOffset = -(capTargetCenter - stageWidth / 2)

  reelTransition.value = `transform ${SPIN_MS}ms cubic-bezier(0.1, 0.75, 0.16, 1)`
  capTransition.value = `transform ${CAP_SPIN_MS}ms cubic-bezier(0.1, 0.75, 0.16, 1)`
  spinning.value = true
  capSpinning.value = true
  reelOffset.value = bgFinalOffset
  capOffset.value = capFinalOffset

  await new Promise((r) => setTimeout(r, SPIN_MS))
  spinning.value = false

  await new Promise((r) => setTimeout(r, CAP_SPIN_MS - SPIN_MS))
  capSpinning.value = false

  showModel.value = true
  opening.value = false
  await saveUpgrade(background, model)
}

function buildReel(background, model) {
  const repeats = SPIN_ROUNDS + 2

  const cells = []
  for (let r = 0; r < repeats; r += 1) {
    for (const bg of backgroundCatalog) {
      cells.push(bg)
    }
  }
  reelCells.value = cells

  const caps = []
  for (let r = 0; r < repeats; r += 1) {
    for (const m of modelCatalog) {
      caps.push(m)
    }
  }
  capCells.value = caps
}

function getUsername() {
  try {
    return window.Telegram?.WebApp?.initDataUnsafe?.user?.username || ''
  } catch {
    return ''
  }
}

async function saveUpgrade(background, model) {
  saving.value = true
  error.value = ''

  const username = getUsername()
  if (!username) {
    error.value = 'Username not available'
    saving.value = false
    return
  }

  const record = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    backgroundId: background.id,
    backgroundName: background.name,
    backgroundCss: background.background,
    backgroundUrl: background.url || '',
    modelId: model.id,
    modelName: model.name,
    modelUrl: model.url,
    openedAt: new Date().toISOString(),
  }

  try {
    const userDocRef = doc(db, 'users', username)
    await setDoc(userDocRef, { username }, { merge: true })
    await updateDoc(userDocRef, { upgradedGifts: arrayUnion(record) })
  } catch (e) {
    error.value = e?.message || 'Failed to save'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (modelCatalog.length === 0 || backgroundCatalog.length === 0) {
    error.value = 'Add gift models and backgrounds in src/script/upgradesData.js'
  }
})
</script>
