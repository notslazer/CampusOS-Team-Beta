import { z } from 'zod';
import { api } from './api';

/**
 * Event Creation Schema (Zod)
 * 
 * Validates event data before submission to the backend.
 * Used for both client-side validation and type safety.
 */
export const eventCreationSchema = z.object({
  title: z
    .string()
    .min(3, 'Event title must be at least 3 characters')
    .max(100, 'Event title must not exceed 100 characters')
    .describe('Event title'),
  
  description: z
    .string()
    .min(10, 'Event description must be at least 10 characters')
    .max(2000, 'Event description must not exceed 2000 characters')
    .describe('Detailed event description'),
  
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
    .refine(
      (val) => new Date(val) > new Date(),
      'Event date must be in the future'
    )
    .describe('Event date and time (ISO string)'),
  
  location: z
    .string()
    .min(2, 'Location must be at least 2 characters')
    .max(200, 'Location must not exceed 200 characters')
    .optional()
    .describe('Event location'),
  
  category: z
    .enum(['workshop', 'seminar', 'competition', 'cultural', 'sports', 'social', 'tech', 'other'])
    .optional()
    .describe('Event category'),
  
  capacity: z
    .number()
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .max(10000, 'Capacity cannot exceed 10000')
    .optional()
    .describe('Maximum number of attendees'),
  
  posterUrl: z
    .string()
    .url('Invalid URL format')
    .optional()
    .describe('Event poster image URL'),
  
  tags: z
    .array(z.string())
    .max(10, 'Cannot have more than 10 tags')
    .optional()
    .describe('Event tags for categorization'),
});

/**
 * Infer the TypeScript type from the Zod schema
 */
export type EventCreationPayload = z.infer<typeof eventCreationSchema>;

/**
 * Event Response Type
 */
export interface EventResponse {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  category?: string;
  capacity?: number;
  attendees: number;
  posterUrl?: string;
  tags?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Events Service
 * 
 * Handles all event-related API calls for leads and club members.
 * Includes validation, error handling, and type safety.
 */
export const eventsService = {
  /**
   * Create a new event (Lead-only)
   * 
   * @param payload - Event creation payload (validated with Zod schema)
   * @returns Created event data
   * @throws Error if validation fails or API call fails
   * 
   * @example
   * ```tsx
   * try {
   *   const event = await eventsService.createEvent({
   *     title: 'React Workshop',
   *     description: 'Learn advanced React patterns',
   *     date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
   *     location: 'Room 101',
   *     category: 'tech',
   *     capacity: 50,
   *   });
   * } catch (error) {
   *   console.error('Failed to create event:', error);
   * }
   * ```
   */
  async createEvent(payload: EventCreationPayload): Promise<EventResponse> {
    // Validate payload with Zod schema
    const validatedPayload = eventCreationSchema.parse(payload);

    const response = await api.post<EventResponse>('/events', validatedPayload);
    return response.data;
  },

  /**
   * Update an existing event (Lead-only)
   * 
   * @param eventId - ID of the event to update
   * @param payload - Partial event update payload
   * @returns Updated event data
   */
  async updateEvent(
    eventId: string,
    payload: Partial<EventCreationPayload>
  ): Promise<EventResponse> {
    // Validate partial payload
    const validatedPayload = eventCreationSchema.partial().parse(payload);

    const response = await api.put<EventResponse>(
      `/events/${eventId}`,
      validatedPayload
    );
    return response.data;
  },

  /**
   * Delete an event (Lead-only)
   * 
   * @param eventId - ID of the event to delete
   */
  async deleteEvent(eventId: string): Promise<void> {
    await api.delete(`/events/${eventId}`);
  },

  /**
   * Get event details
   * 
   * @param eventId - ID of the event
   * @returns Event data
   */
  async getEvent(eventId: string): Promise<EventResponse> {
    const response = await api.get<EventResponse>(`/events/${eventId}`);
    return response.data;
  },

  /**
   * Get all events with optional filtering
   * 
   * @param filters - Optional filter parameters
   * @returns Array of events
   */
  async getEvents(filters?: {
    category?: string;
    clubId?: string;
    skip?: number;
    limit?: number;
  }): Promise<EventResponse[]> {
    const response = await api.get<EventResponse[]>('/events', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Register/attend an event (Member)
   * 
   * @param eventId - ID of the event
   * @returns Updated event data
   */
  async registerForEvent(eventId: string): Promise<EventResponse> {
    const response = await api.post<EventResponse>(
      `/events/${eventId}/register`
    );
    return response.data;
  },

  /**
   * Unregister/leave an event (Member)
   * 
   * @param eventId - ID of the event
   */
  async unregisterFromEvent(eventId: string): Promise<void> {
    await api.post(`/events/${eventId}/unregister`);
  },
};

export default eventsService;
