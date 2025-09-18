import React from 'react';
import { UnifiedMenu } from './UnifiedMenu';
import { User } from '../types';

interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
  user: User | null;
  onSignOut: () => void;
  navigation?: any;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  visible,
  onClose,
  user,
  onSignOut,
  navigation,
}) => {
  return (
    <UnifiedMenu
      isOpen={visible}
      onClose={onClose}
      user={user}
      navigation={navigation}
    />
  );
};