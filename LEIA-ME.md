# Treino 3×40 — versão 2

Aplicativo pessoal Full Body em HTML, CSS e JavaScript, sem dependências de execução, anúncios, conta, assinatura, analytics ou serviços remotos. Os dados ficam no dispositivo. O código e os ícones estão completos nesta pasta. Não é necessário compilar.

## Começar no computador

1. Extraia o ZIP inteiro.
2. Instale Node.js, caso ainda não tenha.
3. Abra um terminal nesta pasta e execute `npm start` (ou `node server.mjs`).
4. Abra **http://localhost:4173**. O servidor é apenas uma ferramenta local de desenvolvimento.

Não abra `index.html` por duplo clique: módulos JavaScript, IndexedDB e service worker devem ser usados em uma origem HTTP local ou HTTPS. Para celular, publique em HTTPS conforme abaixo; `localhost` no celular aponta para o próprio celular.

## Preservar os dados antigos

**Antes de qualquer mudança, abra o index.html antigo e use Perfil → Exportar JSON. Guarde esse arquivo fora da pasta do site.** O arquivo HTML fornecido não contém os registros do navegador; não foi possível ler seus dados pessoais a partir dele.

Na primeira abertura, o novo aplicativo procura a chave `treino340_v1` no localStorage da **mesma origem e mesmo navegador/perfil**. Valida a estrutura e grava uma cópia inteira numa transação IndexedDB. A chave antiga não é apagada nem reescrita. A migração só ocorre se o banco novo ainda não tiver estado; versões posteriores usam o IndexedDB existente. Um erro de leitura ou validação interrompe a abertura e oferece o download da chave antiga para recuperação.

Se o aplicativo antigo foi aberto como arquivo (`file://`), ou se mudar de domínio, porta, navegador ou celular, o novo site não consegue ler aquele localStorage. Nesse caso, use **Perfil → Importar JSON**, escolhendo o backup exportado no aplicativo antigo. É o procedimento recomendado para passar para HTTPS.

Sessões antigas conservam data, minutos, séries marcadas e cargas. A versão antiga não registrava repetições efetivas, horário inicial separado, nomes históricos ou segundos exatos: esses valores não são inventados. No histórico, repetições aparecem como não registradas. Rascunhos antigos conservam as séries e cargas; revise as repetições antes de finalizar.

O novo esquema grava uma cópia dos exercícios e cada série com repetições/segundos, carga e conclusão, além de início, fim e duração ativa em milissegundos. Editar o plano não muda uma sessão já iniciada ou encerrada. A última carga concluída alimenta a carga inicial da próxima sessão.

## Uso

- **Início:** próximo treino, frequência semanal, calendário do mês atual, peso e cintura. Agende A/B/C por data/hora; “Mover” muda apenas o compromisso. A conclusão marca o próximo compromisso correspondente como realizado. Sessões históricas ficam intactas.
- **Treinar:** escolha A/B/C, inicie a sessão, selecione substitutos, preencha os valores efetivos e marque cada série. Pausa/retomada usa o relógio do dispositivo e persiste após recarga. Cada treino pode ter seu próprio rascunho. Finalizar exige confirmação.
- **Editar plano:** altere nomes, séries, repetições/segundos, carga, substitutos e grupos musculares. Adicione/remova exercícios. Durante uma sessão já iniciada, a edição valerá para a próxima sessão.
- **Guia anatômico:** mapa esquemático anterior/posterior; verde marca músculos principais e âmbar os secundários. Não é um atlas clínico. Ao usar substitutos, revise os grupos no editor conforme o movimento escolhido.
- **Descanso:** botões de 60/90 segundos, pausa/retomada e zerar. Marcar uma série inicia 60 s. O término aparece visualmente e pode vibrar em aparelhos compatíveis. Não há notificação garantida com o aplicativo fechado ou em segundo plano.
- **Evolução:** peso, cintura, maior carga realizada por exercício e sessões por semana. Pranchas temporizadas não entram no gráfico de força. Os gráficos incluem somente dados registrados; não há dados fictícios.
- **Perfil:** altura inicial 172 cm, peso de referência 76 kg, meta de longo prazo 83 kg. As medidas reais são adicionadas pelo usuário. A cintura é uma medida de acompanhamento, não um cálculo de gordura corporal.

