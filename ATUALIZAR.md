# Atualização 3.0 — Academia + Cindy

Esta é uma atualização do seu aplicativo existente. Não crie outro repositório nem mude o endereço: use `avalancherj/treino-3x40`.

## 1. Proteja seus dados

No aplicativo que já está funcionando, abra **Perfil → Exportar JSON** e guarde o arquivo. Faça isso também no celular se ele tiver registros diferentes do computador. Não envie backups pessoais ao GitHub.

## 2. Envie a atualização

1. Extraia o ZIP da atualização.
2. Abra a pasta interna `treino-3x40`.
3. No GitHub, abra **Código → Adicionar arquivo → Carregar arquivos** do repositório existente.
4. Arraste os arquivos e a pasta `icons` de dentro da pasta. Pode enviar todo o conteúdo; não envie a pasta externa ou o ZIP.
5. Os arquivos novos substituem os anteriores com o mesmo nome. Clique em **Confirmar alterações / Commit changes**.
6. Em **Ações**, aguarde `pages build and deployment` ficar verde.

Arquivos essenciais: `index.html`, `style.css`, `app.js`, `data.js`, **`circuit.js` (novo)**, `manifest.webmanifest`, `sw.js` e a pasta `icons` completa. Os demais arquivos são instruções, testes e servidor local. Não renomeie arquivos; a tradução automática do GitHub pode traduzir os nomes só na tela.

## 3. Receba a versão nova no celular

1. Abra **https://avalancherj.github.io/treino-3x40/** conectado à internet. Esse acesso permite ao navegador detectar e preparar a nova versão.
2. Aguarde alguns segundos. Feche todas as abas desse endereço e feche o aplicativo instalado. Se necessário, remova-o da lista de aplicativos recentes (não desinstale e não apague dados).
3. Abra novamente pelo ícone, ainda conectado. Em **Perfil** deve aparecer **Versão 3.0 · Academia + Cindy**.
4. Se ainda vir a versão antiga, abra o endereço no navegador, atualize, aguarde e repita o fechamento completo. No computador, use Ctrl+F5 e depois feche as outras abas.

O novo service worker usa o cache `treino340-v3.0.0`. Ele espera as janelas antigas fecharem para ativar, evitando trocar o código durante uma sessão. Não há necessidade de reinstalar o aplicativo ou limpar armazenamento.

## O que mudou

Em **Treinar**, há duas abas: **Academia** e **Fora da academia**.

- **Academia:** preserva A/B/C, exercícios editados, cargas, rascunhos, timers e registros anteriores.
- **Cindy clássico:** 20 minutos de rodadas com 5 barras fixas, 10 flexões e 15 agachamentos. Exige barra fixa adequada.
- **Cindy adaptado:** 12 minutos, com 3 remadas em argolas, 6 flexões com joelhos apoiados e 9 agachamentos. A configuração não deve ser comparada diretamente ao clássico.
- **Circuito sem barra:** 20 minutos de 5 anjos reversos no chão, 10 flexões na parede e 15 agachamentos. É uma alternativa inspirada no formato, não o Cindy clássico; o movimento no chão não equivale à puxada em barra.

Use **+1 repetição** para registrar parte de um movimento ou **Concluir restantes** para registrar tudo o que faltava nele. O próximo movimento aparece automaticamente; ao terminar os agachamentos, começa a próxima rodada. **Desfazer último toque** reverte o último lançamento inteiro.

O placar mostra **rodadas + repetições parciais**, por exemplo `2 + 7`: duas rodadas completas, cinco barras e duas flexões da terceira rodada. Totais por exercício também ficam registrados.

Ao chegar ao limite, o contador para em 00:00 e bloqueia novas repetições. Confira e use **Finalizar e salvar**. É possível encerrar antes; o histórico indica que foi uma sessão parcial. Nenhum resultado é salvo como sessão concluída automaticamente só por zerar o relógio.

**Pausar relógio** congela o tempo e marca a sessão como “com pausas”. Para seguir o protocolo contínuo, descanse quando necessário deixando o tempo correr. Não há exigência de fazer tudo sem descanso. O relógio e o progresso sobrevivem à recarga. A interface visualiza o fim ao retornar ao aplicativo, mas não há garantia de alerta em segundo plano.

O histórico, calendário e consistência semanal incluem ambas as modalidades. O circuito não avança a sequência A/B/C nem conclui um agendamento de academia. O gráfico de evolução na aba Fora da academia compara apenas a mesma variante, com tempo completo e sem pausas no cronômetro. Sessões parciais e com pausas continuam acessíveis no histórico.

## Compatibilidade dos dados

O banco IndexedDB e a chave original do localStorage mantêm os mesmos nomes. O estado v2 recebe somente o novo esquema v3 e o campo opcional de circuito; sessões, medidas, perfil, agenda, planos e rascunhos anteriores são preservados. Não foram lidos dados pessoais do seu aparelho durante a preparação desta atualização.

Backups antigos continuam aceitos. Backups novos usam `version: 3` e incluem os circuitos e seu rascunho. Eles precisam da nova versão para serem importados; não importe um backup v3 na versão antiga do aplicativo. A importação mescla registros e mantém o circuito em andamento no dispositivo quando houver conflito de rascunhos.

## Referência e limites

O formato do clássico e a versão adaptada de 12 minutos foram conferidos na [referência oficial do CrossFit](https://www.crossfit.com/cindy). Não usamos marcas atribuídas a celebridades como metas ou promessa de resultados. A opção sem barra é uma alternativa deste aplicativo, com diferenças de movimento e estímulo explicitadas.

Foram executados 17 testes de lógica/cache simulado, a regressão dos fluxos de academia e testes do circuito em navegador com IndexedDB real. Instalação no Android/iOS e atualização offline em aparelho físico continuam dependentes de verificação no seu dispositivo. Esta entrega prepara os arquivos; a publicação no GitHub ocorre quando você os enviar.
