# Not The End - Sistema de RPG

Sistema web para gerenciar fichas do RPG "Not The End" com autenticação, tema escuro/claro e sincronização em tempo real via Firebase.

## 🎮 Funcionalidades

- **Login duplo**: Mestre (visualiza todas as fichas) e Jogador (edita sua ficha)
- **Ficha de personagem** com layout hexagonal em 3 camadas:
  - **Arquétipo** (centro) - cor âmbar
  - **6 Qualidades** (camada intermediária) - cor azul
  - **12 Habilidades** (camada externa, bordas tracejadas) - cor verde
  - Linhas conectando as camadas com pontos indicadores
- **4 Infortúnios** (campos editáveis na parte inferior, todos na mesma linha)
- **Estados mentais** (Confusão e Adrenalina - campos marcáveis)
- **Tema claro/escuro** (escuro por padrão)
- **Sincronização em tempo real** com Firebase Firestore
- **Design responsivo** para desktop, tablet e mobile
- **Sistema de Testes** com saquinho virtual e sorteio de hexágonos

## 🚀 Como rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar em desenvolvimento (modo localStorage)
```bash
npm run dev
```

Acesse `http://localhost:5173`

**Por padrão, o projeto usa localStorage para desenvolvimento!** Não precisa configurar Firebase para testar.

### 3. Configurar Firebase (Opcional - para produção)

Para usar sincronização em nuvem, configure o Firebase:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Vá em **Build** > **Firestore Database** > **Criar banco de dados** (modo teste)
3. Em **Configurações do Projeto** > **Seus apps**, adicione um app Web
4. Copie as credenciais do Firebase

