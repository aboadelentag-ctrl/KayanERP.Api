import React from 'react';
import { AssetsPage } from '../assets/AssetsPage';

interface Props {
  onNavigate?: (tab: string) => void;
}

export const CratesPage: React.FC<Props> = ({ onNavigate }) => {
  return <AssetsPage initialTab="circulating" onNavigate={onNavigate} />;
};
