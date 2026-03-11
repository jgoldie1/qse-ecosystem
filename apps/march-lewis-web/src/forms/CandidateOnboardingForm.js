function CandidateOnboardingForm() {
  return `
    <form id="candidateOnboardingForm" class="form">
      <input name="name" type="text" placeholder="Full Name" required />
      <input name="email" type="email" placeholder="Email Address" required />
      <input name="phone" type="tel" placeholder="Phone Number" />
      <input name="skills" type="text" placeholder="Skills (comma-separated)" />
      <select name="availability">
        <option value="">Availability</option>
        <option value="immediate">Immediate</option>
        <option value="2weeks">2 Weeks Notice</option>
        <option value="1month">1 Month Notice</option>
      </select>
      <select name="type">
        <option value="">Preferred Employment Type</option>
        <option value="fulltime">Full-Time</option>
        <option value="parttime">Part-Time</option>
        <option value="contract">Contract</option>
        <option value="temp">Temporary</option>
      </select>
      <textarea name="bio" placeholder="Brief professional summary"></textarea>
      <button type="submit" class="btn primary">Join the Marketplace</button>
      <div id="candidateOnboardingResult" class="result"></div>
    </form>
  `;
}

module.exports = CandidateOnboardingForm;
