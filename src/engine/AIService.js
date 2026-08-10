/**
 * AIService.js — AI değerlendirme servis katmanı
 *
 * OpenAI API entegrasyonu — Dockerfile değerlendirmesi ve pedagojik feedback.
 * Frontend-only uygulama olduğu için doğrudan tarayıcıdan çağrı yapılır.
 *
 * API anahtarı .env dosyasından (VITE_OPENAI_API_KEY) okunur.
 * Erişilemezse kural tabanlı değerlendirmeye geri dönülür.
 */

const OPENAI_API_BASE = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

// Rate limiting — günlük/saatlik çağrı limiti
const RATE_LIMIT = {
  maxPerHour: 20,
  maxPerDay: 100,
  calls: [],
};

/**
 * Rate limit kontrolü.
 */
function checkRateLimit() {
  const now = Date.now();
  RATE_LIMIT.calls = RATE_LIMIT.calls.filter((t) => now - t < 24 * 60 * 60 * 1000);

  const lastHour = RATE_LIMIT.calls.filter((t) => now - t < 60 * 60 * 1000).length;
  const lastDay = RATE_LIMIT.calls.length;

  if (lastHour >= RATE_LIMIT.maxPerHour) {
    return { allowed: false, reason: 'Saatlik AI çağrı limiti aşıldı. Lütfen bir süre bekle.' };
  }
  if (lastDay >= RATE_LIMIT.maxPerDay) {
    return { allowed: false, reason: 'Günlük AI çağrı limiti aşıldı. Yarın tekrar dene.' };
  }
  return { allowed: true };
}

/**
 * API anahtarını kontrol eder.
 */
export function getApiKey() {
  return import.meta.env.VITE_OPENAI_API_KEY || null;
}

/**
 * AI erişilebilir mi kontrol eder.
 */
export function isAIAvailable() {
  return !!getApiKey();
}

/**
 * OpenAI API'sine istek gönderir.
 * @param {string} systemPrompt - Sistem prompt'u
 * @param {string} userPrompt - Kullanıcı prompt'u
 * @returns {Promise<string|null>} - AI yanıtı veya null
 */
async function callOpenAI(systemPrompt, userPrompt) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const rateCheck = checkRateLimit();
  if (!rateCheck.allowed) {
    console.warn('[AIService]', rateCheck.reason);
    return null;
  }

  try {
    RATE_LIMIT.calls.push(Date.now());

    const response = await fetch(OPENAI_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      console.error('[AIService] API hatası:', response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('[AIService] Bağlantı hatası:', error.message);
    return null;
  }
}

/**
 * Dockerfile'ı AI ile değerlendirir ve pedagojik feedback döndürür.
 *
 * @param {string} dockerfileContent - Oyuncunun yazdığı Dockerfile
 * @param {Object} mission - Görev bilgileri
 * @param {Object} ruleBasedResult - Kural tabanlı değerlendirme sonucu (fallback için)
 * @returns {Promise<Object>} - AI feedback objesi
 */
export async function evaluateWithAI(dockerfileContent, mission, ruleBasedResult) {
  const systemPrompt = `Sen bir MLOps eğitmenisin. Öğrencilerin Dockerfile yazımını değerlendiriyorsun.
Her zaman Türkçe yanıt ver. Pedagojik ve teşvik edici ol.
Yanıtını SADECE JSON formatında ver, başka metin ekleme.`;

  const userPrompt = `Aşağıdaki Dockerfile'ı değerlendir.

## Görev: ${mission.title}
${mission.description}

## Beklenen Kriterler:
${JSON.stringify(mission.expectedCriteria, null, 2)}

## Öğrencinin Dockerfile'ı:
\`\`\`dockerfile
${dockerfileContent}
\`\`\`

## Yanıt Formatı (JSON):
{
  "summary": "Genel değerlendirme (2-3 cümle)",
  "strengths": ["İyi yapılan şeyler"],
  "improvements": ["Geliştirilmesi gereken noktalar"],
  "tips": ["Öğretici ipuçları ve best practice önerileri"]
}`;

  const response = await callOpenAI(systemPrompt, userPrompt);

  // Fallback: AI erişilemezse kural tabanlı sonucu kullan
  if (!response) {
    return {
      source: 'rule_based',
      summary: ruleBasedResult.passed
        ? 'Dockerfile temel kriterleri karşılıyor. ✅'
        : 'Dockerfile bazı kriterleri karşılamıyor. Kontrol listesini incele.',
      strengths: ruleBasedResult.checks.filter((c) => c.passed).map((c) => c.name),
      improvements: ruleBasedResult.checks.filter((c) => !c.passed).map((c) => c.name),
      tips: mission.hints || [],
      score: ruleBasedResult.score,
      maxScore: ruleBasedResult.maxScore,
    };
  }

  // AI yanıtını parse et
  try {
    const parsed = parseAIResponse(response);
    return {
      source: 'ai',
      ...parsed,
      score: ruleBasedResult.score,
      maxScore: ruleBasedResult.maxScore,
    };
  } catch {
    return {
      source: 'ai',
      summary: response.substring(0, 500),
      strengths: [],
      improvements: [],
      tips: [],
      score: ruleBasedResult.score,
      maxScore: ruleBasedResult.maxScore,
    };
  }
}

/**
 * AI yanıtından JSON parse eder.
 */
function parseAIResponse(response) {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('JSON bulunamadı');
  }
  return JSON.parse(jsonMatch[0]);
}

/**
 * Dinamik senaryo metni üretimi — şablon + seed → AI'dan README metni.
 */
export async function generateScenarioText(mission, seed = 0) {
  const systemPrompt = 'Sen bir yazılım projesi yöneticisisin. Türkçe yaz.';
  const userPrompt = `Aşağıdaki görev için kısa bir README.md senaryosu yaz (5-10 satır).

Görev: ${mission.title}
Açıklama: ${mission.description}
Seed: ${seed}

Senaryo, sanki gerçek bir şirketin projesiymış gibi yazılmalı. Proje adı, kısa açıklama, kurulum talimatları ve kullanım örnekleri içermeli.`;

  const response = await callOpenAI(systemPrompt, userPrompt);
  if (!response) {
    return `# ${mission.title}\n\n${mission.description}\n\nBu proje Docker container'ında çalıştırılmak üzere tasarlanmıştır.\n`;
  }
  return response;
}
