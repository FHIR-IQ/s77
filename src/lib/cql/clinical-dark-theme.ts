/**
 * Clinical Dark Theme for Monaco Editor
 * A professional dark theme with slate/blue tones for CQL editing
 * Designed for healthcare/clinical applications
 */

import type { editor } from 'monaco-editor';

export const clinicalDarkTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // Base tokens
    { token: '', foreground: 'e2e8f0', background: '0f172a' },
    { token: 'invalid', foreground: 'f87171' },

    // Comments - Muted slate
    { token: 'comment', foreground: '64748b', fontStyle: 'italic' },

    // Keywords - Bright blue
    { token: 'keyword', foreground: '60a5fa', fontStyle: 'bold' },
    { token: 'keyword.operator.logical', foreground: 'c084fc' },
    { token: 'keyword.operator.temporal', foreground: '22d3ee' },
    { token: 'keyword.operator.type', foreground: 'f472b6' },
    { token: 'keyword.operator.membership', foreground: 'a78bfa' },
    { token: 'keyword.temporal', foreground: '22d3ee' },
    { token: 'keyword.interval', foreground: '60a5fa' },

    // Types - Cyan/Teal
    { token: 'type', foreground: '2dd4bf' },
    { token: 'type.fhir', foreground: '34d399', fontStyle: 'bold' },
    { token: 'type.system', foreground: '5eead4' },
    { token: 'type.model', foreground: '2dd4bf', fontStyle: 'bold' },
    { token: 'type.context', foreground: '06b6d4' },
    { token: 'type.library', foreground: 'a78bfa' },

    // Identifiers
    { token: 'identifier', foreground: 'e2e8f0' },
    { token: 'identifier.type', foreground: 'cbd5e1' },

    // Variables and definitions - Gold/Yellow
    { token: 'variable.definition', foreground: 'fbbf24', fontStyle: 'bold' },
    { token: 'variable.parameter', foreground: 'fb923c' },
    { token: 'variable.valueset', foreground: 'a3e635' },
    { token: 'variable.codesystem', foreground: '86efac' },
    { token: 'variable.code', foreground: '4ade80' },
    { token: 'variable.concept', foreground: '22c55e' },
    { token: 'variable.alias', foreground: 'e879f9' },

    // Functions - Purple
    { token: 'function.builtin', foreground: 'c084fc' },

    // FHIR specific
    { token: 'property.fhir', foreground: '94a3b8' },

    // Strings - Green shades
    { token: 'string', foreground: '86efac' },
    { token: 'string.identifier', foreground: 'fcd34d' },
    { token: 'string.version', foreground: 'fb923c' },
    { token: 'string.escape', foreground: '2dd4bf' },
    { token: 'string.invalid', foreground: 'f87171', background: '7f1d1d' },

    // Numbers - Orange/Peach
    { token: 'number', foreground: 'fb923c' },
    { token: 'number.float', foreground: 'fdba74' },
    { token: 'number.quantity', foreground: 'fcd34d' },

    // Date/Time - Cyan
    { token: 'date', foreground: '67e8f9' },

    // Constants
    { token: 'constant.boolean', foreground: 'c084fc' },
    { token: 'constant.null', foreground: '94a3b8', fontStyle: 'italic' },

    // Operators - Light blue
    { token: 'operator', foreground: '7dd3fc' },

    // Delimiters
    { token: 'delimiter', foreground: '64748b' },
    { token: 'delimiter.colon', foreground: '94a3b8' },

    // Brackets - Slate
    { token: '@brackets', foreground: '94a3b8' },

    // Annotations
    { token: 'annotation', foreground: 'f472b6' },
  ],
  colors: {
    // Editor background - Deep slate
    'editor.background': '#0f172a',
    'editor.foreground': '#e2e8f0',

    // Selection - Blue tint
    'editor.selectionBackground': '#1e40af44',
    'editor.selectionHighlightBackground': '#1e40af22',
    'editor.inactiveSelectionBackground': '#1e40af22',

    // Current line
    'editor.lineHighlightBackground': '#1e293b',
    'editor.lineHighlightBorder': '#1e293b00',

    // Cursor
    'editorCursor.foreground': '#60a5fa',
    'editorCursor.background': '#0f172a',

    // Line numbers
    'editorLineNumber.foreground': '#475569',
    'editorLineNumber.activeForeground': '#94a3b8',

    // Gutter
    'editorGutter.background': '#0f172a',
    'editorGutter.addedBackground': '#22c55e',
    'editorGutter.modifiedBackground': '#3b82f6',
    'editorGutter.deletedBackground': '#ef4444',

    // Indentation guides
    'editorIndentGuide.background': '#1e293b',
    'editorIndentGuide.activeBackground': '#334155',

    // Brackets
    'editorBracketMatch.background': '#60a5fa22',
    'editorBracketMatch.border': '#60a5fa',

    // Whitespace
    'editorWhitespace.foreground': '#334155',

    // Minimap
    'minimap.background': '#0f172a',
    'minimap.selectionHighlight': '#1e40af44',
    'minimapSlider.background': '#1e293b44',
    'minimapSlider.hoverBackground': '#1e293b66',
    'minimapSlider.activeBackground': '#1e293b88',

    // Scrollbar
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#334155aa',
    'scrollbarSlider.hoverBackground': '#475569aa',
    'scrollbarSlider.activeBackground': '#64748baa',

    // Widget (autocomplete, hover)
    'editorWidget.background': '#1e293b',
    'editorWidget.border': '#334155',
    'editorWidget.foreground': '#e2e8f0',

    // Hover widget
    'editorHoverWidget.background': '#1e293b',
    'editorHoverWidget.border': '#334155',
    'editorHoverWidget.foreground': '#e2e8f0',

    // Suggest widget (autocomplete)
    'editorSuggestWidget.background': '#1e293b',
    'editorSuggestWidget.border': '#334155',
    'editorSuggestWidget.foreground': '#e2e8f0',
    'editorSuggestWidget.selectedBackground': '#334155',
    'editorSuggestWidget.highlightForeground': '#60a5fa',

    // Find/Replace
    'editor.findMatchBackground': '#fbbf2444',
    'editor.findMatchHighlightBackground': '#fbbf2422',
    'editor.findRangeHighlightBackground': '#60a5fa11',

    // Error/Warning markers
    'editorError.foreground': '#f87171',
    'editorWarning.foreground': '#fbbf24',
    'editorInfo.foreground': '#60a5fa',

    // Overview ruler (right scrollbar markers)
    'editorOverviewRuler.border': '#334155',
    'editorOverviewRuler.errorForeground': '#f87171',
    'editorOverviewRuler.warningForeground': '#fbbf24',
    'editorOverviewRuler.infoForeground': '#60a5fa',

    // Peek view
    'peekView.border': '#3b82f6',
    'peekViewEditor.background': '#0f172a',
    'peekViewResult.background': '#1e293b',
    'peekViewTitle.background': '#1e293b',

    // Input fields
    'input.background': '#1e293b',
    'input.border': '#334155',
    'input.foreground': '#e2e8f0',
    'input.placeholderForeground': '#64748b',
    'inputOption.activeBorder': '#3b82f6',

    // Dropdown
    'dropdown.background': '#1e293b',
    'dropdown.border': '#334155',
    'dropdown.foreground': '#e2e8f0',

    // Lists
    'list.activeSelectionBackground': '#334155',
    'list.activeSelectionForeground': '#e2e8f0',
    'list.hoverBackground': '#1e293b',
    'list.inactiveSelectionBackground': '#1e293b',

    // Focus border
    'focusBorder': '#3b82f6',

    // Ruler
    'editorRuler.foreground': '#1e293b',
  }
};

