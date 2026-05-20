# Meu Ano Útil

Site pessoal para acompanhar dias úteis, academia, escola, kung fu, tarefas e observações de `19/05/2026` até `31/12/2026`.

## Recursos Atuais

- Abre e destaca automaticamente o dia atual.
- Mostra todos os dias do período.
- Conta dias úteis sem incluir domingo.
- Permite configurar treinos/tarefas de segunda a sábado.
- Permite registrar academia, escola e kung fu por dia.
- Mantém o sábado de kung fu como opcional, se desejado.
- Mostra contadores de dias passados, dias completos e fracassos.
- Mostra um painel de evolução com gráfico e lista dos dias de fracasso.
- Permite configurar o critério de fracasso.
- Tem modo claro e modo escuro.
- Permite adicionar campos diários personalizados.
- Tem campo de observações em cada dia.
- Exporta e importa backup em `.json`.

## Como Usar

Abra o `index.html` em um navegador ou use a versão publicada do site.

Para registrar um dia:

1. Clique no card do dia ou use o botão `Hoje`.
2. Marque academia, kung fu e/ou escola.
3. Ajuste o treino do dia, se precisar.
4. Escreva observações.
5. Clique em `Salvar`.

## Backup

Use o botão de exportar para salvar um arquivo `.json` com seus dados.

Use o botão de importar para restaurar esse arquivo no mesmo navegador ou em outro dispositivo.

O importador tenta preservar dados de versões antigas, incluindo observações, campos extras e registros feitos em cada data.

## Dados Salvos

Os dados ficam no `localStorage` do navegador.

Isso significa:

- Cada navegador tem seus próprios dados.
- Cada dispositivo tem seus próprios dados.
- Limpar dados do navegador pode apagar os registros.
- Para migrar entre PC e celular, exporte no dispositivo antigo e importe no novo.

## Notas de Versão

### 1.0

- Criação da primeira versão do app.
- Calendário de `19/05/2026` até `31/12/2026`.
- Contagem de dias úteis.
- Registro de academia e escola.
- Observações por dia.
- Configuração dos treinos de segunda a sexta.
- Exportação e importação básica de dados.

### 1.1

- Adicionado kung fu.
- Quarta e sexta contam como compromisso de kung fu.
- Sábado entrou como kung fu opcional.
- Adicionados contadores separados de kung fu.

### 1.2

- Adicionado modo escuro.
- Preferência de tema passou a ser salva no navegador.
- Melhorias visuais na HUD.

### 1.3

- Dia atual passou a abrir automaticamente.
- Botão `Hoje` passou a levar ao dia real.
- Adicionados contadores de dias passados, dias completos e fracassos.
- Adicionada configuração do critério de fracasso.
- Adicionado lembrete de preenchimento às 20h, dependendo das permissões do navegador.

### 1.4

- Sábado passou a ser configurável como dia de treino/tarefa, assim como segunda a sexta.
- Domingo continua fora da configuração principal.
- Badges/pílulas dos cards foram alinhados visualmente.
- Exportação passou a incluir metadados de versão.
- Importação foi reforçada para preservar registros de versões antigas.
- Observações, campos extras e dados de cada dia são normalizados ao importar para evitar perda de dados.

### 1.5

- Textos do app e do README passaram a usar português com acentuação correta.
- A seção `Evolução` ganhou gráfico de completos, fracassos e pendentes.
- A seção `Evolução` passou a mostrar uma lista clicável dos dias em que houve fracasso.
- Botões de exportar/importar passaram a usar texto para evitar símbolos quebrados em alguns navegadores.