### 4. Criar arquivo `.env` (Opcional)

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
VITE_FIREBASE_APP_ID=seu-app-id
```

Após adicionar o `.env`, o projeto automaticamente usará Firebase ao invés de localStorage.

### 5. Build para produção
```bash
npm run build
```

## 🔐 Credenciais de acesso

- **Senha única** para Mestre e Jogadores: `DnD7MarPkm`
- **Mestre**: Apenas senha
- **Jogador**: Nome + senha (se já existir ficha com esse nome, ela será carregada automaticamente)

## 🎨 Estrutura do projeto

```
src/
├── assets/
│   ├── saquinhoteste.svg           # Imagem do saquinho (placeholder SVG)
│   ├── complicacaovermelha.svg     # Hex vermelha (placeholder SVG)
│   ├── sucessoverde.svg            # Hex verde (placeholder SVG)
│   └── README.md                   # Instruções para substituir por PNG
├── components/
│   ├── CharacterSheet.jsx   # Ficha com hexágonos em 3 camadas
│   ├── LoginPage.jsx        # Tela de login
│   ├── TestSystem.jsx       # Sistema de testes com saquinho
│   └── ThemeToggle.jsx      # Toggle claro/escuro
├── contexts/
│   ├── AuthContext.jsx      # Autenticação
│   └── ThemeContext.jsx     # Gerenciamento de tema
├── pages/
│   ├── MasterPage.jsx       # Área do Mestre
│   └── PlayerPage.jsx       # Área do Jogador
├── services/
│   ├── sheetService.js         # CRUD para fichas (Firebase/localStorage)
│   ├── testService.js          # CRUD para testes (Firebase/localStorage)
│   └── localStorageService.js  # Implementação localStorage
├── firebase.js              # Config Firebase
└── App.jsx
```

**Nota sobre imagens**: O projeto inclui placeholders SVG temporários. Para melhor qualidade visual, substitua os arquivos em `src/assets/` por:
- `saquinhoteste.png` - Imagem do saquinho de teste
- `complicacaovermelha.png` - Hexágono vermelho
- `sucessoverde.png` - Hexágono verde

## 🛠️ Tecnologias

- **React** 18 + **Vite**
- **Tailwind CSS** (com tema dark mode)
- **Firebase Firestore** (persistência e sync em tempo real)
- **React Router DOM**

## 🎲 Sistema de Testes

O Mestre pode aplicar testes aos jogadores usando o saquinho virtual:

### Como funciona:

1. **Aplicar Teste** (Mestre):
   - Selecione a ficha de um jogador
   - Clique em "Aplicar Teste"
   - Escolha a dificuldade:
     - Muito Fácil: 1 hex vermelha
     - Fácil: 2 hexs vermelhas
     - Normal: 3 hexs vermelhas
     - Difícil: 4 hexs vermelhas
     - Muito Difícil: 5 hexs vermelhas
     - Quase Impossível: 6 hexs vermelhas
   - O saquinho aparece com as hexs vermelhas (complicações)

2. **Adicionar Sucessos** (Jogador):
   - O jogador pode clicar nos hexágonos de Arquétipo, Qualidade ou Habilidade
   - Cada clique adiciona uma hex verde (sucesso) ao saquinho
   - Continua até o Mestre embaralhar

3. **Embaralhar** (Mestre):
   - Clique em "Embaralhar" para bloquear novas adições
   - O jogador pode começar a sortear

4. **Sortear** (Jogador):
   - Clique em "Sortear" para retirar uma hex aleatória do saquinho
   - As hexs sorteadas aparecem enfileiradas abaixo do saquinho
   - Continue sorteando até obter o resultado desejado

5. **Limpar Sorteio** (Mestre):
   - Remove o saquinho e todos os hexágonos
   - Limpa o teste atual

### Recursos visuais:
- **Saquinho virtual** aparece à direita da tela
- **Animações** ao adicionar hexs ao saquinho
- **Contador** mostrando hexs vermelhas/verdes no saquinho
- **Fila de sorteio** mostrando hexs retiradas
- **Indicadores** para orientar o jogador
- Sincronização em tempo real entre Mestre e Jogador

## 💾 Sistema de Armazenamento

O projeto possui **armazenamento híbrido** que detecta automaticamente qual usar:

### LocalStorage (Desenvolvimento)
- **Ativado quando**: Firebase não está configurado (credenciais PLACEHOLDER)
- **Vantagens**:
  - Funciona offline
  - Não precisa configurar nada
  - Rápido para desenvolvimento
  - Dados persistem no navegador
- **Limitações**:
  - Dados ficam apenas no navegador local
  - Não sincroniza entre dispositivos
  - Sincronização entre abas funciona, mas é local

### Firebase Firestore (Produção)
- **Ativado quando**: Arquivo `.env` configurado com credenciais reais
- **Vantagens**:
  - Sincronização em tempo real entre todos os usuários
  - Funciona em qualquer dispositivo
  - Dados na nuvem
  - Suporta múltiplos jogadores simultaneamente

### Indicador Visual
Um indicador no canto superior direito mostra qual modo está ativo:
- 🟢 **Verde (Firebase)**: Dados sincronizados na nuvem
- 🟠 **Laranja (LocalStorage)**: Dados locais no navegador

## 📝 Notas

- As fichas são salvas automaticamente 1 segundo após edição
- O tema escuro é o padrão e persiste no localStorage
- Cada jogador tem acesso apenas à sua própria ficha
- O Mestre visualiza todas as fichas em modo somente-leitura
- O sistema de testes é sincronizado em tempo real (Firebase) ou entre abas (localStorage)

## 🎯 Design da ficha

A ficha segue o layout do PDF de referência (`fichaexemplo.pdf`):
- Hexágonos flat-top (bordas planas em cima/baixo)
- Grid em formato diamante/colmeia
- Espaçamento entre hexágonos (fator GAP de 1.18x)
- Cores distintas por camada:
  - **Arquétipo**: Âmbar (amber-50/amber-500)
  - **Qualidades**: Azul céu (sky-50/sky-500)
  - **Habilidades**: Verde esmeralda (emerald-50/emerald-500)
- Linhas de conexão com indicadores circulares nos pontos médios
- Habilidades com bordas tracejadas, demais hexágonos com bordas sólidas
