import { CardCoverColor } from '../../../shared/types';

export interface CardCoverStyle {
  key: CardCoverColor;
  label: string;
  accent: string;
  bgTint: string;
  border: string;
}

export const CARD_COVER_COLORS: CardCoverStyle[] = [
  { key: 'none', label: 'Polos', accent: 'transparent', bgTint: 'transparent', border: '#e0d2bf' },
  { key: 'terracotta', label: 'Terracotta', accent: '#c86d51', bgTint: 'rgba(200, 109, 81, 0.05)', border: '#ebd9c8' },
  { key: 'sage', label: 'Sage', accent: '#8a9a5b', bgTint: 'rgba(138, 154, 91, 0.05)', border: '#dbe2d4' },
  { key: 'ochre', label: 'Ochre', accent: '#e0a96d', bgTint: 'rgba(224, 169, 109, 0.05)', border: '#f2e3ce' },
  { key: 'rose', label: 'Dusty Rose', accent: '#b37d80', bgTint: 'rgba(179, 125, 128, 0.05)', border: '#e8d6d7' },
  { key: 'walnut', label: 'Walnut', accent: '#5a4d41', bgTint: 'rgba(90, 77, 65, 0.05)', border: '#dfd8d1' },
  { key: 'slate', label: 'Slate', accent: '#5b8296', bgTint: 'rgba(91, 130, 150, 0.05)', border: '#d3dde2' }
];

export function getCardCoverStyle(color?: CardCoverColor): CardCoverStyle {
  const found = CARD_COVER_COLORS.find((c) => c.key === color);
  return found || CARD_COVER_COLORS[0];
}
