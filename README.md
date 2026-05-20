# Meu Ano Util

Site pessoal para acompanhar dias uteis, academia, escola, kung fu, tarefas e observacoes de `19/05/2026` ate `31/12/2026`.

## Recursos Atuais

- Abre e destaca automaticamente o dia atual.
- Mostra todos os dias do periodo.
- Conta dias uteis sem incluir domingo.
- Permite configurar treinos/tarefas de segunda a sabado.
- Permite registrar academia, escola e kung fu por dia.
- Mantem o sabado de kung fu como opcional, se desejado.
- Mostra contadores de dias passados, dias completos e fracassos.
- Permite configurar o criterio de fracasso.
- Tem modo claro e modo escuro.
- Permite adicionar campos diarios personalizados.
- Tem campo de observacoes em cada dia.
- Exporta e importa backup em `.json`.

## Como Usar

Abra o `index.html` em um navegador ou use a versao publicada do site.

Para registrar um dia:

1. Clique no card do dia ou use o botao `Hoje`.
2. Marque academia, kung fu e/ou escola.
3. Ajuste o treino do dia, se precisar.
4. Escreva observacoes.
5. Clique em `Salvar`.

## Backup

Use o botao de exportar para salvar um arquivo `.json` com seus dados.

Use o botao de importar para restaurar esse arquivo no mesmo navegador ou em outro dispositivo.

O importador tenta preservar dados de versoes antigas, incluindo observacoes, campos extras e registros feitos em cada data.

## Dados Salvos

Os dados ficam no `localStorage` do navegador.

Isso significa:

- Cada navegador tem seus proprios dados.
- Cada dispositivo tem seus proprios dados.
- Limpar dados do navegador pode apagar os registros.
- Para migrar entre PC e celular, exporte no dispositivo antigo e importe no novo.

## Notas de Versao

### 1.0

- Criacao da primeira versao do app.
- Calendario de `19/05/2026` ate `31/12/2026`.
- Contagem de dias uteis.
- Registro de academia e escola.
- Observacoes por dia.
- Configuracao dos treinos de segunda a sexta.
- Exportacao e importacao basica de dados.

### 1.1

- Adicionado kung fu.
- Quarta e sexta contam como compromisso de kung fu.
- Sabado entrou como kung fu opcional.
- Adicionados contadores separados de kung fu.

### 1.2

- Adicionado modo escuro.
- Preferencia de tema passou a ser salva no navegador.
- Melhorias visuais na HUD.

### 1.3

- Dia atual passou a abrir automaticamente.
- Botao `Hoje` passou a levar ao dia real.
- Adicionados contadores de dias passados, dias completos e fracassos.
- Adicionada configuracao do criterio de fracasso.
- Adicionado lembrete de preenchimento as 20h, dependendo das permissoes do navegador.

### 1.4

- Sabado passou a ser configuravel como dia de treino/tarefa, assim como segunda a sexta.
- Domingo continua fora da configuracao principal.
- Badges/pilulas dos cards foram alinhados visualmente.
- Exportacao passou a incluir metadados de versao.
- Importacao foi reforcada para preservar registros de versoes antigas.
- Observacoes, campos extras e dados de cada dia sao normalizados ao importar para evitar perda de dados.
