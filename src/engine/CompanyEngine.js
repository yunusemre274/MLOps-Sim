/**
 * CompanyEngine.js — Şirket kurma ve yönetim motoru
 *
 * Şirket kurma, NPC çalışan işe alma, görev delegasyonu,
 * finans paneli, müşteri portföy yönetimi.
 */

// Rütbe sistemi — kilit açma bildirimleri
const RANK_UNLOCKS = {
  junior:      { label: 'Junior',      unlocks: ['Temel görevler', 'Tutorial erişimi'] },
  junior_plus: { label: 'Junior+',     unlocks: ['CloudPeak görevleri', 'Compose görevleri'] },
  mid:         { label: 'Mid-Level',   unlocks: ['İleri görevler', 'CI/CD görevleri'] },
  mid_senior:  { label: 'Mid-Senior',  unlocks: ['K8s görevleri', 'Güvenlik görevleri'] },
  senior:      { label: 'Senior',      unlocks: ['Şirket kurma hakkı', 'NPC işe alma'] },
  lead:        { label: 'Lead',        unlocks: ['Teknik borç yönetimi', 'Tüm görevler açık'] },
};

/**
 * Rütbe geçiş bildirimlerini döndürür.
 */
export function getRankUnlocks(rank) {
  return RANK_UNLOCKS[rank] || null;
}

// Ofis seçenekleri
const OFFICES = [
  {
    id: 'coworking',
    name: 'Co-Working Masası',
    emoji: '🪑',
    monthlyRent: 200,
    capacity: 1,
    description: 'Paylaşımlı ofis masası. Tek başına çalışmak için yeterli.',
  },
  {
    id: 'small_office',
    name: 'Küçük Ofis',
    emoji: '🏢',
    monthlyRent: 800,
    capacity: 3,
    description: '2-3 kişilik özel ofis. İlk çalışanını işe alabilirsin.',
  },
  {
    id: 'medium_office',
    name: 'Orta Ofis',
    emoji: '🏬',
    monthlyRent: 2000,
    capacity: 8,
    description: 'Açık plan ofis. Orta ölçekli ekip için ideal.',
  },
  {
    id: 'large_office',
    name: 'Plaza Katı',
    emoji: '🏙️',
    monthlyRent: 5000,
    capacity: 20,
    description: 'Tam kat ofis. Büyük ekipler ve toplantı odaları.',
  },
];

export function getOffices() {
  return OFFICES;
}

/**
 * Şirket kurma ön koşul kontrolü.
 */
export function canFoundCompany(state) {
  const checks = [];
  const rankOrder = ['junior', 'junior_plus', 'mid', 'mid_senior', 'senior', 'lead'];
  const rankIdx = rankOrder.indexOf(state.character.rank);

  // Rütbe kontrolü — en az Senior
  checks.push({
    name: 'Senior veya üzeri rütbe',
    passed: rankIdx >= 4,
    current: state.character.rank,
    required: 'senior',
  });

  // Görev sayısı kontrolü — en az 10
  checks.push({
    name: 'En az 10 tamamlanmış görev',
    passed: state.character.totalCompletedMissions >= 10,
    current: state.character.totalCompletedMissions,
    required: 10,
  });

  // Para kontrolü — en az 5000₺
  checks.push({
    name: 'En az ₺5.000 bakiye',
    passed: state.finance.balance >= 5000,
    current: state.finance.balance,
    required: 5000,
  });

  // Zaten şirket var mı
  checks.push({
    name: 'Henüz şirket kurulmamış',
    passed: !state.career.ownCompany,
    current: state.career.ownCompany ? 'Var' : 'Yok',
    required: 'Yok',
  });

  return {
    canFound: checks.every((c) => c.passed),
    checks,
  };
}

/**
 * Şirket kurar.
 */
export function foundCompany(companyName, officeId) {
  const office = OFFICES.find((o) => o.id === officeId);
  if (!office) return null;

  return {
    name: companyName,
    officeId: office.id,
    officeName: office.name,
    monthlyRent: office.monthlyRent,
    capacity: office.capacity,
    employees: [],
    clients: [],
    reputation: 50,
    foundedDay: null, // Store'dan set edilecek
  };
}

// İşe alınabilir NPC adayları
const CANDIDATE_POOL = [
  { id: 'emp_ali',    name: 'Ali Yılmaz',    skill: 65,  salary: 400, specialty: 'Dockerfile' },
  { id: 'emp_elif',   name: 'Elif Demir',    skill: 75,  salary: 550, specialty: 'Docker Compose' },
  { id: 'emp_can',    name: 'Can Öztürk',    skill: 55,  salary: 300, specialty: 'Dockerfile' },
  { id: 'emp_selin',  name: 'Selin Aksoy',   skill: 80,  salary: 650, specialty: 'Kubernetes' },
  { id: 'emp_mert',   name: 'Mert Kaya',     skill: 70,  salary: 500, specialty: 'CI/CD' },
  { id: 'emp_zeynep', name: 'Zeynep Şahin',  skill: 85,  salary: 750, specialty: 'Kubernetes' },
  { id: 'emp_baris',  name: 'Barış Çelik',   skill: 60,  salary: 350, specialty: 'Dockerfile' },
  { id: 'emp_deniz',  name: 'Deniz Koç',     skill: 90,  salary: 900, specialty: 'CI/CD' },
];

