# Garisign Portfolio

Portfolio estático para Garisign, com páginas em `index.html`, `sobre.html` e `trabalhos.html`.

## Estrutura

- `index.html` �?" página principal com hero, projetos em destaque, serviços e CTA.
- `sobre.html` �?" página �?~�?~Sobre�?T�?T com linha do tempo, estatísticas e contato.
- `trabalhos.html` �?" página de portfólio com filtros e estado em breve.
- `styles.css` �?" estilos globais e responsivos.
- `sobre.css` �?" estilos específicos para a página Sobre.
- `script.js` �?" navegação, cursor customizado, splash, animação de fundo e celular.
- `sobre.js` �?" lógica de timeline e animação da página Sobre.
- `trabalhos.js` �?" lógica de filtros do portfólio.
- `translations.js` �?" sistema de tradução PT/EN.
- `site.webmanifest` �?" manifest para aplicativos PWA.
- `robots.txt` �?" regras de rastreamento.
- `sitemap.xml` �?" mapa do site.

## Como usar

1. Abra `index.html` no navegador.
2. As páginas usam `img-logotipo-LOGO.svg` para ícone e `og-image.svg` para metadados sociais.
3. As traduções PT/EN são controladas por `data-lang` e `data-i18n`.

## Scripts

- `scripts\deploy.ps1 -Destination 'C:\caminho\para\deploy'` �?" copia os arquivos do projeto para o destino.
- `scripts\deploy.ps1 -Destination 'C:\caminho\para\deploy' -Zip` �?" copia e cria um ZIP do deploy.
- `scripts\new-project.ps1` �?" gera a estrutura básica de pastas para um novo projeto.

## Observações

- Se você adicionar imagens ou fontes, coloque-as em `assets/`.
- Mantenha a pasta `scripts/` apenas para utilitários de automação.
- Os arquivos HTML usam caminho relativo para CSS e JS, então a estrutura deve permanecer como está.


