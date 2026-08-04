/**
 * DockerfileParser.js — Dockerfile tokenizer ve AST üretici
 *
 * Desteklenen direktifler:
 * FROM, RUN, COPY, WORKDIR, EXPOSE, CMD, USER, ENV, ARG,
 * ENTRYPOINT, HEALTHCHECK, LABEL, ADD, VOLUME, STOPSIGNAL,
 * SHELL, ONBUILD
 *
 * Multi-stage build desteği: FROM ... AS name
 *
 * KURAL: Gerçek Docker daemon asla çalıştırılmaz.
 * Her şey parser + simülasyon katmanında kalır.
 */

const VALID_DIRECTIVES = new Set([
  'FROM', 'RUN', 'COPY', 'WORKDIR', 'EXPOSE', 'CMD', 'USER',
  'ENV', 'ARG', 'ENTRYPOINT', 'HEALTHCHECK', 'LABEL', 'ADD',
  'VOLUME', 'STOPSIGNAL', 'SHELL', 'ONBUILD',
]);

/**
 * Dockerfile metnini token'lara ayırır.
 * Her satır bir token'dır. Yorum satırları ve boş satırlar ayrılır.
 * Çok satırlı komutlar (backslash continuation) birleştirilir.
 *
 * @param {string} content - Dockerfile içeriği
 * @returns {Array<{ type: string, directive?: string, args: string, line: number }>}
 */
export function tokenize(content) {
  const rawLines = content.split('\n');
  const tokens = [];
  let i = 0;

  while (i < rawLines.length) {
    let line = rawLines[i].trim();
    const lineNum = i + 1;

    // Boş satır
    if (!line) {
      tokens.push({ type: 'empty', args: '', line: lineNum });
      i++;
      continue;
    }

    // Yorum satırı
    if (line.startsWith('#')) {
      tokens.push({ type: 'comment', args: line.slice(1).trim(), line: lineNum });
      i++;
      continue;
    }

    // Backslash continuation — çok satırlı komutları birleştir
    while (line.endsWith('\\') && i + 1 < rawLines.length) {
      line = line.slice(0, -1).trim() + ' ' + rawLines[i + 1].trim();
      i++;
    }

    // Direktif parse
    const spaceIdx = line.indexOf(' ');
    const directive = spaceIdx === -1 ? line : line.substring(0, spaceIdx);
    const args = spaceIdx === -1 ? '' : line.substring(spaceIdx + 1).trim();

    if (VALID_DIRECTIVES.has(directive.toUpperCase())) {
      tokens.push({
        type: 'directive',
        directive: directive.toUpperCase(),
        args,
        line: lineNum,
      });
    } else {
      tokens.push({
        type: 'unknown',
        directive: directive,
        args,
        line: lineNum,
        error: `Bilinmeyen direktif: ${directive}`,
      });
    }

    i++;
  }

  return tokens;
}

/**
 * Token listesinden AST (Abstract Syntax Tree) üretir.
 *
 * AST yapısı:
 * {
 *   stages: [
 *     {
 *       name: string | null,
 *       baseImage: string,
 *       tag: string,
 *       instructions: [
 *         { directive, args, parsed, line }
 *       ]
 *     }
 *   ],
 *   errors: [ { message, line } ],
 *   warnings: [ { message, line } ]
 * }
 */
export function buildAST(tokens) {
  const ast = {
    stages: [],
    errors: [],
    warnings: [],
  };

  let currentStage = null;

  for (const token of tokens) {
    if (token.type === 'empty' || token.type === 'comment') continue;

    if (token.type === 'unknown') {
      ast.errors.push({ message: token.error, line: token.line });
      continue;
    }

    // FROM — yeni stage başlat
    if (token.directive === 'FROM') {
      const fromParsed = parseFrom(token.args);
      currentStage = {
        name: fromParsed.alias,
        baseImage: fromParsed.image,
        tag: fromParsed.tag,
        instructions: [],
      };
      ast.stages.push(currentStage);
      continue;
    }

    // FROM olmadan direktif — hata
    if (!currentStage) {
      ast.errors.push({
        message: `FROM direktifi bekleniyor, ${token.directive} bulundu`,
        line: token.line,
      });
      continue;
    }

    // Direktifi parse et
    const parsed = parseDirective(token.directive, token.args);
    if (parsed.error) {
      ast.errors.push({ message: parsed.error, line: token.line });
    }
    if (parsed.warning) {
      ast.warnings.push({ message: parsed.warning, line: token.line });
    }

    currentStage.instructions.push({
      directive: token.directive,
      args: token.args,
      parsed,
      line: token.line,
    });
  }

  // FROM yoksa hata
  if (ast.stages.length === 0) {
    ast.errors.push({ message: 'Dockerfile\'da FROM direktifi bulunamadı', line: 1 });
  }

  return ast;
}

