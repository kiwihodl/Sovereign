/**
 * Course Creation Flow:
 * 1. Generate a new course ID
 * 2. Process each lesson:
 *    - If unpublished: create event, publish to Nostr, save to DB, delete draft
 *    - If published: use existing data
 * 3. Create and publish course event to Nostr
 * 4. Save course to database
 * 5. Show success message and redirect to course page
 */

const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newCourseId = uuidv4();
    const processedLessons = [];

    try {
        // Step 1: Process lessons
        for (const lesson of selectedLessons) {
            let noteId = lesson.noteId;

            if (!lesson.published_at) {
                // Publish unpublished lesson
                const event = createLessonEvent(lesson);
                const signedEvent = await window.nostr.signEvent(event);
                const published = await publish(signedEvent);

                if (!published) {
                    throw new Error(`Failed to publish lesson: ${lesson.title}`);
                }

                noteId = signedEvent.id;

                // Save to db and delete draft
                await Promise.all([
                    axios.post('/api/resources', {
                        id: lesson.id,
                        noteId: noteId,
                        userId: user.id,
                        price: lesson.price || 0,
                    }),
                    axios.delete(`/api/drafts/${lesson.id}`)
                ]);
            }

            processedLessons.push({ id: lesson.id, noteId: noteId });
        }

        // Step 2: Create and publish course
        const courseEvent = createCourseEvent(newCourseId, title, summary, coverImage, processedLessons);
        const signedCourseEvent = await window.nostr.signEvent(courseEvent);
        const published = await publish(signedCourseEvent);

        if (!published) {
            throw new Error('Failed to publish course');
        }

        // Step 3: Save course to db
        await axios.post('/api/courses', {
            id: newCourseId,
            resources: {
                connect: processedLessons.map(lesson => ({ id: lesson.id }))
            },
            noteId: signedCourseEvent.id,
            userId: user.id,
            price: price || 0
        });

        // Step 4: Show success message and redirect
        showToast('success', 'Course created successfully');
        router.push(`/course/${newCourseId}`);

    } catch (error) {
        console.error('Error creating course:', error);
        showToast('error', error.message || 'Failed to create course. Please try again.');
    }
};

const createLessonEvent = (lesson) => ({
    kind: lesson.price ? 30402 : 30023,
    content: lesson.content,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
        ['d', lesson.id],
        ['title', lesson.title],
        ['summary', lesson.summary],
        ['image', lesson.image],
        ...lesson.topics.map(topic => ['t', topic]),
        ['published_at', Math.floor(Date.now() / 1000).toString()],
        ...(lesson.price ? [
            ['price', lesson.price],
            ['location', `https://plebdevs.com/${lesson.topics[1]}/${lesson.id}`]
        ] : [])
    ]
});

const createCourseEvent = (courseId, title, summary, coverImage, lessons) => ({
    kind: 30004,
    created_at: Math.floor(Date.now() / 1000),
    content: "",
    tags: [
        ['d', courseId],
        ['name', title],
        ['picture', coverImage],
        ['image', coverImage],
        ['description', summary],
        ['l', "Education"],
        ...lessons.map((lesson) => ['a', `${lesson.kind}:${lesson.pubkey}:${lesson.id}`]),
    ],
});