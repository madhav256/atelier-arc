# Staff access

- Add staff: the person registers normally, then an admin opens Admin > Customers, finds them, sets Role to `advisor` or `admin`, and ticks Email verified if appropriate. Role changes end their existing sessions so the new role applies at next sign-in.
- Remove staff: set Role back to `customer` or tick Account disabled. Disabling ends all their sessions immediately. Reassign their open inquiries in Admin > Inquiries.
- Admins cannot remove their own admin role or disable themselves, so at least one admin always remains. Keep two admins at all times.
- Locked-out account (too many failed sign-ins): the lock clears automatically after 15 minutes, or the person can reset their password from the sign-in page.
- Every role change appears in Admin > Audit log with who made it.
