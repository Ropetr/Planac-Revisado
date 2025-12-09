/**
 * Funções auxiliares do sistema PLANAC ERP
 */

// ==================== VALIDAÇÃO ====================

/**
 * Valida CPF
 */
export function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

/**
 * Valida CNPJ
 */
export function validarCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
}

/**
 * Valida CPF ou CNPJ automaticamente
 */
export function validarCpfCnpj(documento: string): boolean {
  const numeros = documento.replace(/[^\d]/g, '');
  if (numeros.length === 11) return validarCPF(documento);
  if (numeros.length === 14) return validarCNPJ(documento);
  return false;
}

/**
 * Valida email
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida telefone brasileiro
 */
export function validarTelefone(telefone: string): boolean {
  const numeros = telefone.replace(/[^\d]/g, '');
  return numeros.length >= 10 && numeros.length <= 11;
}

/**
 * Valida CEP
 */
export function validarCEP(cep: string): boolean {
  const numeros = cep.replace(/[^\d]/g, '');
  return numeros.length === 8;
}

// ==================== FORMATAÇÃO ====================

/**
 * Formata CPF: 000.000.000-00
 */
export function formatarCPF(cpf: string): string {
  const numeros = cpf.replace(/[^\d]/g, '');
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
export function formatarCNPJ(cnpj: string): string {
  const numeros = cnpj.replace(/[^\d]/g, '');
  return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata CPF ou CNPJ automaticamente
 */
export function formatarCpfCnpj(documento: string): string {
  const numeros = documento.replace(/[^\d]/g, '');
  if (numeros.length === 11) return formatarCPF(documento);
  if (numeros.length === 14) return formatarCNPJ(documento);
  return documento;
}

/**
 * Formata telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/[^\d]/g, '');
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

/**
 * Formata CEP: 00000-000
 */
export function formatarCEP(cep: string): string {
  const numeros = cep.replace(/[^\d]/g, '');
  return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Formata valor monetário: R$ 1.234,56
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata número: 1.234,56
 */
export function formatarNumero(valor: number, casasDecimais: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais
  }).format(valor);
}

/**
 * Formata data: DD/MM/YYYY
 */
export function formatarData(data: Date | string): string {
  const d = typeof data === 'string' ? new Date(data) : data;
  return d.toLocaleDateString('pt-BR');
}

/**
 * Formata data e hora: DD/MM/YYYY HH:mm
 */
export function formatarDataHora(data: Date | string): string {
  const d = typeof data === 'string' ? new Date(data) : data;
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// ==================== STRINGS ====================

/**
 * Remove acentos de uma string
 */
export function removerAcentos(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Gera slug a partir de uma string
 */
export function gerarSlug(str: string): string {
  return removerAcentos(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Retorna apenas números de uma string
 */
export function apenasNumeros(str: string): string {
  return str.replace(/[^\d]/g, '');
}

/**
 * Capitaliza primeira letra de cada palavra
 */
export function capitalizar(str: string): string {
  return str.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

/**
 * Trunca string com reticências
 */
export function truncar(str: string, tamanho: number): string {
  if (str.length <= tamanho) return str;
  return str.substring(0, tamanho - 3) + '...';
}

// ==================== SEGURANÇA ====================

/**
 * Gera hash de senha usando Web Crypto API
 */
export async function hashSenha(senha: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(senha);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifica se senha corresponde ao hash
 */
export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  const senhaHash = await hashSenha(senha);
  return senhaHash === hash;
}

/**
 * Gera token aleatório
 */
export function gerarToken(tamanho: number = 32): string {
  const array = new Uint8Array(tamanho);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Gera código numérico aleatório
 */
export function gerarCodigoNumerico(tamanho: number = 6): string {
  const array = new Uint8Array(tamanho);
  crypto.getRandomValues(array);
  return Array.from(array, b => (b % 10).toString()).join('');
}

// ==================== DATAS ====================

/**
 * Retorna data atual no formato ISO
 */
export function dataAtualISO(): string {
  return new Date().toISOString();
}

/**
 * Retorna data atual no formato YYYY-MM-DD
 */
export function dataAtualSQL(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calcula dias entre duas datas
 */
export function diasEntreDatas(dataInicio: Date | string, dataFim: Date | string): number {
  const inicio = typeof dataInicio === 'string' ? new Date(dataInicio) : dataInicio;
  const fim = typeof dataFim === 'string' ? new Date(dataFim) : dataFim;
  const diff = fim.getTime() - inicio.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Adiciona dias a uma data
 */
export function adicionarDias(data: Date | string, dias: number): Date {
  const d = typeof data === 'string' ? new Date(data) : new Date(data);
  d.setDate(d.getDate() + dias);
  return d;
}

/**
 * Verifica se data está vencida
 */
export function dataVencida(data: Date | string): boolean {
  const d = typeof data === 'string' ? new Date(data) : data;
  return d < new Date();
}

// ==================== MATEMÁTICA ====================

/**
 * Arredonda valor para N casas decimais
 */
export function arredondar(valor: number, casas: number = 2): number {
  const fator = Math.pow(10, casas);
  return Math.round(valor * fator) / fator;
}

/**
 * Calcula percentual
 */
export function calcularPercentual(valor: number, total: number): number {
  if (total === 0) return 0;
  return arredondar((valor / total) * 100);
}

/**
 * Aplica desconto percentual
 */
export function aplicarDesconto(valor: number, percentual: number): number {
  return arredondar(valor * (1 - percentual / 100));
}

/**
 * Aplica acréscimo percentual
 */
export function aplicarAcrescimo(valor: number, percentual: number): number {
  return arredondar(valor * (1 + percentual / 100));
}

// ==================== PAGINAÇÃO ====================

/**
 * Calcula offset para paginação
 */
export function calcularOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Calcula total de páginas
 */
export function calcularTotalPaginas(totalItens: number, limit: number): number {
  return Math.ceil(totalItens / limit);
}

/**
 * Gera objeto de paginação
 */
export function gerarPaginacao(page: number, limit: number, total: number) {
  const totalPages = calcularTotalPaginas(total, limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

// ==================== UTILIDADES ====================

/**
 * Delay/sleep em milissegundos
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Remove propriedades undefined/null de um objeto
 */
export function limparObjeto<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
  ) as Partial<T>;
}

/**
 * Verifica se objeto está vazio
 */
export function objetoVazio(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Gera UUID v4
 */
export function gerarUUID(): string {
  return crypto.randomUUID();
}
