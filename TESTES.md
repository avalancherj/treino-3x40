# Verificação da entrega

## Atualização 3.0 — Academia + Cindy

17 testes de lógica passaram, incluindo compatibilidade do esquema v2 → v3, pontuação de rodadas/repetições, desfazer, limites do cronômetro, pausa/retomada, validação de circuito concluído e de rascunho, três variantes e recursos de cache atualizados.

A regressão da interface de academia também passou. A suíte adicional `circuit-browser-tests.cjs` verificou em Edge com IndexedDB real:

- Atualização de estado v2 preservando perfil editado, cargas, histórico, medida e rascunho A.
- Abas Academia/Fora da academia e contagem de uma rodada + uma repetição.
- Desfazer lançamento, pausar, recarregar, retomar e finalizar com pausas.
- Registro separado do circuito sem barra e histórico conjunto com a academia.
- Expiração real de um rascunho próximo ao limite: bloqueio de novas reps e duração final de 20 minutos.
- Exportação/importação de backup v3 contendo circuitos sem duplicar as quatro sessões da fixture.
- Ausência de erros JavaScript e de transbordamento nas larguras 390/1280.

O navegador recebe arquivos por interceptação local; esses testes não verificam publicação real ou service worker instalado. Para executá-los, use a mesma configuração de `browser-tests.cjs`, com `node circuit-browser-tests.cjs`. Valores de teste ficam apenas em perfis temporários e não acompanham o estado inicial da entrega.

As verificações abaixo documentam a base anterior e continuam cobertas pela regressão.

Data: 20/10/2026.

## Aprovado automaticamente

- Verificação de sintaxe de `app.js` e `data.js`.
- Perfil inicial, três planos completos e validação de backup novo/antigo.
- Migração de fixture antiga sem alterar a fonte nem os registros históricos.
- Conversão de rascunho preservando séries/cargas e indicando repetições desconhecidas.
- Cronômetro: tempo ativo, pausa, retomada e cálculo após recarga.
- Rejeição de estrutura, perfil, medidas, agenda, séries e duração inválidos.
- Snapshot histórico independente de edições posteriores no plano.
- Manifest standalone e dimensões reais dos ícones PNG.
- Service worker em ambiente simulado: instalação de todos os recursos, ativação, resposta a arquivo em cache e fallback de navegação sem rede.

## Interface em Edge automatizado

Executados com arquivos interceptados localmente, IndexedDB real e perfil temporário:

- Migração real da chave localStorage de fixture para IndexedDB, preservando a chave original.
- Iniciar sessão; preencher 11 repetições e 22,5 kg; concluir série; pausar.
- Recarregar e recuperar os valores salvos; finalizar; verificar os valores no histórico.
- Registrar peso de 76,4 kg e cintura de 85 cm; confirmar atualização dos gráficos/registros.
- Editar nome de exercício e salvar plano.
- Agendar treino e mover para outra data/hora.
- Baixar backup JSON e conferir seus registros; recusar JSON incompleto; importar backup válido.
- Conferir que reimportar o mesmo backup mantém uma sessão e uma medida, sem duplicação.
- Layout nas larguras 390 e 1280 pixels sem transbordamento horizontal e sem erros JavaScript.

Os valores de teste pertencem somente ao perfil temporário de QA; não estão no estado inicial distribuído. Não houve acesso aos dados reais do navegador do usuário.

## Limites de verificação

A conexão HTTP entre o navegador automatizado e o servidor local foi bloqueada neste ambiente. Os testes de interface usaram interceptação de recursos. O comportamento de cache foi testado por simulação; o ciclo real de instalação/atualização de service worker e a navegação em modo avião **não foram verificados em navegador real**.

Não houve teste em aparelhos Android/iOS físicos, instalação pela tela inicial, persistência após remoção por pressão de espaço ou publicação HTTPS. Não afirmar que esses testes foram executados.

## Roteiro antes do uso definitivo

1. Exporte no aplicativo antigo e guarde o JSON; publique a nova versão em HTTPS.
2. Importe o backup e compare a quantidade de sessões, medidas, cargas e perfil.
3. No Android e no iPhone, instale pela tela inicial e abra conectado até OFFLINE PRONTO.
4. Ative modo avião; abra pelo ícone; inicie um treino, preencha uma série, pause, feche e reabra. Confira os valores e o relógio; retome e finalize.
5. Confira a nova sessão no histórico, registre uma medida e exporte backup. Importe o backup em outro navegador de teste e compare os valores.
6. Publique uma nova versão de cache, feche todas as abas e confirme atualização sem perda de dados.
7. Teste novamente após reiniciar o dispositivo. Guarde backups fora do navegador.
