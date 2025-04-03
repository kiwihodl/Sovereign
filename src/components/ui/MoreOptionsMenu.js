import React, { useRef } from 'react';
import { Menu } from 'primereact/menu';
import GenericButton from '@/components/buttons/GenericButton';

/**
 * A reusable component for displaying a "more options" menu with optional additional links section
 *
 * @param {Object} props - Component props
 * @param {Array} props.menuItems - Array of primary menu items
 * @param {Array} props.additionalLinks - Array of additional links to add to the menu
 * @param {boolean} props.isMobileView - Whether the view is mobile
 * @param {function} props.onLinkClick - Function to be called when a link is clicked
 */
const MoreOptionsMenu = ({
  menuItems,
  additionalLinks = [],
  isMobileView = false,
  onLinkClick = url => window.open(url, '_blank'),
}) => {
  const menuRef = useRef(null);

  // Create a copy of the menu items
  const updatedMenuItems = [...menuItems];

  // Add a separator and additional links if they exist
  if (additionalLinks && additionalLinks.length > 0) {
    // Add separator
    updatedMenuItems.push({ separator: true, className: 'my-2' });

    // Add header for additional links
    updatedMenuItems.push({
      label: 'EXTERNAL LINKS',
      disabled: true,
      className: 'text-sm font-semibold text-gray-400',
    });

    // Add each additional link
    additionalLinks.forEach((link, index) => {
      let hostname;
      try {
        hostname = new URL(link).hostname;
      } catch (e) {
        hostname = link; // Fallback if URL parsing fails
      }

      updatedMenuItems.push({
        label: `${hostname}`,
        icon: 'pi pi-external-link',
        command: () => onLinkClick(link),
      });
    });
  }

  return (
    <div className="more-options-menu">
      <Menu model={updatedMenuItems} popup ref={menuRef} />
      <GenericButton
        icon="pi pi-ellipsis-v"
        onClick={e => menuRef.current.toggle(e)}
        aria-label="More options"
        className="p-button-text"
        tooltip={isMobileView ? null : 'More options'}
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  );
};

export default MoreOptionsMenu;
