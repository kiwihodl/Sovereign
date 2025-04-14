import React from 'react';
import { TabMenu } from 'primereact/tabmenu';
import GenericButton from '@/components/buttons/GenericButton';

export default function MenuTab({ items, activeIndex, onTabChange, sidebarVisible, onToggleSidebar, isMobileView = false }) {
  return (
    <div className="w-[100%] relative">
      <TabMenu
        className="w-full bg-transparent border-none"
        model={items}
        activeIndex={activeIndex}
        onTabChange={e => onTabChange(e.index)}
        pt={{
          tabmenu: {
            menu: ({ context }) => ({
              className: 'bg-transparent border-none',
            }),
            action: ({ context }) => ({
              className: 'bg-transparent border-none',
            }),
          },
        }}
      />
      
      {/* Sidebar toggle button positioned at the far right - hidden on mobile */}
      {!isMobileView && (
        <div className="absolute right-2 top-0 flex items-center h-full">
          <GenericButton
            icon={sidebarVisible 
              ? "pi pi-times" 
              : "pi pi-chevron-left"}
            onClick={onToggleSidebar}
            outlined={true}
            rounded={true}
            size="small"
            tooltip={sidebarVisible ? "Hide lessons" : "Show lessons"}
            tooltipOptions={{ position: 'bottom' }}
            aria-label="Toggle course lessons"
          />
        </div>
      )}
    </div>
  );
}