// Light theme variant for CQL
export const clinicalLightTheme: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    // Base tokens
    { token: '', foreground: '1e293b', background: 'ffffff' },
    { token: 'invalid', foreground: 'dc2626' },

    // Comments
    { token: 'comment', foreground: '64748b', fontStyle: 'italic' },

    // Keywords
    { token: 'keyword', foreground: '2563eb', fontStyle: 'bold' },
    { token: 'keyword.operator.logical', foreground: '7c3aed' },
    { token: 'keyword.operator.temporal', foreground: '0891b2' },
    { token: 'keyword.operator.type', foreground: 'db2777' },
    { token: 'keyword.operator.membership', foreground: '6d28d9' },
    { token: 'keyword.temporal', foreground: '0891b2' },
    { token: 'keyword.interval', foreground: '2563eb' },

    // Types
    { token: 'type', foreground: '0d9488' },
    { token: 'type.fhir', foreground: '059669', fontStyle: 'bold' },
    { token: 'type.system', foreground: '14b8a6' },
    { token: 'type.model', foreground: '0d9488', fontStyle: 'bold' },
    { token: 'type.context', foreground: '0891b2' },
    { token: 'type.library', foreground: '7c3aed' },

    // Identifiers
    { token: 'identifier', foreground: '334155' },
    { token: 'identifier.type', foreground: '475569' },

    // Variables
    { token: 'variable.definition', foreground: 'b45309', fontStyle: 'bold' },
    { token: 'variable.parameter', foreground: 'c2410c' },
    { token: 'variable.valueset', foreground: '65a30d' },
    { token: 'variable.codesystem', foreground: '16a34a' },
    { token: 'variable.code', foreground: '15803d' },
    { token: 'variable.concept', foreground: '059669' },
    { token: 'variable.alias', foreground: 'a21caf' },

    // Functions
    { token: 'function.builtin', foreground: '7c3aed' },

    // FHIR
    { token: 'property.fhir', foreground: '64748b' },

    // Strings
    { token: 'string', foreground: '15803d' },
    { token: 'string.identifier', foreground: 'a16207' },
    { token: 'string.version', foreground: 'c2410c' },
    { token: 'string.escape', foreground: '0d9488' },
    { token: 'string.invalid', foreground: 'dc2626', background: 'fecaca' },

    // Numbers
    { token: 'number', foreground: 'c2410c' },
    { token: 'number.float', foreground: 'ea580c' },
    { token: 'number.quantity', foreground: 'ca8a04' },

    // Date/Time
    { token: 'date', foreground: '0891b2' },

    // Constants
    { token: 'constant.boolean', foreground: '7c3aed' },
    { token: 'constant.null', foreground: '64748b', fontStyle: 'italic' },

    // Operators
    { token: 'operator', foreground: '0284c7' },

    // Delimiters
    { token: 'delimiter', foreground: '94a3b8' },
    { token: 'delimiter.colon', foreground: '64748b' },

    // Brackets
    { token: '@brackets', foreground: '64748b' },

    // Annotations
    { token: 'annotation', foreground: 'db2777' },
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#1e293b',
    'editor.selectionBackground': '#bfdbfe',
    'editor.lineHighlightBackground': '#f8fafc',
    'editorCursor.foreground': '#2563eb',
    'editorLineNumber.foreground': '#94a3b8',
    'editorLineNumber.activeForeground': '#475569',
    'editorIndentGuide.background': '#e2e8f0',
    'editorBracketMatch.background': '#dbeafe',
    'editorBracketMatch.border': '#3b82f6',
    'editorError.foreground': '#dc2626',
    'editorWarning.foreground': '#d97706',
    'editorInfo.foreground': '#2563eb',
  }
};
