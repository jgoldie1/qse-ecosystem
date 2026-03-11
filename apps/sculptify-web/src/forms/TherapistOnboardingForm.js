function TherapistOnboardingForm() {
  return `
    <form id="therapistOnboardingForm" class="form">
      <input name="name" type="text" placeholder="Full Name" required />
      <input name="email" type="email" placeholder="Email Address" required />
      <input name="phone" type="tel" placeholder="Phone Number" />
      <select name="specialty">
        <option value="">Select Specialty</option>
        <option value="sculpting">Body Sculpting</option>
        <option value="massage">Massage Therapy</option>
        <option value="reiki">Reiki</option>
        <option value="acupuncture">Acupuncture</option>
        <option value="acupressure">Acupressure</option>
      </select>
      <input name="certifications" type="text" placeholder="Certifications (comma-separated)" />
      <textarea name="bio" placeholder="Short bio"></textarea>
      <button type="submit" class="btn primary">Submit Application</button>
      <div id="therapistOnboardingResult" class="result"></div>
    </form>
  `;
}

module.exports = TherapistOnboardingForm;
