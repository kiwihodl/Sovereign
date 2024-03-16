import React, { useEffect } from 'react';
import CoursesCarousel from '@/components/courses/CoursesCarousel'
import WorkshopsCarousel from '@/components/workshops/WorkshopsCarousel'
import MenuTab from '@/components/menutab/MenuTab'
import { useNostr } from '@/hooks/useNostr'

const homeItems = [
    { label: 'Top', icon: 'pi pi-star' },
    { label: 'Courses', icon: 'pi pi-desktop' },
    { label: 'Workshops', icon: 'pi pi-cog' },
    { label: 'Resources', icon: 'pi pi-book' },
    { label: 'Streams', icon: 'pi pi-video' }
  ];

export default function Content() {
  const { fetchResources, fetchCourses } = useNostr();

  useEffect(() => {
    fetchResources();
    fetchCourses();
  }, [fetchResources, fetchCourses]);

  return (
      <main>
        <MenuTab items={homeItems} />
        <CoursesCarousel />
        <WorkshopsCarousel />
      </main>
  )
}