## Backup

Exporte JSON regularmente e antes de trocar de endereço/dispositivo. Importações aceitam a estrutura antiga ou a versão 2, validam perfil, datas, séries, planos, agenda e rascunhos, e recusam arquivos maiores que 20 MB. Uma confirmação precede a importação. O aplicativo inicia o download de um backup atual antes de aplicar os novos dados; verifique se o navegador permitiu o download.

A importação **mescla** sessões, medidas e agenda. IDs iguais identificam o mesmo registro; registros antigos sem ID são comparados pelo conteúdo JSON. Perfil e planos vêm do arquivo. Rascunhos existentes no dispositivo têm prioridade nos mesmos treinos. Registros antigos com propriedades em ordem diferente podem ser duplicados; guarde seus backups originais. A escrita do estado final é uma transação IndexedDB. Backup inválido não altera o estado persistido.

IndexedDB e caches são locais e podem ser removidos ao limpar dados ou pelo sistema sob pressão de espaço. “Solicitar armazenamento persistente” é uma solicitação ao navegador, não uma garantia. O aplicativo não sincroniza dispositivos automaticamente.

## Publicar gratuitamente em HTTPS — GitHub Pages

1. Crie uma conta gratuita no GitHub e um repositório **público**, por exemplo `treino-3x40`.
2. Envie `index.html`, `app.js`, `data.js`, `style.css`, `manifest.webmanifest`, `sw.js` e a pasta `icons/` para a raiz da branch `main`. Não envie seus backups pessoais. Não é preciso enviar testes ou servidor.
3. Em **Settings → Pages**, selecione **Deploy from a branch**, branch **main**, pasta **/(root)**, e salve.
4. Aguarde a publicação e abra o endereço exibido, normalmente `https://SEU-USUARIO.github.io/treino-3x40/`.
5. Mantenha **Enforce HTTPS** ativado. Importe seu backup no novo endereço.

Os caminhos são relativos, portanto o aplicativo funciona em subpastas. O repositório público contém código, não os dados guardados em seu navegador. Não coloque arquivos JSON pessoais nele.

Referências oficiais: [GitHub Pages e plano gratuito](https://docs.github.com/en/pages/getting-started-with-github-pages), [HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

## Instalar e usar offline

**Android:** abra o site HTTPS no Chrome → menu → Adicionar à tela inicial / Instalar aplicativo. [Instruções do Google](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid).

**iPhone/iPad:** abra no Safari → Compartilhar → Adicionar à Tela de Início; ative “Abrir como App da Web” se a opção estiver disponível. [Instruções da Apple](https://support.apple.com/en-lamr/guide/iphone/iphea86e5236/ios).

Abra conectado uma primeira vez e aguarde **OFFLINE PRONTO**. Depois feche e reabra pelo ícone. Teste no modo avião: dashboard, treino, histórico e registro de medidas devem funcionar. O primeiro acesso precisa de rede. O service worker armazena todos os recursos essenciais, incluindo ícones; não usa CDN, fontes ou bibliotecas externas.

Para atualizar uma publicação, altere o identificador `CACHE` em `sw.js` e publique os arquivos juntos. Uma atualização espera o fechamento das abas antigas antes de assumir, evitando misturar versões durante o treino. Não limpe os dados para atualizar.

## Organização

`index.html`: estrutura e metadados; `style.css`: interface responsiva; `app.js`: telas e interações; `data.js`: modelos, validação, migração e IndexedDB; `sw.js`: cache offline; `manifest.webmanifest`: instalação; `icons/`: ícones PNG 180, 192 e 512, incluindo maskable; `server.mjs`: servidor de desenvolvimento; `tests.mjs`: testes de lógica e cache; `browser-tests.cjs`: testes de interface opcionais.

## Verificações

Execute `npm test` para a suíte sem dependências. Para testar interface, instale Playwright somente no ambiente de desenvolvimento (`npm install --no-save playwright`) e execute `node browser-tests.cjs`; usa Edge por padrão. O teste intercepta arquivos localmente e usa um contexto de navegador isolado. Não testa a rede real ou o service worker.

Veja **TESTES.md** para resultados e verificações ainda necessárias em aparelhos reais. O aplicativo não foi publicado automaticamente e nenhum dado pessoal foi enviado a um servidor.