/**
 * FROM satırını parse eder.
 * Formatlar: image, image:tag, image AS alias, image:tag AS alias
 */
function parseFrom(args) {
  const asMatch = args.match(/^(.+?)\s+[Aa][Ss]\s+(\S+)$/);
  let imageStr, alias;

  if (asMatch) {
    imageStr = asMatch[1].trim();
    alias = asMatch[2].trim();
  } else {
    imageStr = args.trim();
    alias = null;
  }

  const colonIdx = imageStr.lastIndexOf(':');
  let image, tag;

  if (colonIdx > 0) {
    image = imageStr.substring(0, colonIdx);
    tag = imageStr.substring(colonIdx + 1);
  } else {
    image = imageStr;
    tag = 'latest';
  }

  return { image, tag, alias };
}

/**
 * Tek bir direktifi parse eder.
 */
function parseDirective(directive, args) {
  switch (directive) {
    case 'RUN':
      return parseRun(args);
    case 'COPY':
      return parseCopy(args);
    case 'WORKDIR':
      return { workdir: args };
    case 'EXPOSE':
      return { ports: args.split(/\s+/).map(Number).filter(Boolean) };
    case 'CMD':
      return parseJsonOrShell(args);
    case 'ENTRYPOINT':
      return parseJsonOrShell(args);
    case 'ENV':
      return parseEnv(args);
    case 'ARG':
      return parseArg(args);
    case 'USER':
      return { user: args };
    case 'LABEL':
      return parseLabel(args);
    case 'HEALTHCHECK':
      return { healthcheck: args };
    case 'ADD':
      return parseCopy(args); // ADD ve COPY benzer parse
    case 'VOLUME':
      return parseJsonOrShell(args);
    case 'SHELL':
      return parseJsonOrShell(args);
    case 'STOPSIGNAL':
      return { signal: args };
    case 'ONBUILD':
      return { onbuild: args };
    default:
      return { error: `Desteklenmeyen direktif: ${directive}` };
  }
}

function parseRun(args) {
  // JSON array format: ["executable", "param1", "param2"]
  if (args.startsWith('[')) {
    try {
      const parsed = JSON.parse(args);
      return { commands: parsed, shell: false };
    } catch {
      return { error: 'RUN JSON formatı geçersiz', commands: [args], shell: true };
    }
  }
  // Shell format — && ile birden fazla komut
  const commands = args.split('&&').map((c) => c.trim());
  return { commands, shell: true };
}

function parseCopy(args) {
  // --from=stage desteği
  const fromMatch = args.match(/^--from=(\S+)\s+(.+)$/);
  let source, fromStage;

  if (fromMatch) {
    fromStage = fromMatch[1];
    args = fromMatch[2];
  } else {
    fromStage = null;
  }

  const parts = args.split(/\s+/);
  const dest = parts.pop();
  const sources = parts;

  return { sources, dest, fromStage };
}

function parseEnv(args) {
  const eqIdx = args.indexOf('=');
  if (eqIdx !== -1) {
    return { key: args.substring(0, eqIdx).trim(), value: args.substring(eqIdx + 1).trim() };
  }
  // KEY VALUE format
  const parts = args.split(/\s+/, 2);
  return { key: parts[0], value: parts[1] || '' };
}

function parseArg(args) {
  const eqIdx = args.indexOf('=');
  if (eqIdx !== -1) {
    return { key: args.substring(0, eqIdx).trim(), defaultValue: args.substring(eqIdx + 1).trim() };
  }
  return { key: args.trim(), defaultValue: null };
}

function parseLabel(args) {
  const result = {};
  // key=value veya key="value" çiftleri
  const regex = /(\S+)=(?:"([^"]*)"|(\S+))/g;
  let match;
  while ((match = regex.exec(args)) !== null) {
    result[match[1]] = match[2] !== undefined ? match[2] : match[3];
  }
  return { labels: result };
}

function parseJsonOrShell(args) {
  if (args.startsWith('[')) {
    try {
      return { values: JSON.parse(args), shell: false };
    } catch {
      return { error: 'JSON formatı geçersiz', values: [args], shell: true };
    }
  }
  return { values: args.split(/\s+/), shell: true };
}

/**
 * Tam Dockerfile parse pipeline: content → tokens → AST
 */
export function parseDockerfile(content) {
  const tokens = tokenize(content);
  const ast = buildAST(tokens);
  return { tokens, ast };
}
