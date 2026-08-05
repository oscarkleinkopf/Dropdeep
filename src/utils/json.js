export function cleanMarkdownJSON(text) {
  let clean = text.trim();
  
  // Find the boundaries of the JSON object
  const startIdx = clean.indexOf('{');
  const endIdx = clean.lastIndexOf('}');
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    clean = clean.substring(startIdx, endIdx + 1);
  }
  
  // Reemplazar saltos de línea y tabulaciones reales dentro de strings de JSON
  let result = "";
  let inString = false;
  let escape = false;
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char === '"' && !escape) {
      inString = !inString;
    }
    
    if (inString) {
      if (char === '\n') {
        result += "\\n";
      } else if (char === '\r') {
        result += "\\r";
      } else if (char === '\t') {
        result += "\\t";
      } else {
        result += char;
      }
    } else {
      result += char;
    }
    
    // Track escape char
    if (char === '\\' && !escape) {
      escape = true;
    } else {
      escape = false;
    }
  }
  
  return result.trim();
}

export function repairTruncatedJSON(jsonString) {
  let clean = jsonString.trim();
  
  // Find the first '{'
  const firstBrace = clean.indexOf('{');
  if (firstBrace === -1) return clean;
  clean = clean.substring(firstBrace);
  
  let inString = false;
  let escape = false;
  const stack = [];
  
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    
    if (escape) {
      escape = false;
      continue;
    }
    
    if (char === '\\') {
      escape = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (inString) {
      continue;
    }
    
    if (char === '{' || char === '[') {
      stack.push(char);
    } else if (char === '}') {
      if (stack.length > 0 && stack[stack.length - 1] === '{') {
        stack.pop();
      }
    } else if (char === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === '[') {
        stack.pop();
      }
    }
  }
  
  // If we cut off inside a string, close the string quote
  if (inString) {
    clean += '"';
  }
  
  clean = clean.trim();
  
  // Strip trailing invalid syntax before appending closures
  let changed = true;
  while (changed) {
    changed = false;
    if (clean.endsWith(',')) {
      clean = clean.slice(0, -1).trim();
      changed = true;
    }
    if (clean.endsWith(':')) {
      clean = clean.slice(0, -1).trim();
      // Strip key name (e.g. "description")
      if (clean.endsWith('"')) {
        clean = clean.slice(0, -1);
        const lastQuote = clean.lastIndexOf('"');
        if (lastQuote !== -1) {
          clean = clean.substring(0, lastQuote).trim();
        }
      }
      changed = true;
    }
  }
  
  // Close remaining open braces/brackets
  while (stack.length > 0) {
    const lastOpen = stack.pop();
    if (lastOpen === '{') {
      clean += '}';
    } else if (lastOpen === '[') {
      clean += ']';
    }
  }
  
  return clean;
}

/**
 * Mensaje accionable para fallos de JSON.parse / reparación (T06).
 */
export function formatJsonParseError(err, rawText = '') {
  const raw = String(rawText || '');
  const tips = [];

  if (/```/.test(raw)) {
    tips.push(
      '¿Incluiste un bloque ```json? Quita el markdown y deja solo el objeto { … }.',
    );
  }
  if (looksLikeTruncatedJson(raw) || /Unexpected end of JSON/i.test(err?.message || '')) {
    tips.push(
      'Parece JSON truncado (faltan }). Espera a que el chatbot termine o copia la respuesta completa.',
    );
  }
  if (/[“”‘’]/.test(raw)) {
    tips.push('Hay comillas tipográficas (“ ”); usa solo comillas dobles rectas (").');
  }
  if (tips.length === 0) {
    tips.push(
      'Pega únicamente un objeto JSON válido, sin texto antes ni después. Revisa comas y comillas.',
    );
  }

  return `JSON inválido o truncado. ${tips.join(' ')} Usa «Reintentar» para pegar de nuevo.`;
}

function looksLikeTruncatedJson(raw) {
  const s = String(raw || '').trim();
  if (s === '{' || s === '[') return true;
  const opens = (s.match(/\{/g) || []).length;
  const closes = (s.match(/\}/g) || []).length;
  return opens > closes;
}

function isEmptyObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  );
}

export function cleanAndParseJSON(rawText) {
  const original = String(rawText);
  let text = cleanMarkdownJSON(rawText);
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn("Fallo al parsear JSON directamente, intentando reparar...");
    let repaired = repairTruncatedJSON(text);
    try {
      const repairedParsed = JSON.parse(repaired);
      // `{` alone repairs to `{}` — treat as truncation, not a valid paste
      if (looksLikeTruncatedJson(original) && isEmptyObject(repairedParsed)) {
        throw new Error(formatJsonParseError(e, original));
      }
      return repairedParsed;
    } catch (err) {
      if (err?.message && /JSON inválido|truncado/i.test(err.message)) {
        throw err;
      }
      console.warn("La reparación básica falló, intentando reparación por recorte progresivo...");
      while (repaired.length > 2) {
        repaired = repaired.slice(0, -1).trim();
        let tempRepaired = repairTruncatedJSON(repaired);
        try {
          const sliced = JSON.parse(tempRepaired);
          if (looksLikeTruncatedJson(original) && isEmptyObject(sliced)) {
            continue;
          }
          return sliced;
        } catch (e3) {
          // Continuar recortando
        }
      }
      throw new Error(formatJsonParseError(err, original));
    }
  }
}
