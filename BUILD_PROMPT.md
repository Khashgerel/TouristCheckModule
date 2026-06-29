Act as an expert Full-Stack Web Developer and UI/UX Designer. Build a clean, modern Internal Booking Module web application for a tourist reception service center. 

The entire user interface (UI), labels, forms, buttons, and notifications must be in MONGOLIAN. The system architecture and logic should be robust.

### 1. User Roles & Authentication
- **Guides (Хөтөчүүд):** Can access a simple, mobile-friendly booking form to submit initial tour group data. They can only see/edit their own bookings.
- **Staff (Үйлчилгээний газрын ажилтан):** Has access to a comprehensive Dashboard featuring a Calendar View and a list view of all bookings.

### 2. Guide Booking Form (Хөтөчийн бүртгэлийн хэсэг)
Create a intuitive form in Mongolian with the following fields and validations:
- **Arrival Date & Time (Ирэх өдөр, цаг):** Date and time picker.
- **Number of Tourists (Жуулчдын тоо):** - Male (Эрэгтэй хүний тоо) - Number input
  - Female (Эмэгтэй хүний тоо) - Number input
- **Sauna/Service Check-in Count (Барианд орох хүний тоо):** - Male (Барианд орох эрэгтэй) - Number input
  - Female (Барианд орох эмэгтэй) - Number input
- **Guide Details (Хөтөчийн мэдээлэл):**
  - Last Name (Овог) - Text input
  - First Name (Нэр) - Text input
  - Phone Number (Утасны дугаар) - Validated phone input
- **Bus Number (Автобусны дугаар):** Text input (Optional / Заавал биш)

### 3. Staff Dashboard & Calendar View (Ажилтны хянах самбар)
- **Calendar Interface:** A responsive calendar (Monthly/Weekly/Daily view) that maps out all scheduled tourist arrivals. Each booking on the calendar should be color-coded based on its status.
- **Editable Window Logic (24-hour rule):** - Tourist numbers change frequently. Staff must be able to freely edit ANY data within 24 hours AFTER the scheduled arrival time ("Ирэх өдөр, цаг").
  - After this 24-hour window expires, the booking locks (becomes read-only) unless an admin overrides it.
- **Quick Summary:** Display a daily counter for total expected guests, total males, total females, and total people entering the service ("Барианд орох").

### 4. UI/UX & Localization Requirements
- **Language:** Localization completely in Mongolian (e.g., "Захиалгын маягт", "Календар харах", "Шинэчлэх", "Хадгалах").
- **Design System:** Clean, professional, modern Tailwind CSS layout. Use a soft, welcoming palette (e.g., emerald green, teal, or deep blues suitable for tourism/hospitality).
- **Responsiveness:** The Guide's form must be 100% mobile-first optimized (since guides use phones on the road). The Staff Dashboard should be optimized for Desktop/Tablets.

Please generate the complete, production-ready code with responsive navigation and mockup state management.