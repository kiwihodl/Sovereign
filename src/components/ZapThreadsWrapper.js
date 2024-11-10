import React, { useEffect, useRef } from 'react';

const ZapThreadsWrapper = ({ anchor, user, relays, disable }) => {
  // Create a ref to store the reference to the <div> element
  const zapRef = useRef(null);

  useEffect(() => {
    // Create a new <script> element
    const script = document.createElement('script');
    // Set the source URL of the script to load the ZapThreads library
    script.src = 'https://unpkg.com/zapthreads/dist/zapthreads.iife.js';
    // Set the script to load asynchronously
    script.async = true;

    // Function to handle the script load event
    const handleScriptLoad = () => {
      // Create a new <zap-threads> element
      const zapElement = document.createElement('zap-threads');
      zapElement.setAttribute('anchor', anchor);
      if (user) zapElement.setAttribute('user', user);
      zapElement.setAttribute('relays', relays.replace(/\s/g, ''));
      if (disable) zapElement.setAttribute('disable', disable);

      // Remove any existing <zap-threads> element before appending a new one
      if (zapRef.current && zapRef.current.firstChild) {
        zapRef.current.removeChild(zapRef.current.firstChild);
      }

      // Append the new <zap-threads> element to the <div> referenced by zapRef
      if (zapRef.current) {
        zapRef.current.appendChild(zapElement);
      }
    };

    // Attach the handleScriptLoad function to the script's load event
    script.addEventListener('load', handleScriptLoad);

    // Append the <script> element to the <body> of the document
    document.body.appendChild(script);

    // Cleanup function to remove the <zap-threads> element and the <script> element when the component is unmounted
    return () => {
      // Remove the <zap-threads> element from the <div> referenced by zapRef
      if (zapRef.current && zapRef.current.firstChild) {
        zapRef.current.removeChild(zapRef.current.firstChild);
      }
      // Remove the <script> element from the <body> of the document
      document.body.removeChild(script);
      // Remove the load event listener from the script
      script.removeEventListener('load', handleScriptLoad);
    };
  }, [anchor, user, relays, disable]);

  // Render a <div> element and attach the zapRef to it
  return <div className="overflow-x-hidden" ref={zapRef} />;
};

export default ZapThreadsWrapper;