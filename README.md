=======================

Room Reservation System

=======================



=> Run (backend first)



**Backend** (.NET 9 SDK or newer)

&#x20;   cd backend/RoomBooking.Api
    dotnet run            -> http://localhost:5080


**Frontend** (Node 20+)

&#x20;   cd frontend
    npm install
    npm run dev           -> http://localhost:5173


**Unit tests**

&#x20;   cd backend/RoomBooking.Tests
    dotnet test


Architecture

============



* **Backend:** layered ASP.NET Core API: Controllers -> Services (interfaces) -> EF Core in-memory.
Single project with folders (Controllers, Services, Data, Models, Infrastructure), chosen to keep a small app simple.
* **Frontend:** React + TypeScript + Material UI. Pages -> Components -> Hooks -> typed API client; context providers for auth, theme and toasts.
No business logic in the UI.



Design patterns

===============



Strategy (one class per booking rule R1-R7), Dependency Injection, Service layer, Options pattern
(limits in "appsettings.json", validated on startup), DTO + Mapper, global exception handler (`{ code, message }`)



Assumptions

===========



* Overlap is strict: back-to-back meetings are allowed; cancelled reservations never block a room.
* R3 "overlap in date" is treated as overlap in time.
* A Booked reservation whose end time has passed is treated as Completed (updated when data is read).
* "Complete" ends the meeting now; the report compares used time with the originally booked time.
* All times are UTC on the API.



