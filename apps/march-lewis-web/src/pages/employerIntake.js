/* March & Lewis — Employer intake page */

import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { initEmployerForm } from '../forms/employerForm.js';

mountHeader('employer');
mountFooter();
initEmployerForm();
