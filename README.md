# ⚡ Multi 4.0 — Multi-Session Web Engine Dashboard

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Electron](https://img.shields.io/badge/Electron-29.1.0-47848F?logo=electron)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.1.4-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38BDF8?logo=tailwindcss)

> **Multi 4.0** é um painel multi-sessão de alta performance desenvolvido em **Electron**, **React** e **Vite**, projetado para gerenciar múltiplas instâncias web simultâneas em tela dividida com isolamento completo de sessões (cookies, local storage e autenticações independentes).

---

## ✨ Principais Funcionalidades

- 🛡️ **Isolamento de Partições Independentes**: Cada janela executa em uma partição isolada de Chromium (`persist:sessao_X`), permitindo logar em contas diferentes simultaneamente sem conflito.
- ⚡ **Desempenho de Alta Eficiência**:
  - Desativação de spellcheck e renderizadores desnecessários em background.
  - Monitoramento em tempo real de consumo de CPU e memória RAM por sessão.
  - Otimizações ativas do motor Chromium nativo.
- 🖥️ **Modos de Grid Dinâmicos**:
  - Modos de visualização 1x1, 2x2, 3x3 e Foco em Janela Única.
  - Redimensionamento automático de coordenadas subpixel nativas.
- 🥷 **Modo Furtivo / Boss Key (Atalho Global)**:
  - Atalho global configurável (`Alt+H` por padrão) para ocultar instantaneamente a aplicação sem deixar ícone na bandeja.
- 🤖 **Recurso Anti-AFK Humanizado**:
  - Simulação de cliques humanizados com intervalos variáveis para manter sessões ativas e evitar desconexões por inatividade.
- 🎨 **Interface Moderna & Responsiva**:
  - UI moderna com Glassmorphism, suporte a zoom individual por janela, modo escuro forçado injetável e mutar/desmutar áudios em massa.

---

## 🛠️ Tecnologias Utilizadas

- **Desktop Core**: [Electron](https://www.electronjs.org/)
- **Frontend Framework**: [React 18](https://react.dev/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (v18 ou superior)
- **npm** (v9 ou superior)

### 1. Clonar o repositório
```bash
git clone https://github.com/Sovinha/multi-session-app.git
cd multi-session-app
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Executar em ambiente de desenvolvimento
```bash
npm run dev
```

---

## 📦 Como Gerar o Executável (.exe)

Para compilar a aplicação e gerar o instalador portátil para Windows:

```bash
npm run dist:win
```
*Os arquivos compilados serão gerados na pasta `dist_electron/`.*

---

## 📄 Licença

Este projeto está sob a licença [MIT](./LICENSE). Sinta-se à vontade para utilizar, modificar e contribuir.

---

### 👤 Autor
Desenvolvido por **[João Lucas - Sovinha](https://github.com/Sovinha)**.
