import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

/**
 * A generic modal component based on PrimeReact Dialog with dark styling
 * @param {Object} props - Component props
 * @param {string} props.header - Modal header text
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Function} props.onHide - Function to call when modal is closed
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.className - Additional CSS classes for the modal
 * @param {Object} props.style - Additional inline styles for the modal
 * @param {string} props.width - Width of the modal (fit, full, or pixel value)
 * @param {React.ReactNode} props.footer - Custom footer content
 * @param {Object} props.headerStyle - Additional styles for the header
 * @param {Object} props.contentStyle - Additional styles for the content
 * @param {Object} props.footerStyle - Additional styles for the footer
 * @param {Object} props.breakpoints - Responsive breakpoints (e.g. {'960px': '75vw'})
 * @param {boolean} props.modal - Whether the modal requires a click on the mask to hide
 * @param {boolean} props.draggable - Whether the modal is draggable
 * @param {boolean} props.resizable - Whether the modal is resizable
 * @param {boolean} props.maximizable - Whether the modal can be maximized
 * @param {boolean} props.dismissableMask - Whether clicking outside closes the modal
 * @param {boolean} props.showCloseButton - Whether to show the default close button in the footer
 */
const Modal = ({
  header,
  visible,
  onHide,
  children,
  className = '',
  style = {},
  width = 'fit',
  footer,
  headerStyle = {},
  contentStyle = {},
  footerStyle = {},
  breakpoints,
  modal,
  draggable,
  resizable,
  maximizable,
  dismissableMask,
  showCloseButton = false,
  ...otherProps
}) => {
  // Base dark styling
  const baseStyle = { backgroundColor: '#1f2937' };
  const baseHeaderStyle = { backgroundColor: '#1f2937', color: 'white' };
  const baseContentStyle = { backgroundColor: '#1f2937' };
  const baseFooterStyle = { backgroundColor: '#1f2937', borderTop: '1px solid #374151' };
  
  // Determine width class
  let widthClass = '';
  if (width === 'fit') {
    widthClass = 'w-fit';
  } else if (width === 'full') {
    widthClass = 'w-full';
  } else {
    // Custom width will be handled via style
    style.width = width;
  }

  // Create footer with close button if requested
  const footerContent = showCloseButton ? (
    <div className="flex justify-end w-full">
      <Button 
        label="Close" 
        icon="pi pi-times" 
        onClick={onHide} 
        className="p-button-text text-white"
      />
    </div>
  ) : footer;

  // Apply tailwind CSS to modify dialog elements
  const dialogClassNames = `
    .p-dialog-footer {
      background-color: #1f2937 !important;
      border-top: 1px solid #374151 !important;
    }
  `;

  return (
    <>
      <style jsx global>{dialogClassNames}</style>
      <Dialog
        header={header}
        visible={visible}
        onHide={onHide}
        className={`p-fluid pb-0 ${widthClass} ${className}`}
        style={{ ...baseStyle, ...style }}
        headerStyle={{ ...baseHeaderStyle, ...headerStyle }}
        contentStyle={{ ...baseContentStyle, ...contentStyle }}
        footerStyle={{ ...baseFooterStyle, ...footerStyle }}
        footer={footerContent}
        breakpoints={breakpoints}
        modal={modal}
        draggable={draggable}
        resizable={resizable}
        maximizable={maximizable}
        dismissableMask={dismissableMask}
        {...otherProps}
      >
        {children}
      </Dialog>
    </>
  );
};

export default Modal; 