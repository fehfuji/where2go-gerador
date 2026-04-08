# API de Sugestões de Experiências

## Visão Geral

A rota `/api/suggestions` gera sugestões de experiências personalizadas para estabelecimentos usando IA (Gemini). Existem dois modos de operação:

1. **local**: busca dados de estabelecimentos já cadastrados na base
2. **search**: busca informações em tempo real via Google Search para estabelecimentos não cadastrados

---

## Endpoint

```
POST /api/suggestions
```

---

## Modo 1: LOCAL (Padrão)

Busca produtos cadastrados no banco de dados para um estabelecimento específico.

### Parâmetros de Entrada

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-----------|-----------|
| `context` | string | Não | `"local"` (padrão) ou `"search"`. Padrão: `"local"` |
| `place_id` / `placeId` | string | Não | ID único do estabelecimento no banco de dados |
| `category` | string | Não | Categoria do produto (ex: `"Restaurantes"`, `"Bares"`) |
| `price_range` | string | Não | Faixa de preço formatada (ex: `"80-200"`) |
| `min_price` | number | Não | Preço mínimo em R$ |
| `max_price` | number | Não | Preço máximo em R$ |
| `suggestions_count` / `suggestions_qty` / `quantity` | number | Não | Quantidade de sugestões a gerar (1-10). Padrão: `3` |

### Exemplo de Request (local)

```bash
curl -X POST https://prod-w2go-43059108427.us-central1.run.app/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "context": "local",
    "place_id": "st-patrick-pub",
    "category": "Bares",
    "suggestions_count": 4,
    "price_range": "80-220"
  }'
```

### Exemplo Body (JSON)

```json
{
  "context": "local",
  "place_id": "st-patrick-pub",
  "category": "Bares",
  "suggestions_count": 4,
  "price_range": "80-220"
}
```

### Alternativas de Parâmetros de Preço

```json
{
  "min_price": 80,
  "max_price": 220
}
```

ou

```json
{
  "price_range": "80-220"
}
```

---

## Modo 2: SEARCH

Busca informações sobre um estabelecimento via Google Search e gera sugestões sem dados locais prévios.

### Parâmetros de Entrada

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-----------|-----------|
| `context` | string | **Sim** | Deve ser `"search"` |
| `establishment_name` / `business_name` / `establishment` | string | **Sim** | Nome do estabelecimento (ex: `"St Patrick Pub"`) |
| `city` | string | Não | Cidade (padrão: `"São Paulo"`) |
| `address` / `neighborhood` / `region` | string | Não | Endereço, bairro ou região para desambiguação |
| `category` | string | Não | Categoria desejada (ex: `"Bares"`, `"Restaurantes"`) |
| `price_range` | string | Não | Faixa de preço (ex: `"80-200"`) |
| `min_price` | number | Não | Preço mínimo em R$ |
| `max_price` | number | Não | Preço máximo em R$ |
| `suggestions_count` / `suggestions_qty` / `quantity` | number | Não | Quantidade de sugestões (1-10). Padrão: `3` |

### Exemplo de Request (search)

```bash
curl -X POST https://prod-w2go-43059108427.us-central1.run.app/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "context": "search",
    "establishment_name": "St Patrick Pub",
    "category": "Bares",
    "city": "São Paulo",
    "address": "Vila Madalena",
    "suggestions_count": 4,
    "price_range": "80-220"
  }'
```

### Exemplo Body (JSON)

```json
{
  "context": "search",
  "establishment_name": "St Patrick Pub",
  "category": "Bares",
  "city": "São Paulo",
  "address": "Vila Madalena",
  "suggestions_count": 4
}
```

---

## Resposta de Sucesso (200 OK)

Ambos os modos retornam a mesma estrutura JSON:

```json
{
  "estabelecimento": "Nome Real do Lugar",
  "pesquisa_resumo": "Breve resumo do que encontrou sobre o lugar (2-3 frases)",
  "experiencias": [
    {
      "title": "Nome evocativo da ocasião (máx 50 chars)",
      "category": "Restaurantes | Agenda | Dates | Cultural | Parques | Compras | Lazer | Social | Bem-estar | Bares | Cafés | Baladas | Comemorações",
      "publico": "Para duas pessoas | Em grupo | Família | Solo",
      "tipo_combo": "ex: Entrada + Prato + Bebida + Sobremesa",
      "itens_inclusos": ["item real do cardápio 1", "item 2", "item 3"],
      "elemento_especial": "O que torna isso mais que um pedido normal",
      "description": "Parágrafo 1 criando expectativa.\n\nParágrafo 2 detalhando o que está incluso.",
      "price": 120,
      "quantity": "por pessoa | por casal | por grupo"
    }
  ]
}
```

