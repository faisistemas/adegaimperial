import { Order, Product, Store } from '../types';

/**
 * Gera uma chave de acesso válida de 44 dígitos para NFC-e (modelo 65) ou NF-e (modelo 55)
 * Formato: cUF (2) + AAMM (4) + CNPJ (14) + mod (2) + serie (3) + nNF (9) + tpEmis (1) + cNF (8) + cDV (1)
 */
export function generateNfceKey(cnpj: string, orderNumber: number, model: '65' | '55' = '65'): { key: string; protocol: string } {
  const cleanCnpj = cnpj.replace(/\D/g, '').padStart(14, '0');
  const uf = '35'; // São Paulo
  const aamm = '2609'; // Setembro de 2026
  const mod = model;
  const serie = '001';
  const nNf = String(orderNumber).padStart(9, '0');
  const tpEmis = '1'; // Emissão normal
  const cNf = Math.floor(10000000 + Math.random() * 90000000).toString();
  
  const base43 = `${uf}${aamm}${cleanCnpj}${mod}${serie}${nNf}${tpEmis}${cNf}`;
  
  // Cálculo do dígito verificador Módulo 11
  let sum = 0;
  let weight = 2;
  for (let i = base43.length - 1; i >= 0; i--) {
    sum += parseInt(base43[i], 10) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const remainder = sum % 11;
  const dv = remainder === 0 || remainder === 1 ? 0 : 11 - remainder;
  
  const key = `${base43}${dv}`;
  const protocol = `13526${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  
  return { key, protocol };
}

/**
 * Formata chave de 44 dígitos em grupos de 4
 */
export function formatAccessKey(key: string): string {
  return key.replace(/(\d{4})/g, '$1 ').trim();
}

/**
 * Gera o arquivo oficial SPED Fiscal (EFD ICMS/IPI) em formato texto TXT
 */
export function generateSpedFiscalText(store: Store, orders: Order[], products: Product[]): string {
  const cnpjClean = store.cnpj.replace(/\D/g, '');
  const lines: string[] = [];

  // Bloco 0: Abertura e Identificação
  lines.push(`|0000|015|0|01092026|30092026|${store.name.toUpperCase()}|${cnpjClean}|SP|${store.ie.replace(/\D/g, '')}|3550308|||A|1|`);
  lines.push('|0001|0|');
  lines.push('|0005|ADEGASWG BEBIDAS LTDA|01415000|ALAMEDA LORENA|1420||JARDINS|1130889900||contato@adegaswg.com.br|');
  lines.push('|0100|MARCOS VINICIUS CONTABILIDADE|12345678000199|123456|1199998888|fiscal@contabilidade.com.br|3550308|');

  // Cadastro de Participantes / Clientes (0150)
  lines.push('|0150|CLI001|CONSUMIDOR FINAL VAREJO|1058||||||3550308||||');

  // Cadastro de Produtos da Adega (0200) com destaque para doses e bebidas fracionadas
  products.forEach((prod) => {
    const un = prod.isFractionable ? 'ML' : (prod.isWeighed ? 'KG' : 'UN');
    const desc = prod.isFractionable 
      ? `${prod.name.toUpperCase()} (FRACIONAVEL ${prod.doseVolumeMl}ML)`
      : prod.name.toUpperCase();
    lines.push(`|0200|${prod.id}|${desc}|||${un}|00|${prod.ncm.replace(/\D/g, '')}||||||`);
  });

  // Bloco C: Documentos Fiscais (NFC-e modelo 65)
  lines.push('|C001|0|');
  orders.forEach((order, index) => {
    const orderNum = index + 1;
    const dateFormatted = '15092026';
    const totalFormatted = order.total.toFixed(2).replace('.', ',');
    const key = order.nfceKey || generateNfceKey(store.cnpj, orderNum).key;
    
    // C100: Nota Fiscal de Consumidor Eletrônica
    lines.push(`|C100|1|0|CLI001|65|00|001|${orderNum}|${key}|${dateFormatted}|${dateFormatted}|${totalFormatted}|1|0,00|0,00|${totalFormatted}|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|`);
    
    // C170: Itens do documento com especificação de dose
    order.items.forEach((item, itemIdx) => {
      const itemNum = itemIdx + 1;
      const descItem = item.isDose ? `DOSE ${item.product.doseVolumeMl || 50}ML ${item.product.name}` : item.product.name;
      const qtdFormatted = item.quantity.toFixed(3).replace('.', ',');
      const unitValueFormatted = item.unitPrice.toFixed(2).replace('.', ',');
      const totalItemFormatted = item.totalPrice.toFixed(2).replace('.', ',');
      lines.push(`|C170|${itemNum}|${item.product.id}|${descItem.toUpperCase()}|${qtdFormatted}|${item.isDose ? 'ML' : 'UN'}|${totalItemFormatted}|0,00|0|${item.product.cstIcms}|${item.product.cfop}|0,00|0,00|0,00|0,00|0,00|0,00|`);
    });
  });

  // Bloco E: Apuração do ICMS
  lines.push('|E001|0|');
  lines.push('|E100|01092026|30092026|');
  lines.push('|E110|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|');

  // Bloco H: Inventário Físico do Estoque de Bebidas (Art. 269 do RICMS / Bloco H da EFD)
  const totalValorEstoque = products.reduce((acc, p) => acc + ((p.stockUnits ?? 0) * (p.costPrice ?? 0)), 0);
  lines.push('|H001|0|');
  lines.push(`|H005|30092026|${(totalValorEstoque ?? 0).toFixed(2).replace('.', ',')}|01|`);
  products.forEach((prod) => {
    const valorTotalProd = ((prod.stockUnits ?? 0) * (prod.costPrice ?? 0)).toFixed(2).replace('.', ',');
    const custoUnit = (prod.costPrice ?? 0).toFixed(2).replace('.', ',');
    const un = prod.isFractionable ? 'ML' : (prod.isWeighed ? 'KG' : 'UN');
    lines.push(`|H010|${prod.id}|${un}|${(prod.stockUnits ?? 0).toFixed(3).replace('.', ',')}|${custoUnit}|${valorTotalProd}|0||1.1.03.01.001|||`);
  });

  // Bloco 9: Encerramento do Arquivo
  lines.push('|9001|0|');
  lines.push(`|9900|0000|1|`);
  lines.push(`|9900|0200|${products.length}|`);
  lines.push(`|9900|C100|${orders.length}|`);
  lines.push(`|9900|H005|1|`);
  lines.push(`|9900|H010|${products.length}|`);
  lines.push('|9999|' + (lines.length + 2) + '|');

  return lines.join('\r\n');
}

/**
 * Gera arquivo oficial Sintegra (.txt) padrão SEFAZ Brasil
 */
export function generateSintegraText(store: Store, orders: Order[]): string {
  const cnpjClean = store.cnpj.replace(/\D/g, '').padEnd(14, ' ');
  const ieClean = store.ie.replace(/\D/g, '').padEnd(14, ' ');
  const storeName = store.name.padEnd(35, ' ').substring(0, 35);
  const city = store.city.padEnd(30, ' ').substring(0, 30);
  const lines: string[] = [];

  // Registro 10: Mestre do Estabelecimento
  lines.push(`10${cnpjClean}${ieClean}${storeName}${city}SP11308899002026090120260930331`);

  // Registro 11: Dados complementares
  lines.push(`11ALAMEDA LORENA                                 01420JARDINS             01415000CARLOS ALBUQUERQUE            1130889900`);

  // Registro 60M / 60A: Resumo Diário ECF / NFC-e
  orders.forEach((order, idx) => {
    const valor = Math.round(order.total * 100).toString().padStart(12, '0');
    const seq = String(idx + 1).padStart(6, '0');
    lines.push(`60M2026091512345678000199001${seq}000001000050${valor}`);
    lines.push(`60A2026091512345678000199T1800${valor}`);
  });

  // Registro 90: Totalização do arquivo
  lines.push(`90${cnpjClean}${ieClean}100000016000000299${String(lines.length + 1).padStart(8, '0')}1`);

  return lines.join('\r\n');
}

/**
 * Gera o payload BR Code padrão PIX do Banco Central do Brasil
 */
export function generatePixPayload(key: string, name: string, city: string, amount: number, txid: string = 'ADEGA'): string {
  const formatField = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  const payloadFormatIndicator = formatField('00', '01');
  const merchantAccountInformation = formatField('26', 
    formatField('00', 'br.gov.bcb.pix') + 
    formatField('01', key)
  );
  const merchantCategoryCode = formatField('52', '0000');
  const transactionCurrency = formatField('53', '986'); // BRL
  const transactionAmount = formatField('54', (amount ?? 0).toFixed(2));
  const countryCode = formatField('58', 'BR');
  const merchantName = formatField('59', name.substring(0, 25).toUpperCase());
  const merchantCity = formatField('60', city.substring(0, 15).toUpperCase());
  const additionalDataField = formatField('62', formatField('05', txid));

  const rawPayload = `${payloadFormatIndicator}${merchantAccountInformation}${merchantCategoryCode}${transactionCurrency}${transactionAmount}${countryCode}${merchantName}${merchantCity}${additionalDataField}6304`;

  // CRC16 CCITT
  let crc = 0xFFFF;
  for (let i = 0; i < rawPayload.length; i++) {
    crc ^= (rawPayload.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');
  return `${rawPayload}${crcHex}`;
}
