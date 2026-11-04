// Teste Automatizado de Autenticação e Gestão de Operadores
// Valida a consistência de login por usuário e e-mail, preservação de senha e RBAC

import { memoryStore } from '../api/lib/state.ts';

async function runTests() {
  console.log('--- INICIANDO TESTES DE AUTENTICAÇÃO E OPERADORES ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Testar operadores padrão por username
  const authAdmin = memoryStore.authenticateOperator('admin', 'admin123');
  assert(authAdmin && authAdmin.role === 'ADMIN_GERAL', 'Login de admin com admin123');

  const authAdminMaster = memoryStore.authenticateOperator('admin', 'LajesPintadas2026!');
  assert(authAdminMaster && authAdminMaster.role === 'ADMIN_GERAL', 'Login de admin com senha mestra LajesPintadas2026!');

  const authAtendimento = memoryStore.authenticateOperator('atendimento', 'atendimento123');
  assert(authAtendimento && authAtendimento.role === 'ATENDIMENTO', 'Login de atendimento com atendimento123');

  const authFinanceiro = memoryStore.authenticateOperator('financeiro', 'financeiro123');
  assert(authFinanceiro && authFinanceiro.role === 'FINANCEIRO', 'Login de financeiro com financeiro123');

  const authKit = memoryStore.authenticateOperator('kit', 'kit123');
  assert(authKit && authKit.role === 'ENTREGA_KIT', 'Login de kit com kit123');

  // 2. Testar login por email
  const authByEmail = memoryStore.authenticateOperator('atendimento@lajespintadas.rn.gov.br', 'atendimento123');
  assert(authByEmail && authByEmail.username === 'atendimento', 'Login usando e-mail do operador');

  const authWithAt = memoryStore.authenticateOperator('@financeiro', 'financeiro123');
  assert(authWithAt && authWithAt.username === 'financeiro', 'Login com arroba no início (@financeiro)');

  // 3. Testar credenciais incorretas
  const authWrong = memoryStore.authenticateOperator('admin', 'senha_errada');
  assert(authWrong === null, 'Rejeição de senha incorreta');

  const authNotFound = memoryStore.authenticateOperator('usuario_inexistente', '123456');
  assert(authNotFound === null, 'Rejeição de usuário inexistente');

  // 4. Testar criação de novo operador
  const novoOperador = memoryStore.saveOperator({
    id: 'op-teste-1',
    username: 'maria.atendimento',
    name: 'Maria Helena Silva',
    role: 'ATENDIMENTO',
    email: 'maria.helena@lajespintadas.rn.gov.br',
    password: 'MinhaSenhaForte2026!',
    isActive: true,
    createdAt: new Date().toISOString(),
  });
  assert(novoOperador && novoOperador.username === 'maria.atendimento', 'Criação de novo operador');

  // 5. Testar login do novo operador por username e por email
  const authNovoUser = memoryStore.authenticateOperator('maria.atendimento', 'MinhaSenhaForte2026!');
  assert(authNovoUser && authNovoUser.role === 'ATENDIMENTO', 'Login do novo operador por username');

  const authNovoEmail = memoryStore.authenticateOperator('maria.helena@lajespintadas.rn.gov.br', 'MinhaSenhaForte2026!');
  assert(authNovoEmail && authNovoEmail.role === 'ATENDIMENTO', 'Login do novo operador por e-mail');

  // 6. Testar edição do operador SEM informar nova senha (NÃO pode apagar a senha existente!)
  memoryStore.saveOperator({
    id: 'op-teste-1',
    username: 'maria.atendimento',
    name: 'Maria Helena Silva Souza',
    role: 'ATENDIMENTO',
    email: 'maria.helena@lajespintadas.rn.gov.br',
    password: '', // em branco, deve manter anterior
    isActive: true,
    createdAt: novoOperador.createdAt,
  });

  const authAposEdicao = memoryStore.authenticateOperator('maria.atendimento', 'MinhaSenhaForte2026!');
  assert(authAposEdicao && authAposEdicao.name === 'Maria Helena Silva Souza', 'Preservação de senha ao editar operador com senha em branco');

  // 7. Testar operador inativo
  memoryStore.saveOperator({
    id: 'op-teste-1',
    username: 'maria.atendimento',
    name: 'Maria Helena Silva Souza',
    role: 'ATENDIMENTO',
    email: 'maria.helena@lajespintadas.rn.gov.br',
    isActive: false, // desativado
    createdAt: novoOperador.createdAt,
  });

  const authInativo = memoryStore.authenticateOperator('maria.atendimento', 'MinhaSenhaForte2026!');
  assert(authInativo === null, 'Operador desativado tem acesso negado');

  // 8. Testar exclusão de operador
  const deleted = memoryStore.deleteOperator('maria.atendimento');
  assert(deleted === true, 'Exclusão de operador com sucesso');

  const authExcluido = memoryStore.authenticateOperator('maria.atendimento', 'MinhaSenhaForte2026!');
  assert(authExcluido === null, 'Operador excluído não consegue mais logar');

  // 9. Proteger root admin contra exclusão
  const deleteAdmin = memoryStore.deleteOperator('admin');
  assert(deleteAdmin === false, 'Root admin não pode ser excluído');

  console.log(`\nRESUMO: ${passed} passaram, ${failed} falharam.`);
  if (failed > 0) process.exit(1);
}

runTests();
