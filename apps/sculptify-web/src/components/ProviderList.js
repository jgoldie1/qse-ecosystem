const { escapeHtml } = require('../../../../shared/utils/escape');

function ProviderList(providers = [], availability = []) {
  return `
    <div class="scroll">
      ${providers.map((item) => {
        const slot = availability.find(entry =>
          (entry.provider_name || entry.providerName) === item.name
        );

        return `
          <div class="provider">
            <h3>${escapeHtml(item.name || '')}</h3>
            <p>${escapeHtml(item.specialty || '')}</p>
            <span>${escapeHtml(item.mode || '')}</span>
            <p>${slot ? `Next slot: ${escapeHtml(slot.slot_date || slot.slotDate)} ${escapeHtml(slot.slot_time || slot.slotTime)}` : 'No slot posted yet'}</p>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

module.exports = ProviderList;
