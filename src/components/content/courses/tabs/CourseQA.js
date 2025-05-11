import React from 'react';
import ZapThreadsWrapper from '@/components/ZapThreadsWrapper';

/**
 * Component to display course comments and Q&A section
 */
const CourseQA = ({ nAddress, isAuthorized, nsec, npub }) => {
  return (
    <div className="rounded-lg p-8 mt-4 bg-gray-800 max-mob:px-4">
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      {nAddress !== null && isAuthorized ? (
        <div className="px-4 max-mob:px-0">
          <ZapThreadsWrapper
            anchor={nAddress}
            user={nsec || npub || null}
            relays="wss://nos.lol/, wss://relay.damus.io/, wss://relay.snort.social/, wss://relay.nostr.band/, wss://relay.primal.net/, wss://nostrue.com/, wss://purplerelay.com/, wss://relay.devs.tools/"
            disable="zaps"
            isAuthorized={isAuthorized}
          />
        </div>
      ) : (
        <div className="text-center p-4 mx-4 bg-gray-800/50 rounded-lg">
          <p className="text-gray-400">
            Comments are only available to content purchasers, subscribers, and the content creator.
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseQA; 