### Campos de Saída

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `estabelecimento` | string | Nome oficial do estabelecimento |
| `pesquisa_resumo` | string | Resumo de 2-3 frases sobre o local encontrado |
| `experiencias` | array | Array contendo as sugestões de experiências |
| `experiencias[].title` | string | Nome da experiência (máx 50 caracteres) |
| `experiencias[].category` | string | Categoria do produto na plataforma |
| `experiencias[].publico` | string | Público-alvo (casal, grupo, família, solo) |
| `experiencias[].tipo_combo` | string | Descrição dos itens que compõem a experiência |
| `experiencias[].itens_inclusos` | array | Lista com nomes dos itens reais do cardápio |
| `experiencias[].elemento_especial` | string | O diferencial que torna a experiência vendável |
| `experiencias[].description` | string | Descrição narrativa (2 parágrafos com `\n\n` de separação) |
| `experiencias[].price` | number | Preço em R$ |
| `experiencias[].quantity` | string | Base de cálculo do preço (por pessoa, casal, grupo) |

---

## Códigos de Erro

### 400 Bad Request

**Ocorre quando:**
- Campo obrigatório falta (ex: `establishment_name` em search)
- `context` tem valor inválido

**Exemplo:**
```json
{
  "message": "No contexto 'search', envie establishment_name (ou business_name).",
  "required": ["context=search", "establishment_name"],
  "optional": ["category", "price_range ou min_price/max_price", "city", "address"]
}
```

### 404 Not Found

**Ocorre quando:**
- No modo `local`, nenhum produto foi encontrado com os filtros

**Exemplo:**
```json
{
  "message": "Nenhum produto encontrado para os filtros informados.",
  "applied_filters": {
    "place_id": "st-patrick-pub",
    "category": null,
    "min_price": null,
    "max_price": null
  }
}
```

### 500 Internal Server Error

**Ocorre quando:**
- Erro ao consultar banco de dados
- Erro geral ao processar a requisição

**Exemplo:**
```json
{
  "message": "Erro ao gerar sugestões de experiências.",
  "details": "Descrição do erro"
}
```

### 502 Bad Gateway

**Ocorre quando:**
- A IA retorna resposta inválida/não-JSON

**Exemplo:**
```json
{
  "message": "A IA retornou uma resposta inválida.",
  "raw_response": "Texto retornado pela IA"
}
```

---

## Fluxo de Retry Automático

Ambos os modos possuem retry automático em caso de **timeout**:

1. **Tentativa 1** (60s timeout)
   - Modelo: `gemini-2.5-flash`
   - Amostra: até 50 itens (local) ou busca completa (search)

2. **Tentativa 2** em timeout (90s timeout)
   - Modelo: `gemini-2.0-flash`
   - Amostra: até 20 itens (local) ou busca simplificada (search)

---

## Considerações de Design

### Modo LOCAL

- ✅ Recomendado quando o estabelecimento já existe na base
- ✅ Mais rápido e previsível
- ✅ Usa dados auditados do banco
- ❌ Não funciona sem produtos cadastrados

### Modo SEARCH

- ✅ Funciona mesmo sem dados prévios
- ✅ Busca informações atualizadas e reais
- ✅ Ideal para novos estabelecimentos
- ❌ Pode ser mais lento (envolve busca web)
- ❌ Requer ao menos o nome do estabelecimento

---

## Categorias Válidas

```
Restaurantes
Agenda
Dates
Cultural
Parques
Compras
Lazer
Social
Bem-estar
Bares
Cafés
Baladas
Comemorações
```

---

## Dicas de Uso no Frontend

1. **Usar `context=local` por padrão** se o établissement estiver na base
2. **Considerar UX em search**: pode levar 15-45s devido a busca web
3. **Validar quantidade**: limita-se a 1-10 sugestões
4. **Tratamento de preço**: enviar ou `price_range` OU `min_price`+`max_price`, não ambos

---

## Exemplo de Fluxo Frontend

```javascript
// 1. Se você sabe o place_id do estabelecimento:
const response = await fetch('/api/suggestions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    context: 'local',
    place_id: 'st-patrick-pub',
    suggestions_count: 4
  })
});

// 2. Se é um novo lugar e você tem apenas o nome:
const response = await fetch('/api/suggestions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    context: 'search',
    establishment_name: 'Novo Bar da Vila',
    city: 'São Paulo',
    address: 'Vila Madalena',
    suggestions_count: 4
  })
});

// 3. Processar resposta
const data = await response.json();
if (response.ok) {
  console.log('Experiências geradas:', data.experiencias);
} else {
  console.error('Erro:', data.message);
}
```
