# Guia de Atualização de Cores para Dark Theme

## Substituições Necessárias:

### Backgrounds:
- `bg-red-strong` → `bg-dark-bg`
- `bg-white` → `bg-dark-surface`
- `bg-red-dark` → `bg-dark-surface` (ou manter para hover states)

### Bordas:
- `border-red-dark` → `border-dark-border`
- `border-2 border-red-dark` → `border-2 border-dark-border`

### Textos:
- `text-black-dark` → `text-text-light`
- `text-white` → `text-text-light` (quando em fundo escuro)
- `text-gray-600` → `text-text-muted`

### Botões Primários:
- `bg-red-strong text-white` → `bg-gold-primary text-dark-bg`
- `bg-red-dark` → `bg-gold-dark` (para hover)
- `hover:bg-red-dark` → `hover:bg-gold-light`

### Botões Secundários:
- `bg-yellow-gold text-black-dark` → `bg-gold-primary text-dark-bg`
- `hover:bg-opacity-90` → `hover:bg-gold-light`

### Focus States:
- `focus:ring-red-strong` → `focus:ring-gold-primary`
- `focus:border-red-strong` → `focus:border-gold-primary`

### Cards e Containers:
- Cards brancos → `bg-dark-surface border-dark-border`
- Inputs → `bg-dark-bg border-dark-border text-text-light`


