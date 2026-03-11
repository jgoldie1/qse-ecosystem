function BookingForm() {
  return `
    <form id="bookingForm" class="form">
      <input name="name" type="text" placeholder="Your Name" required />
      <input name="email" type="email" placeholder="Your Email" required />
      <select name="service">
        <option value="">Select a Service</option>
        <option value="sculpting">Body Sculpting</option>
        <option value="massage">Massage Therapy</option>
        <option value="reiki">Reiki</option>
        <option value="acupuncture">Acupuncture</option>
        <option value="acupressure">Acupressure</option>
        <option value="virtual">Virtual Care</option>
      </select>
      <input name="date" type="date" required />
      <textarea name="notes" placeholder="Additional notes (optional)"></textarea>
      <button type="submit" class="btn primary">Request Appointment</button>
      <div id="bookingResult" class="result"></div>
    </form>
  `;
}

module.exports = BookingForm;
