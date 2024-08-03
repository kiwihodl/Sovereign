import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { useNostr } from '@/hooks/useNostr'

const AUTHOR_PUBKEY = process.env.NEXT_PUBLIC_AUTHOR_PUBKEY

export function useNostrQueries() {
  const [isClient, setIsClient] = useState(false)

  const { subscribe, fetchZapsForEvent, fetchZapsForEvents } = useNostr()
  const queryClient = useQueryClient()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchWorkshops = async () => {
    const filter = [{ kinds: [30023, 30402], authors: [AUTHOR_PUBKEY] }]
    const hasRequiredTags = (tags) => {
      const hasPlebDevs = tags.some(([tag, value]) => tag === "t" && value === "plebdevs")
      const hasWorkshop = tags.some(([tag, value]) => tag === "t" && value === "workshop")
      return hasPlebDevs && hasWorkshop
    }

    return new Promise((resolve) => {
      let workshops = []
      const subscription = subscribe(filter,
        {
          onevent: (event) => {
            if (hasRequiredTags(event.tags)) {
              workshops.push(event)
            }
          },
          onerror: (error) => {
            console.error('Error fetching workshops:', error)
            reject(error);
          },
          onclose: () => {
            resolve(workshops)
          },
        }
      )

      // Set a timeout to resolve the promise after collecting events
      setTimeout(() => {
        subscription?.close()
        resolve(workshops)
      }, 2000) // Adjust the timeout value as needed
    })
  }

  const fetchResources = async () => {
    console.log('fetching resources');
    const filter = [{ kinds: [30023, 30402], authors: [AUTHOR_PUBKEY] }];
    const hasRequiredTags = (tags) => {
      const hasPlebDevs = tags.some(([tag, value]) => tag === "t" && value === "plebdevs");
      const hasResource = tags.some(([tag, value]) => tag === "t" && value === "resource");
      return hasPlebDevs && hasResource;
    };

    return new Promise((resolve, reject) => {
      let resources = [];
      const subscription = subscribe(
        filter,
        {
          onevent: (event) => {
            if (hasRequiredTags(event.tags)) {
              resources.push(event);
            }
          },
          onerror: (error) => {
            console.error('Error fetching resources:', error);
            reject(error);
          },
          onclose: () => {
            resolve(resources);
          },
        }
      );

      // Set a timeout to resolve the promise after collecting events
      setTimeout(() => {
        subscription?.close();
        resolve(resources);
      }, 2000); // Adjust the timeout value as needed
    });
  }

  const fetchCourses = async () => {
    const filter = [{ kinds: [30004], authors: [AUTHOR_PUBKEY] }];
    // Do we need required tags for courses? community instead?
    // const hasRequiredTags = (tags) => {
    //     const hasPlebDevs = tags.some(([tag, value]) => tag === "t" && value === "plebdevs");
    //     const hasCourse = tags.some(([tag, value]) => tag === "t" && value === "course");
    //     return hasPlebDevs && hasCourse;
    // };

    return new Promise((resolve, reject) => {
      let courses = [];
      const subscription = subscribe(
        filter,
        {
          onevent: (event) => {
            // if (hasRequiredTags(event.tags)) {
            // courses.push(event);
            // }
            courses.push(event);
          },
          onerror: (error) => {
            console.error('Error fetching courses:', error);
            reject(error);
          },
          onclose: () => {
            resolve(courses);
          },
        }
      );

      setTimeout(() => {
        subscription?.close();
        resolve(courses);
      }, 2000);
    });
  }

  const { data: workshops, isLoading: workshopsLoading, error: workshopsError, refetch: refetchWorkshops } = useQuery({
    queryKey: ['workshops', isClient],
    queryFn: fetchWorkshops,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    enabled: isClient,
  })

  const { data: resources, isLoading: resourcesLoading, error: resourcesError, refetch: refetchResources } = useQuery({
    queryKey: ['resources', isClient],
    queryFn: fetchResources,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    enabled: isClient,
  })

  const { data: courses, isLoading: coursesLoading, error: coursesError, refetch: refetchCourses } = useQuery({
    queryKey: ['courses', isClient],
    queryFn: fetchCourses,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    enabled: isClient,
  })

  return {
    workshops,
    workshopsLoading,
    workshopsError,
    resources,
    resourcesLoading,
    resourcesError,
    courses,
    coursesLoading,
    coursesError,
    refetchCourses,
    refetchResources,
    refetchWorkshops,
  }
}