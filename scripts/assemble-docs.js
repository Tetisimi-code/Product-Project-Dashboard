const fs = require('fs');
const path = require('path');
const { createReport } = require('docx-templates');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function replaceVariables(content, variables) {
  return content.replace(/\{\{([a-z0-9_]+)\}\}/gi, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      return String(variables[key]);
    }
    return match;
  });
}

function markdownToPlain(content) {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*-\s+/gm, '• ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\n{3,}/g, '\n\n');
}

async function main() {
  const args = process.argv.slice(2);
  const configPath = args[0] || 'docs/project-config.sample.json';
  const outputPath = args[1] || 'public/user-manual.md';
  const templatePath = args[2] || 'docs/template.docx';

  const config = readJson(configPath);
  const map = readJson('docs/product-module-map.json');

  const enabledProducts = config.enabledProducts || [];
  const modules = enabledProducts.flatMap((product) => map[product] || []);

  if (modules.length === 0) {
    console.error('No modules found for enabled products.');
    process.exit(1);
  }

  const variables = config.variables || {};
  const rendered = modules.map((modulePath) => {
    const content = fs.readFileSync(modulePath, 'utf8');
    return replaceVariables(content, variables).trim();
  });

  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  if (outputPath.toLowerCase().endsWith('.docx')) {
    if (!fs.existsSync(templatePath)) {
      console.error(`Template not found: ${templatePath}`);
      process.exit(1);
    }
    const template = fs.readFileSync(templatePath);
    const plainContent = markdownToPlain(rendered.join('\n\n')) + '\n';
    const report = await createReport({
      template,
      data: { DOCUMENT_CONTENT: plainContent },
      cmdDelimiter: ['{{', '}}'],
    });
    fs.writeFileSync(outputPath, report);
  } else {
    const markdownOutput = rendered.join('\n\n---\n\n') + '\n';
    fs.writeFileSync(outputPath, markdownOutput, 'utf8');
  }

  console.log(`Wrote ${modules.length} modules to ${outputPath}`);
}

main().catch((error) => {
  console.error('Assembly failed:', error);
  process.exit(1);
});
