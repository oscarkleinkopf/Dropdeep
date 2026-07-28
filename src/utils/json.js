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

export function cleanAndParseJSON(rawText) {
  let text = cleanMarkdownJSON(rawText);
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn("Fallo al parsear JSON directamente, intentando reparar...");
    let repaired = repairTruncatedJSON(text);
    try {
      return JSON.parse(repaired);
    } catch (err) {
      console.warn("La reparación básica falló, intentando reparación por recorte progresivo...");
      while (repaired.length > 2) {
        repaired = repaired.slice(0, -1).trim();
        let tempRepaired = repairTruncatedJSON(repaired);
        try {
          return JSON.parse(tempRepaired);
        } catch (e3) {
          // Continuar recortando
        }
      }
      throw err; // Si todo falla, lanzar el error original
    }
  }
}
