function EmployerIntakeForm() {
  return `
    <form id="employerIntakeForm" class="form">
      <input name="company" type="text" placeholder="Company Name" required />
      <input name="contact" type="text" placeholder="Contact Name" required />
      <input name="email" type="email" placeholder="Contact Email" required />
      <input name="phone" type="tel" placeholder="Phone Number" />
      <input name="role" type="text" placeholder="Position to Fill" required />
      <select name="type">
        <option value="">Employment Type</option>
        <option value="fulltime">Full-Time</option>
        <option value="parttime">Part-Time</option>
        <option value="contract">Contract</option>
        <option value="temp">Temporary</option>
      </select>
      <textarea name="requirements" placeholder="Job requirements and description"></textarea>
      <button type="submit" class="btn primary">Submit Request</button>
      <div id="employerIntakeResult" class="result"></div>
    </form>
  `;
}

module.exports = EmployerIntakeForm;