export function getCandidates() {
  return CANDIDATE_POOL;
}

/**
 * NPC çalışanın görev sonucunu simüle eder.
 * Skill seviyesine göre hata oranı hesaplanır.
 * @param {Object} employee - Çalışan bilgileri
 * @param {Object} mission - Görev bilgileri
 * @returns {Object} - Çalışan çıktısı
 */
export function delegateMission(employee, mission) {
  const successChance = employee.skill / 100;
  const roll = Math.random();
  const success = roll < successChance;

  // Hatalı Dockerfile üretme (review için)
  const errors = [];
  if (!success) {
    const possibleErrors = [
      'FROM direktifi eksik veya yanlış tag kullanılmış',
      'WORKDIR tanımlanmamış',
      'COPY yerine ADD kullanılmış (gereksiz)',
      'Multi-stage build yapılmamış (tek aşama)',
      'EXPOSE portu yanlış',
      'CMD formatı hatalı (shell form vs exec form)',
      'Root kullanıcı ile çalışıyor (USER eksik)',
      'HEALTHCHECK tanımlanmamış',
      'Gereksiz katmanlar (her RUN ayrı)',
      '.dockerignore eksik',
    ];
    const errorCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < errorCount; i++) {
      const idx = Math.floor(Math.random() * possibleErrors.length);
      errors.push(possibleErrors[idx]);
    }
  }

  // Ödül hesaplama (başarılıysa %80, başarısızsa %30)
  const rewardRatio = success ? 0.8 : 0.3;
  const moneyReward = Math.floor(mission.reward.money * rewardRatio);
  const careerReward = Math.floor(mission.reward.careerPoints * rewardRatio * 0.5); // Delege edilen göreve yarım KP

  return {
    success,
    employeeName: employee.name,
    missionTitle: mission.title,
    errors,
    moneyReward,
    careerReward,
    needsReview: !success,
    reviewFeedback: success
      ? `${employee.name} görevi başarıyla tamamladı! ✅`
      : `${employee.name} hatalı bir Dockerfile üretti. İncelemeniz gerekiyor. ❌`,
  };
}

// Müşteri şablonları (portföy yönetimi)
const CLIENT_TEMPLATES = [
  { name: 'Startup X',     sector: 'Fintech',      baseIncome: 200, satisfaction: 80 },
  { name: 'MediCorp',      sector: 'Sağlık',       baseIncome: 350, satisfaction: 75 },
  { name: 'EduTech A.Ş.',  sector: 'Eğitim',       baseIncome: 150, satisfaction: 85 },
  { name: 'LogiFlow',      sector: 'Lojistik',     baseIncome: 280, satisfaction: 70 },
  { name: 'GreenEnergy',   sector: 'Enerji',       baseIncome: 400, satisfaction: 65 },
  { name: 'GameStudio',    sector: 'Oyun',         baseIncome: 250, satisfaction: 90 },
];

/**
 * Yeni müşteri çekme şansı hesaplar (şirket itibarına göre).
 */
export function tryAcquireClient(reputation) {
  const chance = reputation / 200; // Max %50
  if (Math.random() < chance) {
    const template = CLIENT_TEMPLATES[Math.floor(Math.random() * CLIENT_TEMPLATES.length)];
    return {
      acquired: true,
      client: {
        ...template,
        id: `client_${Date.now()}`,
        startDay: null,
      },
    };
  }
  return { acquired: false };
}

/**
 * Aylık finans raporu hesaplar.
 */
export function calculateMonthlyFinance(state) {
  const company = state.career.ownCompany;
  if (!company) return null;

  const employeeSalaries = company.employees.reduce((sum, e) => sum + e.salary, 0);
  const clientIncome = company.clients.reduce((sum, c) => sum + c.baseIncome, 0);
  const officeRent = company.monthlyRent;
  const passiveIncome = state.finance.monthlyPassiveIncome;

  return {
    income: {
      clientIncome,
      passiveIncome,
      total: clientIncome + passiveIncome,
    },
    expenses: {
      employeeSalaries,
      officeRent,
      personalRent: state.housing.monthlyRent,
      total: employeeSalaries + officeRent + state.housing.monthlyRent,
    },
    netProfit: (clientIncome + passiveIncome) - (employeeSalaries + officeRent + state.housing.monthlyRent),
  };
}
