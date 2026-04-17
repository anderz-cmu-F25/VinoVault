const {
  createEvent,
  findEventById,
  findAllEvents,
  saveEvent,
} = require("./socialEvent.repository");

async function createSocialEvent(currentUserId, payload) {
  const { name, location, eventDate, details } = payload;

  if (!name || !location || !eventDate || !details) {
    throw new Error("name, location, eventDate, and details are required.");
  }

  const event = await createEvent({
    name: name.trim(),
    location: location.trim(),
    eventDate: new Date(eventDate),
    details: details.trim(),
    hostUserId: currentUserId,
    participantUserIds: [currentUserId],
  });

  return event;
}

async function getAllSocialEvents() {
  return findAllEvents();
}

async function getSocialEventById(eventId) {
  const event = await findEventById(eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  return event;
}

async function joinSocialEvent(currentUserId, eventId) {
  const event = await findEventById(eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  if (event.participantUserIds.includes(currentUserId)) {
    throw new Error("User already joined this event.");
  }

  event.participantUserIds.push(currentUserId);
  await saveEvent(event);

  return event;
}

async function leaveSocialEvent(currentUserId, eventId) {
  const event = await findEventById(eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  if (event.hostUserId === currentUserId) {
    throw new Error("Host cannot leave their own event.");
  }

  if (!event.participantUserIds.includes(currentUserId)) {
    throw new Error("User is not a participant of this event.");
  }

  event.participantUserIds = event.participantUserIds.filter(
    (userId) => userId !== currentUserId
  );

  await saveEvent(event);

  return event;
}

module.exports = {
  createSocialEvent,
  getAllSocialEvents,
  getSocialEventById,
  joinSocialEvent,
  leaveSocialEvent,
};