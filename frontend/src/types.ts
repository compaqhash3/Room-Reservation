export const EQUIPMENT = ['Projector', 'TvScreen', 'VideoConferencing', 'Whiteboard'] as const;
export const STATUSES = ['Booked', 'Completed', 'Cancelled'] as const;

export type Equipment = (typeof EQUIPMENT)[number];
export type ReservationStatus = (typeof STATUSES)[number];

export interface Room {
  id: number; number: string; name: string; capacity: number; floor: number;
  description?: string; equipment: Equipment[]; isActive: boolean; imageUrl?: string;
}
export type RoomRequest = Omit<Room, 'id' | 'imageUrl'>;

export interface User { id: number; firstName: string; lastName: string; imageUrl?: string; activeReservations?: number }
export type UserRequest = Pick<User, 'firstName' | 'lastName'>;

export interface Reservation {
  id: number; roomId: number; roomName: string; organizerId: number; organizerName: string;
  title: string; start: string; end: string; attendees: number; status: ReservationStatus;
}
export interface ReservationRequest {
  roomId: number; organizerId: number; title: string; start: string; end: string; attendees: number;
}

export interface RoomUsage {
  roomId: number; number: string; name: string; reservations: number; booked: number; completed: number; cancelled: number;
  bookedHours: number; usedHours: number; utilizationPercent: number;
}
