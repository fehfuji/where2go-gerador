// ============================================
// Google Apps Script — Where2GO Gerador
// ============================================
// COMO CONFIGURAR:
// 1. Abra https://script.google.com
// 2. Crie um novo projeto
// 3. Cole este código inteiro
// 4. Clique em "Implantar" > "Nova implantação"
// 5. Tipo: "App da Web"
// 6. Executar como: "Eu" (sua conta)
// 7. Quem tem acesso: "Qualquer pessoa"
// 8. Clique em "Implantar" e copie a URL gerada
// 9. Cole essa URL na engrenagem do gerador (campo "URL do Google Sheets")
// ============================================

const SHEET_NAME = 'Experiências';
const NOTIFY_EMAIL = 'fernanda.fujishima@w2go.com.br';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Salvar na planilha
    salvarNaPlanilha(data);

    // Enviar notificação por email
    enviarEmail(data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Também aceita GET pra teste
function doGet(e) {
  return ContentService
    .createTextOutput('Where2GO Webhook ativo!')
    .setMimeType(ContentService.MimeType.TEXT);
}

function salvarNaPlanilha(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Cria a aba se não existir, com cabeçalhos
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Data/Hora',
      'Contato — Nome',
      'Contato — Email',
      'Contato — WhatsApp',
      'Contato — Cargo',
      'Estabelecimento',
      'Telefone Estab.',
      'Bairro',
      'Instagram',
      'Experiência — Nome',
      'Ocasião',
      'Público',
      'Tipo Combo',
      'Itens Inclusos',
      'Elemento Especial',
      'Descrição Curta',
      'Descrição Completa',
      'Preço',
      'Formato Preço',
      'Tag'
    ]);
    // Formata cabeçalho
    sheet.getRange(1, 1, 1, 20).setFontWeight('bold').setBackground('#F03637').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.contato_nome || '',
    data.contato_email || '',
    data.contato_whatsapp || '',
    data.contato_cargo || '',
    data.estabelecimento || '',
    data.estabelecimento_telefone || '',
    data.estabelecimento_bairro || '',
    data.estabelecimento_instagram || '',
    data.experiencia_nome || '',
    data.experiencia_ocasiao || '',
    data.experiencia_publico || '',
    data.experiencia_tipo_combo || '',
    data.experiencia_itens || '',
    data.experiencia_especial || '',
    data.experiencia_desc_curta || '',
    data.experiencia_desc_completa || '',
    data.experiencia_preco || '',
    data.experiencia_preco_formato || '',
    data.experiencia_tag || ''
  ]);
}

function enviarEmail(data) {
  const assunto = `Nova experiência Where2GO: ${data.experiencia_nome} — ${data.estabelecimento}`;

  const corpo = `
Nova experiência enviada para revisão!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTATO (LEAD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome: ${data.contato_nome}
Email: ${data.contato_email}
WhatsApp: ${data.contato_whatsapp}
Cargo: ${data.contato_cargo || 'Não informado'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTABELECIMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome: ${data.estabelecimento}
Telefone: ${data.estabelecimento_telefone || 'Não informado'}
Bairro: ${data.estabelecimento_bairro || 'Não informado'}
Instagram: ${data.estabelecimento_instagram || 'Não informado'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXPERIÊNCIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome: ${data.experiencia_nome}
Ocasião: ${data.experiencia_ocasiao}
Público: ${data.experiencia_publico}
Combo: ${data.experiencia_tipo_combo}
Itens: ${data.experiencia_itens}
Elemento especial: ${data.experiencia_especial}
Preço: R$${data.experiencia_preco} ${data.experiencia_preco_formato}
Tag: ${data.experiencia_tag}

Descrição curta:
${data.experiencia_desc_curta}

Descrição completa:
${data.experiencia_desc_completa}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Enviado em: ${data.timestamp}
Gerado pelo Where2GO Gerador de Experiências
`.trim();

  GmailApp.sendEmail(NOTIFY_EMAIL, assunto, corpo);
}
