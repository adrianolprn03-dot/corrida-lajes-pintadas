# Manual de Operação e Guia Administrativo
## 5ª Corrida de Emancipação Política de Lajes Pintadas/RN (26 de dezembro de 2026)

---

### 1. Visão Geral do Sistema
O sistema foi desenvolvido sob medida para a Prefeitura Municipal de Lajes Pintadas/RN e a Secretaria Municipal de Esportes, atendendo estritamente ao edital da prova de 5 km, com cálculo de taxas no servidor, categorização rigorosa, integração ao gateway Asaas e controle antifraude/duplicidade na entrega dos kits.

---

### 2. Acesso ao Painel Administrativo
- **Como acessar:**
  1. No topo da página inicial ou no rodapé institucional, clique no botão **"Painel Admin"**.
  2. Insira as credenciais autorizadas:
     - **Usuário Padrão:** `admin`
     - **Senha Padrão:** `LajesPintadas2026!` (ou `admin123` em ambiente local).
  3. A sessão é protegida localmente com controle de operador.

---

### 3. Ciclo de Vida do Evento (Status)
O sistema possui 5 estados controlados na aba **"Parâmetros & Regras"**:
1. **EM PREPARAÇÃO (`PREPARATION`):** Estado inicial padrão. Impede inscrições públicas enquanto a organização cadastra estoque, contatos e credenciais.
2. **INSCRIÇÕES ABERTAS (`OPEN`):** Formulário público disponível. Requer preenchimento de todos os requisitos obrigatórios antes de ser ativado.
3. **SUSPENSAS (`SUSPENDED`):** Pausa emergencial decidida pela comissão.
4. **ENCERRADAS (`CLOSED`):** Prazo final de inscrição esgotado.
5. **VAGAS ESGOTADAS (`SOLD_OUT`):** Acionado automaticamente ou manualmente quando a capacidade limite ou o estoque de camisas atinge o teto.

> **Importante:** O sistema valida automaticamente se a capacidade máxima, idade mínima, horários, responsável pelo evento e estoque de camisas estão configurados antes de permitir mudar para `OPEN`.

---

### 4. Categorias Oficiais e Auditoria de Elegibilidade "Casa"
O evento possui 4 categorias oficiais estritas:
1. **Casa Masculino**
2. **Casa Feminino**
3. **Visitante Masculino**
4. **Visitante Feminino**

#### Regras da Categoria Casa:
- Destinada a:
  - Atletas **nascidos em Lajes Pintadas/RN** (mesmo que residam em outros municípios ou estados);
  - Atletas que **residem atualmente em Lajes Pintadas/RN**.
- A autodeclaração na inscrição exige a especificação do vínculo (`NATURAL`, `RESIDENTE` ou `NATURAL_E_RESIDENTE`).
- Se o atleta marcar `RESIDENTE`, o sistema valida estritamente se o município informado é "Lajes Pintadas" e UF "RN".
- **Homologação na Entrega do Kit:**
  - Na aba **Inscrições & Atletas**, o organizador pode abrir os **Detalhes** da inscrição e clicar em **"Homologar Categoria Casa"** ou **"Marcar para Auditoria"** após conferência física de:
    - Certidão de Nascimento ou RG com naturalidade (para conterrâneos);
    - Título de Eleitor de Lajes Pintadas/RN;
    - Comprovante de Residência idôneo no nome do atleta ou de seus pais.

---

### 5. Estoque da Camisa Oficial Laranja
- Camisa oficial técnica dry-fit laranja, com grade do **PP ao XG**.
- **Regra de Bloqueio de Redução:** A comissão organizadora **nunca** pode reduzir o estoque total de um tamanho para um número inferior à soma de `confirmadas + reservadas (30 min)`. O sistema bloqueia a alteração com alerta explicativo.

---

### 6. Estação de Entrega de Kits (Antifraude e Bloqueio Duplicado)
Na aba **"Camisas & Entrega de Kits"**:
1. Localize o atleta digitando o **Protocolo** (ex: `LP5-2612-A1B2C`), **CPF** ou **Nome**.
2. O sistema exibe o card completo com:
   - Tamanho exato da camisa (não é permitida troca de tamanho);
   - Chip de cronometragem e número de peito;
   - Status da inscrição.
3. **Bloqueios Automáticos:**
   - Se a inscrição estiver `PENDENTE` ou `RESERVADA`, o botão de entrega é bloqueado com aviso vermelho.
   - Se o kit já tiver sido entregue, o sistema exibe alerta informando a data/hora exata e o operador responsável, **impedindo entrega duplicada**.
4. Para homologar a entrega, informe o posto/operador (ex: `Mesa 1 - Secretaria`) e clique em **Confirmar e Homologar Entrega de Kit**.

---

### 7. Reemissão de Código de Acesso
Se o atleta perder o comprovante inicial e precisar acessar a **Área do Atleta**:
1. Acesse a aba **Inscrições & Atletas** e clique em **Detalhes** da inscrição correspondente.
2. No bloco **"Reemissão de Código de Acesso"**, informe a justificativa (ex: *Atleta perdeu acesso ao e-mail*).
3. Clique em **Gerar Novo Código de Acesso**.
4. O código anterior é imediatamente invalidado, um registro permanente é gravado na **Trilha de Auditoria**, e o novo código é exibido para cópia imediata.

---

### 8. Exportação Segura para Excel e CSV (Proteção CWE-1236)
Os botões **"Exportar Excel (.xlsx)"** e **"Exportar CSV"** na lista de inscrições geram relatórios com:
- Todos os dados cadastrais (exceto segredos criptográficos);
- Sanitização contra injeção de fórmulas: qualquer campo que inicie por `=`, `+`, `-`, `@`, `\t` ou `\r` recebe um prefixo `'` para impedir execução arbitrária de fórmulas no software do organizador;
- Codificação UTF-8 com BOM para exibição perfeita de caracteres acentuados da língua portuguesa.
