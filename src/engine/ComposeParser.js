/**
 * ComposeParser.js — Docker Compose YAML ayrıştırıcı
 *
 * docker-compose.yml dosyalarını parse eder:
 * services, ports, volumes, networks, depends_on, env_file, deploy.resources
 *
 * Gerçek YAML parser yerine basitleştirilmiş satır tabanlı parser kullanılır
 * (harici bağımlılık yok — oyun içi simülasyon için yeterli).
 */

/**
 * Basit YAML tokenizer — indent tabanlı yapı algılama.
 * @param {string} content - YAML içeriği
 * @returns {Array} - Token listesi
 */
export function tokenizeYAML(content) {
  const lines = content.split('\n');
  const tokens = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trimEnd();

    // Boş satır
    if (trimmed.length === 0) continue;

    // Yorum satırı
    if (trimmed.trimStart().startsWith('#')) {
      tokens.push({ type: 'comment', line: i + 1, value: trimmed.trim() });
      continue;
    }

    // Indent seviyesi hesapla (2 boşluk = 1 seviye)
    const indent = raw.length - raw.trimStart().length;
    const level = Math.floor(indent / 2);

    // Liste elemanı mı?
    const listMatch = trimmed.trimStart().match(/^-\s+(.*)/);
    if (listMatch) {
      tokens.push({ type: 'list_item', line: i + 1, level, value: listMatch[1].trim() });
      continue;
    }

    // Key: value çifti mi?
    const kvMatch = trimmed.trimStart().match(/^([^:]+):\s*(.*)/);
    if (kvMatch) {
      const key = kvMatch[1].trim();
      const value = kvMatch[2].trim();
      tokens.push({
        type: value ? 'key_value' : 'key_only',
        line: i + 1,
        level,
        key,
        value: value || null,
      });
      continue;
    }

    // Tanınmayan satır
    tokens.push({ type: 'unknown', line: i + 1, level, value: trimmed.trim() });
  }

  return tokens;
}

/**
 * Token'lardan Compose yapısını oluşturur.
 * @param {Array} tokens
 * @returns {Object} - Compose AST
 */
