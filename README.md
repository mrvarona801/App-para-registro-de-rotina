# Meu Ano Util

Site simples para acompanhar dias uteis, academia, escola, kung fu e observacoes de `19/05/2026` ate `31/12/2026`.

## O que funciona nesta versao

- Mostra todos os dias do periodo.
- Conta dias uteis sem incluir sabado e domingo.
- Permite registrar, por dia, se voce foi para a academia.
- Permite registrar, por dia, se voce foi para a escola.
- Permite registrar kung fu em quarta, sexta e sabado.
- Conta sabado de kung fu como opcional.
- Permite configurar treinos de academia por dia da semana.
- Mostra quantos treinos ainda faltam por grupo muscular.
- Mostra contadores gerais na parte de cima da tela.
- Tem modo claro e modo escuro.
- Permite adicionar campos diarios personalizados.
- Tem campo de observacoes em cada dia.
- Permite exportar e importar dados em `.json`.

## Como abrir no computador

Abra o arquivo `index.html` em um navegador.

Arquivos principais:

- `index.html`
- `styles.css`
- `app.js`

## Onde os dados ficam salvos

Os dados ficam salvos no navegador, usando `localStorage`.

Isso significa:

- Se voce usar no Opera do PC, os dados ficam no Opera desse PC.
- Se voce abrir no celular, os dados do celular serao separados.
- Se limpar os dados do navegador, pode perder os registros.
- Para fazer backup, use o botao de exportar.
- Para restaurar em outro dispositivo, use o botao de importar.

## Usando no celular

Depois de publicar no GitHub Pages:

1. Abra o link no navegador do celular.
2. Use normalmente pelo navegador.
3. Para levar seus dados do PC para o celular:
   - Exporte os dados no PC.
   - Envie o arquivo `.json` para o celular.
   - Abra o site no celular.
   - Importe o arquivo.

## Observacao importante

Cada navegador e cada dispositivo tem seu proprio armazenamento local. O site nao sincroniza automaticamente entre PC e celular. A sincronizacao, por enquanto, e feita exportando e importando o arquivo `.json`.
