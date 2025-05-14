import React, { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import Image from 'next/image';
import { useNDKContext } from '@/context/NDKContext';
import { useSession } from 'next-auth/react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { nip19 } from 'nostr-tools';

const UserBadges = ({ visible, onHide }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ndk } = useNDKContext();
  const { data: session } = useSession();

  // Define fetchBadges as a useCallback to prevent unnecessary recreations
  const fetchBadges = useCallback(async () => {
    if (!ndk || !session?.user?.pubkey) return;

    setLoading(true);
    try {
      // Fetch badge definitions (kind 30009)
      const badgeDefinitions = await ndk.fetchEvents({
        // todo: add the plebdevs hardcoded badge ids (probably in config?)
        ids: [
          '4054a68f028edf38cd1d71cc4693d4ff5c9c54b0b44532361fe6abb29530cbf6',
          '5d38fea9a3c1fb4c55c9635c3132d34608c91de640f772438faa1942677087a8',
          '3ba20936d66523adb6d71793649bc77f3cea34f50c21ec7bb2c041f936022214',
          '41edee5af6d4e833d11f9411c2c27cc48c14d2a3c7966ae7648568e825eda1ed',
        ],
      });

      // Fetch badge awards (kind 8) using fetchEvents instead of subscribe
      const badgeAwards = await ndk.fetchEvents({
        kinds: [8],
        // todo: add the plebdevs author pubkey
        authors: ['f33c8a9617cb15f705fc70cd461cfd6eaf22f9e24c33eabad981648e5ec6f741'],
        '#p': [session.user.pubkey],
      });

      // Create a map to store the latest badge for each definition
      const latestBadgeMap = new Map();

      // Process all awards
      for (const award of badgeAwards) {
        const definition = Array.from(badgeDefinitions).find(def => {
          const defDTag = def.tags.find(t => t[0] === 'd')?.[1];
          const awardATag = award.tags.find(t => t[0] === 'a')?.[1];
          return awardATag?.includes(defDTag);
        });

        if (definition) {
          const defId = definition.id;
          const currentBadge = {
            name: definition.tags.find(t => t[0] === 'name')?.[1] || 'Unknown Badge',
            description: definition.tags.find(t => t[0] === 'description')?.[1] || '',
            image: definition.tags.find(t => t[0] === 'image')?.[1] || '',
            thumbnail: definition.tags.find(t => t[0] === 'thumb')?.[1] || '',
            awardedOn: new Date(award.created_at * 1000).toISOString(),
            nostrId: award.id,
            naddr: nip19.naddrEncode({
              pubkey: definition.pubkey,
              kind: definition.kind,
              identifier: definition.tags.find(t => t[0] === 'd')?.[1],
            }),
          };

          // Only update if this is the first instance or if it's newer than the existing one
          if (
            !latestBadgeMap.has(defId) ||
            new Date(currentBadge.awardedOn) > new Date(latestBadgeMap.get(defId).awardedOn)
          ) {
            latestBadgeMap.set(defId, currentBadge);
          }
        }
      }

      // Convert map values to array for state update
      setBadges(Array.from(latestBadgeMap.values()));
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  }, [ndk, session?.user?.pubkey]);

  // Initial fetch effect
  useEffect(() => {
    if (visible) {
      fetchBadges();
    }
  }, [visible, fetchBadges]);

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal
      header="Your Badges"
      visible={visible}
      onHide={onHide}
      width="full"
      className="max-w-3xl"
    >
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <ProgressSpinner />
          </div>
        ) : badges.length === 0 ? (
          <div className="text-center text-gray-400">
            No badges earned yet. Get started on the Dev Journey to earn badges!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-xl p-6 flex flex-col items-center transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="relative w-32 h-32 mb-4">
                  <Image
                    src={badge.thumbnail || badge.image}
                    alt={badge.name}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <h3 className="text-white font-semibold text-xl mb-2">{badge.name}</h3>
                <p className="text-gray-400 text-center text-sm">{badge.description}</p>

                <div className="mt-4 flex flex-col items-center gap-2 w-full">
                  <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm">
                    Earned on {formatDate(badge.awardedOn)}
                  </div>

                  <a
                    href={`https://badges.page/a/${badge.naddr}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 transition-colors"
                  >
                    <i className="pi pi-external-link" />
                    View on Nostr
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserBadges;