function buildComposeAST(tokens) {
  const ast = {
    version: null,
    services: {},
    networks: {},
    volumes: {},
    errors: [],
  };

  let currentSection = null;   // 'services', 'networks', 'volumes'
  let currentService = null;
  let currentKey = null;        // Servis içindeki alt anahtar (ports, volumes, vb.)

  for (const token of tokens) {
    if (token.type === 'comment') continue;

    // Üst seviye anahtarlar (level 0)
    if (token.level === 0 && (token.type === 'key_value' || token.type === 'key_only')) {
      if (token.key === 'version') {
        ast.version = token.value?.replace(/['"]/g, '') || null;
      } else if (token.key === 'services') {
        currentSection = 'services';
        currentService = null;
        currentKey = null;
      } else if (token.key === 'networks') {
        currentSection = 'networks';
        currentService = null;
      } else if (token.key === 'volumes') {
        currentSection = 'volumes';
        currentService = null;
      }
      continue;
    }

    // Services bölümü
    if (currentSection === 'services') {
      // Servis adı (level 1)
      if (token.level === 1 && (token.type === 'key_only' || token.type === 'key_value')) {
        currentService = token.key;
        currentKey = null;
        ast.services[currentService] = {
          image: null,
          build: null,
          ports: [],
          volumes: [],
          environment: [],
          depends_on: [],
          networks: [],
          command: null,
          env_file: [],
          deploy: {},
          restart: null,
          container_name: null,
        };
        // Eğer key_value ise (tek satır servis tanımı — nadir)
        if (token.value) {
          ast.services[currentService].image = token.value;
        }
        continue;
      }

      // Servis özellikleri (level 2)
      if (token.level === 2 && currentService) {
        if (token.type === 'key_value') {
          const svc = ast.services[currentService];
          switch (token.key) {
            case 'image':
              svc.image = token.value;
              break;
            case 'build':
              svc.build = token.value || '.';
              break;
            case 'container_name':
              svc.container_name = token.value;
              break;
            case 'command':
              svc.command = token.value;
              break;
            case 'restart':
              svc.restart = token.value;
              break;
            default:
              currentKey = token.key;
          }
        } else if (token.type === 'key_only') {
          currentKey = token.key;
          // deploy gibi iç içe yapılar
          if (token.key === 'deploy') {
            ast.services[currentService].deploy = {};
          }
        }
        continue;
      }

      // Liste elemanları (level 3) — ports, volumes, depends_on, environment, networks
      if (token.level === 3 && currentService && token.type === 'list_item') {
        const svc = ast.services[currentService];
        if (currentKey === 'ports') {
          const portMatch = token.value.match(/["']?(\d+):(\d+)["']?/);
          if (portMatch) {
            svc.ports.push({ host: parseInt(portMatch[1]), container: parseInt(portMatch[2]) });
          } else {
            svc.ports.push({ raw: token.value });
          }
        } else if (currentKey === 'volumes') {
          svc.volumes.push(token.value.replace(/['"]/g, ''));
        } else if (currentKey === 'depends_on') {
          svc.depends_on.push(token.value);
        } else if (currentKey === 'environment') {
          svc.environment.push(token.value);
        } else if (currentKey === 'networks') {
          svc.networks.push(token.value);
        } else if (currentKey === 'env_file') {
          svc.env_file.push(token.value);
        }
        continue;
      }

      // Environment key:value formatı (level 3)
      if (token.level === 3 && currentService && currentKey === 'environment' && token.type === 'key_value') {
        ast.services[currentService].environment.push(`${token.key}=${token.value}`);
        continue;
      }

      // Deploy alt anahtarları (level 3-4)
      if (token.level >= 3 && currentService && currentKey === 'deploy') {
        if (token.type === 'key_value') {
          ast.services[currentService].deploy[token.key] = token.value;
        }
        continue;
      }
    }

    // Networks bölümü (basit — sadece isim topla)
    if (currentSection === 'networks' && token.level === 1) {
      ast.networks[token.key] = { driver: null };
      continue;
    }

    // Volumes bölümü (basit — sadece isim topla)
    if (currentSection === 'volumes' && token.level === 1) {
      ast.volumes[token.key] = {};
      continue;
    }
  }

  // Doğrulama
  if (Object.keys(ast.services).length === 0) {
    ast.errors.push({ line: 0, message: 'services bölümü bulunamadı veya boş' });
  }

  for (const [name, svc] of Object.entries(ast.services)) {
    if (!svc.image && !svc.build) {
      ast.errors.push({ line: 0, message: `${name}: image veya build belirtilmeli` });
    }
    // depends_on doğrulama
    for (const dep of svc.depends_on) {
      if (!ast.services[dep]) {
        ast.errors.push({ line: 0, message: `${name}: depends_on "${dep}" servisi tanımlı değil` });
      }
    }
  }

  return ast;
}

/**
 * Docker Compose dosyasını parse eder.
 * @param {string} content - docker-compose.yml içeriği
 * @returns {{ tokens: Array, ast: Object }}
 */
export function parseCompose(content) {
  const tokens = tokenizeYAML(content);
  const ast = buildComposeAST(tokens);
  return { tokens, ast };
}

/**
 * Compose AST'sinden simüle edilmiş `docker compose up` log'u üretir.
 * @param {Object} ast - Compose AST
 * @returns {string[]} - Log satırları
 */
export function generateComposeUpLogs(ast) {
  const logs = [];
  const services = Object.entries(ast.services);
  const networkName = Object.keys(ast.networks)[0] || 'default';

  logs.push(`[+] Running docker compose up`);
  logs.push(`[+] Creating network "${networkName}" with the default driver`);

  // Bağımlılık sırası hesapla (basit topolojik sıralama)
  const order = topologicalSort(ast.services);

  for (const name of order) {
    const svc = ast.services[name];
    const image = svc.image || `${name}:latest`;

    if (svc.build) {
      logs.push(`[+] Building ${name}`);
      logs.push(`  => [internal] load build context`);
      logs.push(`  => CACHED [1/3] FROM docker.io/library/${image}`);
      logs.push(`  => [2/3] COPY . .`);
      logs.push(`  => [3/3] RUN install dependencies`);
      logs.push(`  => exporting to image`);
      logs.push(`  => naming to docker.io/library/${name}:latest`);
    } else {
      logs.push(`[+] Pulling ${image}`);
      logs.push(`  => Pulling from library/${image.split(':')[0]}`);
      logs.push(`  => Digest: sha256:${randomHex(12)}`);
      logs.push(`  => Status: Downloaded newer image`);
    }

    logs.push(`[+] Creating container ${svc.container_name || name + '_1'}`);

    if (svc.ports.length > 0) {
      for (const p of svc.ports) {
        if (p.host && p.container) {
          logs.push(`  => Port mapping: ${p.host}:${p.container}`);
        }
      }
    }

    if (svc.volumes.length > 0) {
      logs.push(`  => Volumes: ${svc.volumes.length} mount(s)`);
    }

    logs.push(`[+] Starting ${name}_1 ... done`);
  }

  logs.push('');
  logs.push(`Attaching to ${order.map((n) => n + '_1').join(', ')}`);

  for (const name of order) {
    logs.push(`${name}_1  | Service started successfully`);
  }

  return logs;
}

/**
 * Compose AST'sinden simüle edilmiş `docker compose down` log'u üretir.
 */
export function generateComposeDownLogs(ast) {
  const logs = [];
  const services = Object.keys(ast.services).reverse();

  logs.push('[+] Running docker compose down');
  for (const name of services) {
    logs.push(`[+] Stopping ${name}_1 ... done`);
  }
  for (const name of services) {
    logs.push(`[+] Removing ${name}_1 ... done`);
  }
  const networkName = Object.keys(ast.networks)[0] || 'default';
  logs.push(`[+] Removing network ${networkName}`);

  return logs;
}

/**
 * Basit topolojik sıralama (depends_on için).
 */
function topologicalSort(services) {
  const visited = new Set();
  const result = [];

  function visit(name) {
    if (visited.has(name)) return;
    visited.add(name);
    const svc = services[name];
    if (svc) {
      for (const dep of svc.depends_on) {
        visit(dep);
      }
    }
    result.push(name);
  }

  for (const name of Object.keys(services)) {
    visit(name);
  }
  return result;
}

/**
 * Rastgele hex string üretir (log dekorasyonu için).
 */
function randomHex(len) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}
