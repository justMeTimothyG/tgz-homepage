export type BlockType = 
  | 'paragraph' 
  | 'heading' 
  | 'list' 
  | 'code' 
  | 'math' 
  | 'component' 
  | 'link-reference';

export interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  content: string;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  listType: 'ordered' | 'unordered';
  items: string[];
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  language?: string;
  content: string;
}

export interface MathBlock extends BaseBlock {
  type: 'math';
  content: string;
  inline: boolean;
}

export interface ComponentBlock extends BaseBlock {
  type: 'component';
  componentName: string;
  props: Record<string, unknown>;
  isInteractive: boolean;
}

export interface LinkReferenceBlock extends BaseBlock {
  type: 'link-reference';
  postSlug: string;
  postTitle: string;
  displayType: 'inline' | 'card';
}

export type Block = 
  | ParagraphBlock 
  | HeadingBlock 
  | ListBlock 
  | CodeBlock 
  | MathBlock 
  | ComponentBlock 
  | LinkReferenceBlock;

export interface BlockEditorState {
  blocks: Block[];
  activeBlockId: string | null;
  isCommandPaletteOpen: boolean;
  commandPalettePosition: { x: number; y: number } | null;
}

export interface BlockAction {
  type: string;
  payload: unknown;
}

export interface BlockEditorActions {
  addBlock: (block: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  setActiveBlock: (id: string | null) => void;
  openCommandPalette: (position: { x: number; y: number }) => void;
  closeCommandPalette: () => void;
  importFromMarkdown: (markdown: string) => void;
  exportToMarkdown: () => string;
  resetBlockEditor: () => void;
}

export interface ComponentDefinition {
  name: string;
  displayName: string;
  description: string;
  category: string;
  props: Record<string, PropDefinition>;
  exampleProps: Record<string, unknown>;
  isInteractive: boolean;
  dependencies: string[];
}

export interface PropDefinition {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue?: unknown;
  description: string;
  options?: unknown[];
}