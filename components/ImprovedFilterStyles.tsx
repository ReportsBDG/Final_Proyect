'use client'

// Estilos CSS mejorados que se pueden aplicar al panel de filtros existente
export const improvedFilterStyles = `
  /* Panel de filtros mejorado */
  .improved-filter-panel {
    background: linear-gradient(to bottom, #ffffff, #f8fafc);
    border-right: 2px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .dark .improved-filter-panel {
    background: linear-gradient(to bottom, #1f2937, #111827);
    border-right: 2px solid #374151;
  }

  /* Búsqueda mejorada */
  .improved-search-input {
    background: #ffffff;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 12px 16px 12px 44px;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .improved-search-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    outline: none;
  }

  .dark .improved-search-input {
    background: #374151;
    border-color: #4b5563;
    color: #ffffff;
  }

  .dark .improved-search-input:focus {
    border-color: #60a5fa;
  }

  /* Dropdowns mejorados */
  .improved-dropdown {
    background: #ffffff;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px 16px;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .improved-dropdown:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }

  .dark .improved-dropdown {
    background: #374151;
    border-color: #4b5563;
    color: #ffffff;
  }

  .dark .improved-dropdown:hover {
    border-color: #60a5fa;
    background: #4b5563;
  }

  /* Labels mejorados */
  .improved-label {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
    margin-bottom: 8px;
    display: block;
  }

  .dark .improved-label {
    color: #d1d5db;
  }

  /* Badges de conteo */
  .improved-badge {
    background: linear-gradient(to right, #3b82f6, #1d4ed8);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  }

  /* Botones mejorados */
  .improved-button {
    background: linear-gradient(to right, #3b82f6, #1d4ed8);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  }

  .improved-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
  }

  .improved-button-secondary {
    background: #f3f4f6;
    color: #374151;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.75rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .improved-button-secondary:hover {
    background: #e5e7eb;
  }

  .dark .improved-button-secondary {
    background: #4b5563;
    color: #d1d5db;
  }

  .dark .improved-button-secondary:hover {
    background: #6b7280;
  }

  /* Layout compacto */
  .improved-compact-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 16px;
    padding: 16px;
  }

  .improved-filters-grid {
    display: grid;
    gap: 12px;
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
  }

  /* Scrollbar personalizado */
  .improved-filters-grid::-webkit-scrollbar {
    width: 6px;
  }

  .improved-filters-grid::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  .improved-filters-grid::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .improved-filters-grid::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .dark .improved-filters-grid::-webkit-scrollbar-track {
    background: #374151;
  }

  .dark .improved-filters-grid::-webkit-scrollbar-thumb {
    background: #6b7280;
  }

  /* Summary card mejorado */
  .improved-summary-card {
    background: linear-gradient(135deg, #f8fafc, #e2e8f0);
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    margin-top: auto;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .dark .improved-summary-card {
    background: linear-gradient(135deg, #374151, #1f2937);
    border-color: #4b5563;
  }

  /* Animaciones */
  .improved-fade-in {
    animation: improvedFadeIn 0.3s ease-out;
  }

  @keyframes improvedFadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive */
  @media (max-width: 640px) {
    .improved-compact-layout {
      padding: 12px;
      gap: 12px;
    }
    
    .improved-search-input {
      padding: 10px 14px 10px 40px;
    }
  }
`

export default function ImprovedFilterStyles() {
  return (
    <style jsx global>{improvedFilterStyles}</style>
  )
}
